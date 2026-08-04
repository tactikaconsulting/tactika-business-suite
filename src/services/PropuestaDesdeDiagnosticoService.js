function valorBase(prospecto) {
  const valor = Number(prospecto?.valorEstimado || 0);
  if (valor > 0) return valor;
  if (prospecto?.necesidadUrgente || prospecto?.interesAlto) return 490000;
  return 199990;
}

function planSugerido(prospecto) {
  const valor = valorBase(prospecto);
  if (valor >= 900000) return "Sistema Tactika Enterprise";
  if (valor >= 400000) return "Sistema Tactika Profesional";
  return "Sistema Tactika Base";
}

function mensualidadSugerida(plan) {
  if (plan === "Sistema Tactika Enterprise") return 149900;
  if (plan === "Sistema Tactika Profesional") return 89900;
  return 49900;
}

function texto(valor, fallback) {
  return String(valor || "").trim() || fallback;
}

export function crearBorradorPropuestaDesdeDiagnostico(prospecto) {
  const plan = planSugerido(prospecto);
  const valorImplementacion = valorBase(prospecto);
  const valorMensual = mensualidadSugerida(plan);
  const problema = texto(
    prospecto?.problemaDetectado,
    "La empresa necesita ordenar su gestion y mejorar el seguimiento de sus procesos principales."
  );
  const dolor = texto(
    prospecto?.dolorPrincipal,
    "Actualmente existe informacion dispersa, poco control operativo y dificultad para priorizar acciones."
  );
  const necesidad = texto(
    prospecto?.necesidad,
    "Implementar una solucion simple para controlar clientes, tareas, propuestas, reportes y seguimiento."
  );

  return {
    titulo: `Propuesta Tactika para ${prospecto?.empresa || "prospecto"}`,
    plan,
    valorImplementacion,
    valorMensual,
    alcance: [
      "Esta propuesta nace del diagnostico comercial registrado en Tactika Suite.",
      "",
      `Problema detectado: ${problema}`,
      `Dolor principal: ${dolor}`,
      `Necesidad prioritaria: ${necesidad}`,
      "",
      "La implementacion considera configuracion inicial de Tactika Suite, adaptacion de modulos segun la realidad del cliente, carga base de informacion, capacitacion y puesta en marcha.",
      "",
      "El objetivo es que la empresa pueda trabajar con mayor orden, seguimiento claro y mejores datos para tomar decisiones.",
    ].join("\n"),
    condiciones: [
      "El valor de implementacion corresponde al alcance inicial definido en el diagnostico comercial.",
      "La mensualidad considera soporte, mejoras menores, seguimiento y acompanamiento segun el plan contratado.",
      "Nuevos modulos, integraciones o desarrollos especiales se cotizaran por separado antes de ejecutarse.",
      "La propuesta puede ajustarse despues de una reunion de validacion con el cliente.",
    ].join("\n"),
  };
}

export function prospectoTieneDiagnosticoComercial(prospecto) {
  return Boolean(
    prospecto?.problemaDetectado ||
      prospecto?.dolorPrincipal ||
      prospecto?.necesidad ||
      prospecto?.valorEstimado ||
      prospecto?.probabilidadCierre
  );
}
