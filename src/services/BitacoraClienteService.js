import { supabase } from "../lib/supabase";

function aEvento(fila) {
  return {
    id: fila.id,
    clienteId: fila.cliente_id,
    tipo: fila.tipo,
    titulo: fila.titulo,
    detalle: fila.detalle,
    resultado: fila.resultado,
    proximoPaso: fila.proximo_paso,
    responsable: fila.responsable,
    visibleCliente: fila.visible_cliente,
    fechaEvento: fila.fecha_evento,
    createdAt: fila.created_at,
  };
}

function fechaEvento(valor) {
  if (!valor) return new Date().toISOString();
  return new Date(valor).toISOString();
}

function aColumnasDB(evento) {
  return {
    cliente_id: evento.clienteId,
    tipo: evento.tipo || "nota",
    titulo: evento.titulo,
    detalle: evento.detalle || null,
    resultado: evento.resultado || null,
    proximo_paso: evento.proximoPaso || null,
    responsable: evento.responsable || null,
    visible_cliente: Boolean(evento.visibleCliente),
    fecha_evento: fechaEvento(evento.fechaEvento),
    created_by: evento.createdBy,
  };
}

export async function obtenerBitacoraCliente(clienteId) {
  if (!clienteId) return [];

  const { data, error } = await supabase
    .from("bitacora_cliente")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha_evento", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return (data || []).map(aEvento);
}

export async function crearEventoBitacoraCliente(evento) {
  const { data: authData, error: errorAuth } = await supabase.auth.getUser();
  if (errorAuth || !authData?.user?.id) throw new Error("Sesion no encontrada.");

  const { error } = await supabase.from("bitacora_cliente").insert([
    aColumnasDB({
      ...evento,
      createdBy: authData.user.id,
    }),
  ]);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function eliminarEventoBitacoraCliente(id) {
  const { error } = await supabase.from("bitacora_cliente").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}
