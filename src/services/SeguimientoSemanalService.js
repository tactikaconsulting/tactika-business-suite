import { supabase } from "../lib/supabase";
import { obtenerResultadosDiarios } from "./ResultadosDiariosService";

function inicioSemana(fechaBase = new Date()) {
  const fecha = new Date(fechaBase);
  fecha.setHours(0, 0, 0, 0);
  const dia = fecha.getDay();
  const diferencia = dia === 0 ? -6 : 1 - dia;
  fecha.setDate(fecha.getDate() + diferencia);
  return fecha.toISOString().slice(0, 10);
}

function sumarDias(fechaTexto, dias) {
  const fecha = new Date(`${fechaTexto}T00:00:00`);
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function porcentaje(real, meta) {
  if (!meta) return real > 0 ? 100 : 0;
  return Math.min(100, Math.round((Number(real || 0) / Number(meta || 0)) * 100));
}

function tasa(parte, total) {
  if (!total) return 0;
  return Math.round((Number(parte || 0) / Number(total || 0)) * 100);
}

function aSeguimiento(fila) {
  return {
    id: fila.id,
    semanaInicio: fila.semana_inicio,
    metaContactos: Number(fila.meta_contactos || 0),
    metaRespuestas: Number(fila.meta_respuestas || 0),
    metaReuniones: Number(fila.meta_reuniones || 0),
    metaDiagnosticos: Number(fila.meta_diagnosticos || 0),
    metaPropuestas: Number(fila.meta_propuestas || 0),
    metaVentas: Number(fila.meta_ventas || 0),
    metaMonto: Number(fila.meta_monto || 0),
    focoSemana: fila.foco_semana || "",
    decisionSemana: fila.decision_semana || "",
    createdAt: fila.created_at,
  };
}

function aColumnasDB(seguimiento, userId) {
  return {
    semana_inicio: seguimiento.semanaInicio,
    meta_contactos: Number(seguimiento.metaContactos || 0),
    meta_respuestas: Number(seguimiento.metaRespuestas || 0),
    meta_reuniones: Number(seguimiento.metaReuniones || 0),
    meta_diagnosticos: Number(seguimiento.metaDiagnosticos || 0),
    meta_propuestas: Number(seguimiento.metaPropuestas || 0),
    meta_ventas: Number(seguimiento.metaVentas || 0),
    meta_monto: Number(seguimiento.metaMonto || 0),
    foco_semana: seguimiento.focoSemana || null,
    decision_semana: seguimiento.decisionSemana || null,
    created_by: userId,
    updated_at: new Date().toISOString(),
  };
}

function calcularRealSemana(resultados, semanaInicio) {
  const semanaFin = sumarDias(semanaInicio, 6);
  const registros = resultados.filter(
    (resultado) => resultado.fecha >= semanaInicio && resultado.fecha <= semanaFin
  );

  return registros.reduce(
    (acc, item) => ({
      prospectosContactados: acc.prospectosContactados + Number(item.prospectosContactados || 0),
      respuestasRecibidas: acc.respuestasRecibidas + Number(item.respuestasRecibidas || 0),
      reunionesAgendadas: acc.reunionesAgendadas + Number(item.reunionesAgendadas || 0),
      diagnosticosRealizados: acc.diagnosticosRealizados + Number(item.diagnosticosRealizados || 0),
      propuestasEnviadas: acc.propuestasEnviadas + Number(item.propuestasEnviadas || 0),
      ventasCerradas: acc.ventasCerradas + Number(item.ventasCerradas || 0),
      montoVendido: acc.montoVendido + Number(item.montoVendido || 0),
    }),
    {
      prospectosContactados: 0,
      respuestasRecibidas: 0,
      reunionesAgendadas: 0,
      diagnosticosRealizados: 0,
      propuestasEnviadas: 0,
      ventasCerradas: 0,
      montoVendido: 0,
    }
  );
}

function generarDiagnosticoSemana(seguimiento, real) {
  const respuesta = tasa(real.respuestasRecibidas, real.prospectosContactados);
  const reunion = tasa(real.reunionesAgendadas, real.respuestasRecibidas);
  const cierre = tasa(real.ventasCerradas, real.propuestasEnviadas);

  if (real.prospectosContactados < seguimiento.metaContactos * 0.6) {
    return "La prioridad es aumentar volumen de contacto. Agenda bloques diarios y no ajustes la oferta todavia.";
  }

  if (respuesta < 15 && real.prospectosContactados >= 10) {
    return "Hay contactos, pero poca respuesta. Conviene mejorar el mensaje inicial y hacerlo mas especifico por rubro.";
  }

  if (real.respuestasRecibidas > 0 && reunion < 30) {
    return "Hay interes, pero faltan reuniones. Ajusta el cierre del mensaje: ofrece una conversacion breve con hora concreta.";
  }

  if (real.propuestasEnviadas > 0 && cierre < 25) {
    return "Hay propuestas, pero bajo cierre. Revisa precio, urgencia y claridad del beneficio economico.";
  }

  if (real.ventasCerradas >= seguimiento.metaVentas && real.montoVendido >= seguimiento.metaMonto) {
    return "La semana va bien. Documenta que funciono y replica el mismo enfoque con nuevos prospectos.";
  }

  return "La semana esta activa. Mantener seguimiento, registrar aprendizajes y priorizar prospectos con mayor interes.";
}

export function obtenerSemanaActual() {
  return inicioSemana();
}

export async function obtenerSeguimientosSemanales() {
  const { data, error } = await supabase
    .from("seguimiento_semanal")
    .select("*")
    .order("semana_inicio", { ascending: false })
    .limit(12);

  if (error) {
    console.error(error);
    return [];
  }

  return (data || []).map(aSeguimiento);
}

export async function guardarSeguimientoSemanal(seguimiento) {
  const { data: authData, error: errorAuth } = await supabase.auth.getUser();
  if (errorAuth || !authData?.user?.id) throw new Error("Sesion no encontrada.");

  const { error } = await supabase
    .from("seguimiento_semanal")
    .upsert([aColumnasDB(seguimiento, authData.user.id)], { onConflict: "semana_inicio" });

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function eliminarSeguimientoSemanal(id) {
  const { error } = await supabase.from("seguimiento_semanal").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function obtenerPanelSeguimientoSemanal() {
  const [seguimientos, resultados] = await Promise.all([
    obtenerSeguimientosSemanales(),
    obtenerResultadosDiarios(),
  ]);

  const semana = seguimientos[0] || {
    semanaInicio: obtenerSemanaActual(),
    metaContactos: 50,
    metaRespuestas: 10,
    metaReuniones: 5,
    metaDiagnosticos: 3,
    metaPropuestas: 2,
    metaVentas: 1,
    metaMonto: 29990,
    focoSemana: "Conseguir conversaciones reales con duenos de pymes.",
    decisionSemana: "",
  };

  const real = calcularRealSemana(resultados, semana.semanaInicio);

  return {
    semana,
    seguimientos,
    resultados,
    real,
    avance: {
      contactos: porcentaje(real.prospectosContactados, semana.metaContactos),
      respuestas: porcentaje(real.respuestasRecibidas, semana.metaRespuestas),
      reuniones: porcentaje(real.reunionesAgendadas, semana.metaReuniones),
      diagnosticos: porcentaje(real.diagnosticosRealizados, semana.metaDiagnosticos),
      propuestas: porcentaje(real.propuestasEnviadas, semana.metaPropuestas),
      ventas: porcentaje(real.ventasCerradas, semana.metaVentas),
      monto: porcentaje(real.montoVendido, semana.metaMonto),
    },
    tasas: {
      respuesta: tasa(real.respuestasRecibidas, real.prospectosContactados),
      reunion: tasa(real.reunionesAgendadas, real.respuestasRecibidas),
      cierre: tasa(real.ventasCerradas, real.propuestasEnviadas),
    },
    recomendacion: generarDiagnosticoSemana(semana, real),
  };
}
