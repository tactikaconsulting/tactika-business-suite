import { supabase } from "../lib/supabase";

function aInteraccion(fila) {
  return {
    id: fila.id,
    prospectoId: fila.prospecto_id,
    tipo: fila.tipo,
    titulo: fila.titulo,
    detalle: fila.detalle,
    resultado: fila.resultado,
    fechaInteraccion: fila.fecha_interaccion,
    createdAt: fila.created_at,
  };
}

function aColumnasDB(interaccion) {
  return {
    prospecto_id: interaccion.prospectoId,
    tipo: interaccion.tipo,
    titulo: interaccion.titulo,
    detalle: interaccion.detalle,
    resultado: interaccion.resultado,
    fecha_interaccion: interaccion.fechaInteraccion || new Date().toISOString(),
  };
}

export async function obtenerInteraccionesComerciales() {
  const { data, error } = await supabase
    .from("prospecto_interacciones")
    .select("*")
    .order("fecha_interaccion", { ascending: false });

  if (error) {
    console.warn("No se pudieron cargar interacciones comerciales", error.message);
    return [];
  }

  return data.map(aInteraccion);
}

export async function crearInteraccionComercial(interaccion) {
  const { error } = await supabase
    .from("prospecto_interacciones")
    .insert([aColumnasDB(interaccion)]);

  if (error) {
    console.error(error);
    throw error;
  }
}
