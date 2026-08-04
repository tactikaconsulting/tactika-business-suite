import { supabase } from "../lib/supabase";
import { obtenerResultadosDiarios } from "./ResultadosDiariosService";
import { obtenerVentasServicios } from "./VentaServicioService";

function mesActual() {
  return new Date().toISOString().slice(0, 7);
}

function porcentaje(real, meta) {
  if (!meta) return real > 0 ? 100 : 0;
  return Math.min(100, Math.round((Number(real || 0) / Number(meta || 0)) * 100));
}

function tasa(parte, total) {
  if (!total) return 0;
  return Math.round((Number(parte || 0) / Number(total || 0)) * 100);
}

function estaEnMes(fecha, mes) {
  return Boolean(fecha && fecha.slice(0, 7) === mes);
}

function aObjetivo(fila) {
  return {
    id: fila.id,
    mes: fila.mes,
    metaContactos: Number(fila.meta_contactos || 0),
    metaRespuestas: Number(fila.meta_respuestas || 0),
    metaReuniones: Number(fila.meta_reuniones || 0),
    metaDiagnosticos: Number(fila.meta_diagnosticos || 0),
    metaPropuestas: Number(fila.meta_propuestas || 0),
    metaClientes: Number(fila.meta_clientes || 0),
    metaVenta: Number(fila.meta_venta || 0),
    metaMensualidad: Number(fila.meta_mensualidad || 0),
    focoMes: fila.foco_mes || "",
    decisionMes: fila.decision_mes || "",
    createdAt: fila.created_at,
  };
}

function aColumnasDB(objetivo, userId) {
  return {
    mes: objetivo.mes,
    meta_contactos: Number(objetivo.metaContactos || 0),
    meta_respuestas: Number(objetivo.metaRespuestas || 0),
    meta_reuniones: Number(objetivo.metaReuniones || 0),
    meta_diagnosticos: Number(objetivo.metaDiagnosticos || 0),
    meta_propuestas: Number(objetivo.metaPropuestas || 0),
    meta_clientes: Number(objetivo.metaClientes || 0),
    meta_venta: Number(objetivo.metaVenta || 0),
    meta_mensualidad: Number(objetivo.metaMensualidad || 0),
    foco_mes: objetivo.focoMes || null,
    decision_mes: objetivo.decisionMes || null,
    created_by: userId,
    updated_at: new Date().toISOString(),
  };
}

function calcularRealMes(resultados, ventas, mes) {
  const registros = resultados.filter((resultado) => estaEnMes(resultado.fecha, mes));
  const ventasMes = ventas.filter((venta) => estaEnMes(venta.fechaContratacion, mes));
  const ventasPagadas = ventasMes.filter((venta) => ["Pagado", "Activo"].includes(venta.estado));

  const actividad = registros.reduce(
    (acc, item) => ({
      prospectosContactados: acc.prospectosContactados + Number(item.prospectosContactados || 0),
      respuestasRecibidas: acc.respuestasRecibidas + Number(item.respuestasRecibidas || 0),
      reunionesAgendadas: acc.reunionesAgendadas + Number(item.reunionesAgendadas || 0),
      diagnosticosRealizados: acc.diagnosticosRealizados + Number(item.diagnosticosRealizados || 0),
      propuestasEnviadas: acc.propuestasEnviadas + Number(item.propuestasEnviadas || 0),
      ventasCerradas: acc.ventasCerradas + Number(item.ventasCerradas || 0),
      montoVendidoResultados: acc.montoVendidoResultados + Number(item.montoVendido || 0),
    }),
    {
      prospectosContactados: 0,
      respuestasRecibidas: 0,
      reunionesAgendadas: 0,
      diagnosticosRealizados: 0,
      propuestasEnviadas: 0,
      ventasCerradas: 0,
      montoVendidoResultados: 0,
    }
  );

  const totalVendido = ventasPagadas.reduce((sum, venta) => sum + Number(venta.valor || 0), 0);
  const mensualidadActiva = ventas
    .filter((venta) => venta.modalidad === "Mensual" && ["Pagado", "Activo"].includes(venta.estado))
    .reduce((sum, venta) => sum + Number(venta.valor || 0), 0);

  return {
    ...actividad,
    clientesNuevos: ventasPagadas.length,
    totalVendido,
    mensualidadActiva,
  };
}

