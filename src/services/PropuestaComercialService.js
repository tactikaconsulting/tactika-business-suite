import { supabase } from "../lib/supabase";

function aPropuesta(fila) {
  return {
    id: fila.id,
    prospectoId: fila.prospecto_id,
    titulo: fila.titulo,
    plan: fila.plan,
    valorImplementacion: fila.valor_implementacion,
    valorMensual: fila.valor_mensual,
    alcance: fila.alcance,
    condiciones: fila.condiciones,
    estado: fila.estado,
    fechaEnvio: fila.fecha_envio,
    createdAt: fila.created_at,
  };
}

function aColumnasDB(propuesta) {
  return {
    prospecto_id: propuesta.prospectoId,
    titulo: propuesta.titulo,
    plan: propuesta.plan,
    valor_implementacion: propuesta.valorImplementacion || 0,
    valor_mensual: propuesta.valorMensual || 0,
    alcance: propuesta.alcance,
    condiciones: propuesta.condiciones,
    estado: propuesta.estado || "Borrador",
    fecha_envio: propuesta.fechaEnvio || null,
  };
}

export async function obtenerPropuestasComerciales() {
  const { data, error } = await supabase
    .from("prospecto_propuestas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("No se pudieron cargar propuestas comerciales", error.message);
    return [];
  }

  return data.map(aPropuesta);
}

export async function crearPropuestaComercial(propuesta) {
  const { data, error } = await supabase
    .from("prospecto_propuestas")
    .insert([aColumnasDB(propuesta)])
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return aPropuesta(data);
}

export async function actualizarEstadoPropuestaComercial(id, estado, fechaEnvio = null) {
  const cambios = {
    estado,
    updated_at: new Date().toISOString(),
  };

  if (estado === "Enviada") {
    cambios.fecha_envio = fechaEnvio || new Date().toISOString().slice(0, 10);
  }

  const { data, error } = await supabase
    .from("prospecto_propuestas")
    .update(cambios)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return aPropuesta(data);
}
