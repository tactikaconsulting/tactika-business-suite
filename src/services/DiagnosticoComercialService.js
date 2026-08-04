const areasDiagnostico = {
  ventas: {
    nombre: "Clientes y ventas",
    modulo: "CRM Comercial",
    plan: "Diagnostico + CRM Comercial",
    valorSugerido: 199990,
    propuesta:
      "Ordenar prospectos, seguimiento, propuestas y cierre comercial en un solo flujo.",
  },
  inventario: {
    nombre: "Inventario y stock",
    modulo: "Inventario",
    plan: "Diagnostico + modulo Inventario",
    valorSugerido: 299990,
    propuesta:
      "Controlar productos, stock critico, compras y rotacion para reducir perdidas.",
  },
  agenda: {
    nombre: "Agenda y atencion",
    modulo: "Agenda y Seguimiento",
    plan: "Diagnostico + Agenda Operativa",
    valorSugerido: 199990,
    propuesta:
      "Ordenar citas, visitas, recordatorios y atencion de clientes desde un calendario operativo.",
  },
  documentos: {
    nombre: "Documentos y gestion interna",
    modulo: "Gestion documental",
    plan: "Diagnostico + Gestion Documental",
    valorSugerido: 249990,
    propuesta:
      "Centralizar contratos, informes, archivos y responsabilidades por cliente o proyecto.",
  },
  reportes: {
    nombre: "Reportes y decisiones",
    modulo: "Reportes y Dashboard",
    plan: "Diagnostico + Dashboard Ejecutivo",
    valorSugerido: 249990,
    propuesta:
      "Transformar datos dispersos en indicadores para tomar decisiones semanales.",
  },
  procesos: {
    nombre: "Procesos operativos",
    modulo: "Planes de Accion",
    plan: "Diagnostico + Plan de Trabajo",
    valorSugerido: 199990,
    propuesta:
      "Convertir problemas operativos en tareas, responsables, fechas y seguimiento real.",
  },
};

const estadosIniciales = ["Prospecto", "Contactado", "Diagnostico Agendado", "Diagnóstico Agendado"];

function sumarDias(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function normalizarNumero(valor, fallback = 0) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : fallback;
}

function calcularProbabilidad(formulario) {
  let puntaje = 25;

  if (formulario.urgencia === "Alta") puntaje += 25;
  if (formulario.urgencia === "Media") puntaje += 12;
  if (formulario.interes === "Alto") puntaje += 25;
  if (formulario.interes === "Medio") puntaje += 12;
  if (formulario.trabajoAdministrativo === "Alto") puntaje += 10;
  if (formulario.usaSoftware === "No") puntaje += 8;
  if (normalizarNumero(formulario.trabajadores) >= 10) puntaje += 8;

  return Math.min(90, puntaje);
}

function textoDiagnostico(prospecto, formulario, area, probabilidad) {
  const fecha = new Date().toLocaleDateString("es-CL");
  return [
    `Diagnostico comercial (${fecha})`,
    `Area prioritaria: ${area.nombre}`,
    `Problema observado: ${formulario.problema || "Gestion poco sistematizada"}`,
    `Dolor principal: ${formulario.dolor || "Falta de control y seguimiento"}`,
    `Urgencia: ${formulario.urgencia}`,
    `Interes: ${formulario.interes}`,
    `Modulo sugerido: ${area.modulo}`,
    `Probabilidad estimada: ${probabilidad}%`,
    `Proximo paso: ${formulario.proximoPaso || "Coordinar reunion de diagnostico"}`,
    prospecto?.empresa ? `Prospecto: ${prospecto.empresa}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function generarDiagnosticoComercial(prospecto, formulario) {
  const area = areasDiagnostico[formulario.area] || areasDiagnostico.ventas;
  const probabilidad = calcularProbabilidad(formulario);
  const valorEstimado = normalizarNumero(formulario.valorEstimado, area.valorSugerido);
  const problemaDetectado = formulario.problema || `${area.nombre} sin control centralizado`;
  const dolorPrincipal = formulario.dolor || "Perdida de tiempo, informacion dispersa y poca trazabilidad";
  const necesidad = formulario.necesidad || area.propuesta;
  const resumen = textoDiagnostico(prospecto, formulario, area, probabilidad);
  const observaciones = [prospecto?.observaciones, resumen].filter(Boolean).join("\n\n");
  const estadoActual = prospecto?.estado || "Prospecto";

  return {
    datosCRM: {
      ...prospecto,
      giro: prospecto?.giro || formulario.rubro || "",
      numTrabajadores: formulario.trabajadores || prospecto?.numTrabajadores || null,
      usaSoftware: formulario.usaSoftware === "Si",
      softwareActual: formulario.softwareActual,
      problemaDetectado,
      dolorPrincipal,
      necesidad,
      observaciones,
      muchoTrabajoAdministrativo: formulario.trabajoAdministrativo === "Alto",
      interesAlto: formulario.interes === "Alto",
      necesidadUrgente: formulario.urgencia === "Alta",
      valorEstimado,
      probabilidadCierre: probabilidad,
      fechaProximoContacto: formulario.fechaProximoContacto || sumarDias(2),
      estado: estadosIniciales.includes(estadoActual) ? "Diagnostico Realizado" : estadoActual,
    },
    recomendacion: {
      area: area.nombre,
      modulo: area.modulo,
      plan: area.plan,
      valorEstimado,
      probabilidad,
      propuestaValor: area.propuesta,
      mensajeSugerido: `Hola, soy Claudio Urra de Tactika Consulting. Por lo que vimos, ${prospecto?.empresa || "su empresa"} podria mejorar ${area.nombre.toLowerCase()} con un plan simple: diagnostico, implementacion y seguimiento. Me gustaria coordinar una reunion breve para mostrarle una propuesta concreta.`,
      guionLlamada: `Abrir con el problema de ${area.nombre.toLowerCase()}, confirmar como trabajan hoy y cerrar con una reunion de diagnostico de 20 minutos.`,
      proximoPaso: formulario.proximoPaso || "Agendar reunion de diagnostico y preparar propuesta inicial.",
    },
  };
}

export { areasDiagnostico };