function generarDecisionMes(objetivo, real) {
  const respuesta = tasa(real.respuestasRecibidas, real.prospectosContactados);
  const reunion = tasa(real.reunionesAgendadas, real.respuestasRecibidas);
  const cierre = tasa(real.clientesNuevos, real.propuestasEnviadas);

  if (real.prospectosContactados < objetivo.metaContactos * 0.4) {
    return "El mes necesita mas actividad comercial. Prioriza bloques de prospeccion antes de seguir agregando funciones.";
  }

  if (respuesta < 12 && real.prospectosContactados >= 30) {
    return "Hay volumen, pero baja respuesta. El problema esta en el mensaje, canal o segmentacion.";
  }

  if (real.respuestasRecibidas > 0 && reunion < 25) {
    return "Hay respuestas, pero faltan reuniones. Conviene proponer horarios concretos y una oferta de diagnostico mas directa.";
  }

  if (real.propuestasEnviadas > 0 && cierre < 20) {
    return "Hay propuestas, pero bajo cierre. Revisa precio, urgencia, confianza y claridad del resultado prometido.";
  }

  if (real.totalVendido >= objetivo.metaVenta && real.mensualidadActiva >= objetivo.metaMensualidad) {
    return "El mes va sobre la meta. Documenta el canal que funciono y replica el proceso.";
  }

  return "El mes esta en desarrollo. Mantener prospeccion, medir respuesta y cerrar reuniones de diagnostico.";
}

export function obtenerMesActual() {
  return mesActual();
}

export async function obtenerObjetivosMensuales() {
  const { data, error } = await supabase
    .from("objetivos_mensuales")
    .select("*")
    .order("mes", { ascending: false })
    .limit(12);

  if (error) {
    console.error(error);
    return [];
  }

  return (data || []).map(aObjetivo);
}

export async function guardarObjetivoMensual(objetivo) {
  const { data: authData, error: errorAuth } = await supabase.auth.getUser();
  if (errorAuth || !authData?.user?.id) throw new Error("Sesion no encontrada.");

  const { error } = await supabase
    .from("objetivos_mensuales")
    .upsert([aColumnasDB(objetivo, authData.user.id)], { onConflict: "mes" });

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function eliminarObjetivoMensual(id) {
  const { error } = await supabase.from("objetivos_mensuales").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function obtenerPanelObjetivoMensual() {
  const [objetivos, resultados, ventas] = await Promise.all([
    obtenerObjetivosMensuales(),
    obtenerResultadosDiarios(120),
    obtenerVentasServicios(),
  ]);

  const objetivo = objetivos[0] || {
    mes: obtenerMesActual(),
    metaContactos: 200,
    metaRespuestas: 40,
    metaReuniones: 20,
    metaDiagnosticos: 12,
    metaPropuestas: 8,
    metaClientes: 3,
    metaVenta: 300000,
    metaMensualidad: 150000,
    focoMes: "Conseguir primeros clientes de pago para validar Tactika.",
    decisionMes: "",
  };

  const real = calcularRealMes(resultados, ventas, objetivo.mes);

  return {
    objetivo,
    objetivos,
    real,
    avance: {
      contactos: porcentaje(real.prospectosContactados, objetivo.metaContactos),
      respuestas: porcentaje(real.respuestasRecibidas, objetivo.metaRespuestas),
      reuniones: porcentaje(real.reunionesAgendadas, objetivo.metaReuniones),
      diagnosticos: porcentaje(real.diagnosticosRealizados, objetivo.metaDiagnosticos),
      propuestas: porcentaje(real.propuestasEnviadas, objetivo.metaPropuestas),
      clientes: porcentaje(real.clientesNuevos, objetivo.metaClientes),
      venta: porcentaje(real.totalVendido, objetivo.metaVenta),
      mensualidad: porcentaje(real.mensualidadActiva, objetivo.metaMensualidad),
    },
    tasas: {
      respuesta: tasa(real.respuestasRecibidas, real.prospectosContactados),
      reunion: tasa(real.reunionesAgendadas, real.respuestasRecibidas),
      cierre: tasa(real.clientesNuevos, real.propuestasEnviadas),
    },
    decision: generarDecisionMes(objetivo, real),
  };
}
