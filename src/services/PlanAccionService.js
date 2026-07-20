import { supabase } from "../lib/supabase";

export async function obtenerPlanes() {
  const { data, error } = await supabase
    .from("planes_accion")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((p) => ({
    id: p.id,
    clienteId: p.cliente_id,
    empresa: p.empresa,
    area: p.area,
    accion: p.accion,
    responsable: p.responsable,
    prioridad: p.prioridad,
    estado: p.estado,
    fecha: p.fecha,
  }));
}

export async function guardarPlan(plan) {
  const { error } = await supabase
    .from("planes_accion")
    .insert([
      {
        cliente_id: plan.clienteId,
        empresa: plan.empresa,
        area: plan.area,
        accion: plan.accion,
        responsable: plan.responsable,
        prioridad: plan.prioridad,
        estado: "Pendiente",
        fecha: new Date().toLocaleDateString("es-CL"),
      },
    ]);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function eliminarPlan(id) {
  const { error } = await supabase
    .from("planes_accion")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function actualizarEstado(id, estado) {
  const { error } = await supabase
    .from("planes_accion")
    .update({ estado })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}