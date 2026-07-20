import { supabase } from "../lib/supabase";

function aSeguimiento(fila) {
  return {
    id: fila.id,
    tarea: fila.tarea,
    responsable: fila.responsable,
    fecha: fila.fecha,
    estado: fila.estado,
    fechaCreacion: fila.fecha_creacion,
  };
}

export async function obtenerSeguimientos() {
  const { data, error } = await supabase
    .from("seguimientos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(aSeguimiento);
}

export async function guardarSeguimiento(seguimiento) {
  if (seguimiento.id) {
    const { error } = await supabase
      .from("seguimientos")
      .update({
        tarea: seguimiento.tarea,
        responsable: seguimiento.responsable,
        fecha: seguimiento.fecha,
        estado: seguimiento.estado,
      })
      .eq("id", seguimiento.id);

    if (error) {
      console.error(error);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from("seguimientos")
      .insert([
        {
          tarea: seguimiento.tarea,
          responsable: seguimiento.responsable,
          fecha: seguimiento.fecha,
          estado: seguimiento.estado,
          fecha_creacion: new Date().toLocaleDateString("es-CL"),
        },
      ]);

    if (error) {
      console.error(error);
      throw error;
    }
  }
}

export async function eliminarSeguimiento(id) {
  const { error } = await supabase
    .from("seguimientos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function obtenerEstadisticasSeguimiento() {
  const seguimientos = await obtenerSeguimientos();

  return {
    total: seguimientos.length,
    pendientes: seguimientos.filter((s) => s.estado === "Pendiente").length,
    proceso: seguimientos.filter((s) => s.estado === "En proceso").length,
    completados: seguimientos.filter((s) => s.estado === "Completado").length,
  };
}

export async function calcularAvance() {
  const seguimientos = await obtenerSeguimientos();

  if (seguimientos.length === 0) return 0;

  const completados = seguimientos.filter(
    (s) => s.estado === "Completado"
  ).length;

  return Math.round((completados / seguimientos.length) * 100);
}