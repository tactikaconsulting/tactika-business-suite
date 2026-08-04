import { obtenerPanelObjetivoMensual } from "./ObjetivoMensualService";
import { obtenerProspectos } from "./ProspectoService";
import { obtenerVentasServicios } from "./VentaServicioService";

function inicioDia() {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

function diferenciaDias(fechaTexto) {
  if (!fechaTexto) return null;
  const fecha = new Date(fechaTexto);
  fecha.setHours(0, 0, 0, 0);
  return Math.round((fecha - inicioDia()) / 86400000);
}

function etapaDecision(panelMensual) {
  const real = panelMensual.real;
  const objetivo = panelMensual.objetivo;
  const tasas = panelMensual.tasas;

  if (real.prospectosContactados < objetivo.metaContactos * 0.4) {
    return {
      etapa: "Volumen de contactos",
      estado: "Critico",
      problema: "Se estan generando pocas conversaciones nuevas.",
      decision: "Bloquear horario diario para contactar prospectos antes de seguir agregando funciones.",
      accion: "Contactar 10 empresas al dia durante los proximos 5 dias.",
    };
  }

  if (tasas.respuesta < 12 && real.prospectosContactados >= 30) {
    return {
      etapa: "Mensaje inicial",
      estado: "Atencion",
      problema: "Hay contactos, pero la respuesta es baja.",
      decision: "Ajustar el mensaje por rubro y hacerlo mas concreto.",
      accion: "Crear 3 versiones de mensaje: minimarket, taller y restaurante.",
    };
  }

  if (real.respuestasRecibidas > 0 && tasas.reunion < 25) {
    return {
      etapa: "Agenda de reuniones",
      estado: "Atencion",
      problema: "Hay respuestas, pero pocas reuniones agendadas.",
      decision: "Cerrar con una invitacion directa a diagnostico breve.",
      accion: "Ofrecer dos horarios concretos en cada respuesta.",
    };
  }

  if (real.propuestasEnviadas > 0 && tasas.cierre < 20) {
    return {
      etapa: "Propuesta y precio",
      estado: "Atencion",
      problema: "Hay propuestas, pero el cierre esta bajo.",
      decision: "Revisar claridad de valor, urgencia y precio de entrada.",
      accion: "Agregar comparacion antes/despues y descuento del diagnostico en implementacion.",
    };
  }

  if (real.totalVendido >= objetivo.metaVenta) {
    return {
      etapa: "Escalar lo que funciona",
      estado: "Bien",
      problema: "El mes esta respondiendo comercialmente.",
      decision: "Documentar el canal que funciono y repetirlo.",
      accion: "Crear caso de exito y pedir referido al cliente cerrado.",
    };
  }

  return {
    etapa: "Seguimiento comercial",
    estado: "Activo",
    problema: "El negocio avanza, pero aun necesita consistencia.",
    decision: "Mantener prospeccion, registrar resultados y empujar reuniones.",
    accion: "Revisar prospectos sin seguimiento y mover oportunidades en el CRM.",
  };
}

function prioridadProspecto(prospecto) {
  const dias = diferenciaDias(prospecto.fechaProximoContacto);
  const vencido = dias !== null && dias < 0;
  const hoy = dias === 0;
  const indice = Number(prospecto.indiceTactika || 0);

  let puntaje = indice;
  if (vencido) puntaje += 30;
  if (hoy) puntaje += 20;
  if (prospecto.interesAlto) puntaje += 15;
  if (prospecto.necesidadUrgente) puntaje += 15;
  if (prospecto.estado === "Propuesta Enviada") puntaje += 20;
  if (prospecto.estado === "Negociacion") puntaje += 25;

  return {
    ...prospecto,
    puntajeDecision: puntaje,
    seguimientoVencido: vencido,
    seguimientoHoy: hoy,
  };
}

function generarAcciones(panelMensual, prospectos, ventas) {
  const decision = etapaDecision(panelMensual);
  const prospectosPriorizados = prospectos
    .filter((prospecto) => prospecto.estado !== "Cliente" && prospecto.estado !== "Perdido")
    .map(prioridadProspecto)
    .sort((a, b) => b.puntajeDecision - a.puntajeDecision)
    .slice(0, 6);

  const ventasPendientes = ventas.filter((venta) => venta.estado === "Pendiente").slice(0, 5);
  const propuestasSinCerrar = prospectos
    .filter((prospecto) => ["Propuesta Enviada", "Negociacion"].includes(prospecto.estado))
    .slice(0, 5);

  const acciones = [
    {
      titulo: decision.accion,
      tipo: "Decision principal",
      prioridad: decision.estado === "Critico" ? "Alta" : "Media",
    },
  ];

  if (prospectosPriorizados.length > 0) {
    acciones.push({
      titulo: `Contactar primero a ${prospectosPriorizados[0].empresa}.`,
      tipo: "Prospecto prioritario",
      prioridad: "Alta",
    });
  }

  if (propuestasSinCerrar.length > 0) {
    acciones.push({
      titulo: `Hacer seguimiento a ${propuestasSinCerrar.length} propuesta(s) abiertas.`,
      tipo: "Cierre comercial",
      prioridad: "Alta",
    });
  }

  if (ventasPendientes.length > 0) {
    acciones.push({
      titulo: `Ordenar ${ventasPendientes.length} venta(s) pendiente(s) de pago.`,
      tipo: "Cobranza",
      prioridad: "Media",
    });
  }

  return { decision, prospectosPriorizados, ventasPendientes, propuestasSinCerrar, acciones };
}

export async function obtenerTableroDecisiones() {
  const [panelMensual, prospectos, ventas] = await Promise.all([
    obtenerPanelObjetivoMensual(),
    obtenerProspectos(),
    obtenerVentasServicios(),
  ]);

  const analisis = generarAcciones(panelMensual, prospectos, ventas);

  return {
    panelMensual,
    prospectos,
    ventas,
    ...analisis,
  };
}
