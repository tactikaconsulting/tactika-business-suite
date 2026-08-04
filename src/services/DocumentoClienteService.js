import { supabase } from "../lib/supabase";

function aDocumento(fila) {
  return {
    id: fila.id,
    clienteId: fila.cliente_id,
    titulo: fila.titulo,
    tipo: fila.tipo,
    url: fila.url,
    descripcion: fila.descripcion,
    visibleCliente: fila.visible_cliente,
    fechaDocumento: fila.fecha_documento,
    createdAt: fila.created_at,
  };
}

function aColumnasDB(documento) {
  return {
    cliente_id: documento.clienteId,
    titulo: documento.titulo,
    tipo: documento.tipo || "Documento",
    url: documento.url || null,
    descripcion: documento.descripcion || null,
    visible_cliente: Boolean(documento.visibleCliente),
    fecha_documento: documento.fechaDocumento || new Date().toISOString().slice(0, 10),
    created_by: documento.createdBy,
  };
}

export async function obtenerDocumentosCliente(clienteId) {
  if (!clienteId) return [];

  const { data, error } = await supabase
    .from("documentos_cliente")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha_documento", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return (data || []).map(aDocumento);
}

export async function crearDocumentoCliente(documento) {
  const { data: authData, error: errorAuth } = await supabase.auth.getUser();
  if (errorAuth || !authData?.user?.id) throw new Error("Sesion no encontrada.");

  const { error } = await supabase.from("documentos_cliente").insert([
    aColumnasDB({
      ...documento,
      createdBy: authData.user.id,
    }),
  ]);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function eliminarDocumentoCliente(id) {
  const { error } = await supabase.from("documentos_cliente").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}
