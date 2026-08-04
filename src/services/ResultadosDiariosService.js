import { supabase } from "../lib/supabase";

function aResultado(fila) {
  return {
    id: fila.id,
    fecha: fila.fecha,
    prospectosContactados: Number(fila.prospectos_contactados || 0),
    respuestasRecibidas: Number(fila.respuestas_recibidas || 0),
    reunionesAgendadas: Number(fila.reuniones_agendadas || 0),
    diagnosticosRealizados: Number(fila.diagnosticos_realizados || 0),
    propuestasEnviadas: Number(fila.propuestas_enviadas || 0),
    ventasCerradas: Number(fila.ventas_cerradas || 0),
    montoVendido: Number(fila.monto_vendido || 0),
    aprendizajes: fila.aprendizajes,
    bloqueos: fila.bloqueos,
    proximaMejora: fila.proxima_mejora,
    createdAt: fila.created_at,
  };
}

function aColumnasDB(resultado, userId) {
  return {
    fecha: resultado.fecha,
    prospectos_contactados: Number(resultado.prospectosContactados || 0),
    respuestas_recibidas: Number(resultado.respuestasRecibidas || 0),
    reuniones_agendadas: Number(resultado.reunionesAgendadas || 0),
    diagnosticos_realizados: Number(resultado.diagnosticosRealizados || 0),
    propuestas_enviadas: Number(resultado.propuestasEnviadas || 0),
    ventas_cerradas: Number(resultado.ventasCerradas || 0),
    monto_vendido: Number(resultado.montoVendido || 0),
    aprendizajes: resultado.aprendizajes || null,
    bloqueos: resultado.bloqueos || null,
    proxima_mejora: resultado.proximaMejora || null,
    created_by: userId,
    updated_at: new Date().toISOString(),
  };
}

export async function obtenerResultadosDiarios() {
  const { data, error } = await supabase
    .from("resultados_diarios")
    .select("*")
    .order("fecha", { ascending: false })
    .limit(30);

  if (error) {
    console.error(error);
    return [];
  }

  return (data || []).map(aResultado);
}

export async function guardarResultadoDiario(resultado) {
  const { data: authData, error: errorAuth } = await supabase.auth.getUser();
  if (errorAuth || !authData?.user?.id) throw new Error("Sesion no encontrada.");

  const { error } = await supabase
    .from("resultados_diarios")
    .upsert([aColumnasDB(resultado, authData.user.id)], { onConflict: "fecha" });

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function eliminarResultadoDiario(id) {
  const { error } = await supabase.from("resultados_diarios").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}
