import { supabase } from "../lib/supabase";

export async function obtenerDiagnosticos() {
  const { data, error } = await supabase
    .from("diagnosticos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((d) => ({
    id: d.id,
    clienteId: d.cliente_id,
    empresa: d.empresa,
    preguntas: d.preguntas,
    resultado: d.resultado,
    fecha: d.fecha,
    createdAt: d.created_at,
  }));
}

export async function guardarDiagnostico(diagnostico) {
  const { error } = await supabase
    .from("diagnosticos")
    .insert([
      {
        cliente_id: diagnostico.clienteId,
        empresa: diagnostico.empresa,
        preguntas: diagnostico.preguntas,
        resultado: diagnostico.resultado,
        fecha: new Date().toLocaleDateString("es-CL"),
      },
    ]);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function eliminarDiagnostico(id) {
  const { error } = await supabase
    .from("diagnosticos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export function obtenerResultado(preguntas) {
  const total = preguntas.reduce(
    (acumulado, pregunta) => acumulado + Number(pregunta.valor),
    0
  );

  const promedio = total / preguntas.length;

  return Math.round(promedio * 20);
}