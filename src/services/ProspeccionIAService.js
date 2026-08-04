import { crearProspectoSeguro } from "./ProspectoService";

const empresasBase = [
  {
    empresa: "Constructora Los Aromos",
    giro: "Construccion",
    comuna: "Buin",
    region: "Region Metropolitana",
    telefono: "+56 9 8123 4501",
    correo: "contacto@losaromos.cl",
    sitioWeb: "https://losaromos.cl",
    numTrabajadores: 28,
    problemaDetectado: "Control de obras, cotizaciones y documentacion dispersa.",
    dolorPrincipal: "Falta de seguimiento centralizado para proyectos y clientes.",
    necesidad: "Ordenar prospectos, propuestas, tareas y documentos.",
    estadoProspeccion: "Encontrada",
  },
  {
    empresa: "Inmobiliaria Valle Maipo",
    giro: "Inmobiliaria",
    comuna: "Paine",
    region: "Region Metropolitana",
    telefono: "+56 2 2830 1122",
    correo: "ventas@vallemaipo.cl",
    sitioWeb: "https://vallemaipo.cl",
    numTrabajadores: 16,
    problemaDetectado: "Leads digitales sin trazabilidad comercial.",
    dolorPrincipal: "Pierden oportunidades por falta de seguimiento.",
    necesidad: "CRM, agenda de visitas y control de propuestas.",
    estadoProspeccion: "Encontrada",
  },
  {
    empresa: "Taller MotoExpress",
    giro: "Taller mecanico",
    comuna: "San Bernardo",
    region: "Region Metropolitana",
    telefono: "+56 9 6450 7781",
    correo: "servicio@motoexpress.cl",
    sitioWeb: "",
    numTrabajadores: 9,
    problemaDetectado: "Ordenes de trabajo y clientes se gestionan por WhatsApp.",
    dolorPrincipal: "No existe historial claro de reparaciones y pagos.",
    necesidad: "Agenda, clientes, ordenes de trabajo y seguimiento.",
    estadoProspeccion: "Encontrada",
  },
  {
    empresa: "MiniMarket El Encuentro",
    giro: "Comercio minorista",
    comuna: "Maipu",
    region: "Region Metropolitana",
    telefono: "+56 9 7301 4488",
    correo: "",
    sitioWeb: "",
    numTrabajadores: 7,
    problemaDetectado: "Control de stock manual y poca visibilidad de ventas.",
    dolorPrincipal: "No sabe con precision que productos rotan mas.",
    necesidad: "Inventario, ventas, caja y reportes simples.",
    estadoProspeccion: "Encontrada",
  },
  {
    empresa: "Restaurante Don Raul",
    giro: "Restaurante",
    comuna: "Quilicura",
    region: "Region Metropolitana",
    telefono: "+56 9 5644 9012",
    correo: "reservas@donraul.cl",
    sitioWeb: "https://donraul.cl",
    numTrabajadores: 18,
    problemaDetectado: "Compras, reservas e inventario no estan integrados.",
    dolorPrincipal: "Dificultad para controlar costos y margen.",
    necesidad: "Inventario, compras, agenda y reportes de ventas.",
    estadoProspeccion: "Encontrada",
  },
  {
    empresa: "Comida Rapida El Maipino",
    giro: "Comida rapida",
    comuna: "Maipu",
    region: "Region Metropolitana",
    telefono: "+56 9 6220 1455",
    correo: "contacto@elmaipino.cl",
    sitioWeb: "",
    numTrabajadores: 14,
    problemaDetectado: "Pedidos, caja e inventario se controlan en canales separados.",
    dolorPrincipal: "No tiene una vista clara de ventas, stock y turnos.",
    necesidad: "Ventas, inventario, caja, agenda de pedidos y reportes.",
    estadoProspeccion: "Encontrada",
  },
  {
    empresa: "Burger Express Buin",
    giro: "Comida rapida",
    comuna: "Buin",
    region: "Region Metropolitana",
    telefono: "+56 9 5402 7788",
    correo: "",
    sitioWeb: "",
    numTrabajadores: 8,
    problemaDetectado: "Pedidos por WhatsApp sin control centralizado ni historial de clientes.",
    dolorPrincipal: "Se pierden pedidos, seguimientos y oportunidades de fidelizacion.",
    necesidad: "CRM simple, control de pedidos, caja y clientes frecuentes.",
    estadoProspeccion: "Encontrada",
  },
  {
    empresa: "Pollos y Sandwiches La Ruta",
    giro: "Comida rapida",
    comuna: "San Bernardo",
    region: "Region Metropolitana",
    telefono: "+56 9 7011 3902",
    correo: "ventas@laruta.cl",
    sitioWeb: "https://laruta.cl",
    numTrabajadores: 22,
    problemaDetectado: "Compras, turnos y ventas no se revisan desde un solo panel.",
    dolorPrincipal: "Dificultad para controlar costos y rendimiento diario.",
    necesidad: "Inventario, ventas, turnos y dashboard operativo.",
    estadoProspeccion: "Encontrada",
  },
  {
    empresa: "Servicios Industriales Norte",
    giro: "Servicios industriales",
    comuna: "Lampa",
    region: "Region Metropolitana",
    telefono: "+56 9 4332 1870",
    correo: "operaciones@sinorte.cl",
    sitioWeb: "https://sinorte.cl",
    numTrabajadores: 42,
    problemaDetectado: "Servicios tecnicos sin planificacion visible.",
    dolorPrincipal: "Seguimiento de contratos y visitas queda repartido en planillas.",
    necesidad: "CRM B2B, agenda de servicios y reportes.",
    estadoProspeccion: "Encontrada",
  },
  {
    empresa: "Ferreteria Colina Centro",
    giro: "Ferreteria",
    comuna: "Colina",
    region: "Region Metropolitana",
    telefono: "+56 2 2890 2244",
    correo: "",
    sitioWeb: "",
    numTrabajadores: 12,
    problemaDetectado: "Stock y ventas con registros poco conectados.",
    dolorPrincipal: "Dificultad para detectar quiebres de stock.",
    necesidad: "Inventario, ventas y compras.",
    estadoProspeccion: "Encontrada",
  },
];

function normalizar(valor) {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function contiene(valor, busqueda) {
  if (!busqueda) return true;
  return normalizar(valor).includes(normalizar(busqueda));
}

function comunasComoLista(comunas) {
  return String(comunas || "")
    .split(/,|\n/)
    .map((comuna) => normalizar(comuna))
    .filter(Boolean);
}

export function buscarEmpresasSimuladas(filtros) {
  const comunas = comunasComoLista(filtros.comunas);
  const palabrasClave = normalizar(filtros.palabrasClave);
  const maxTrabajadores = Number(filtros.maxTrabajadores || 0);

  return empresasBase
    .filter((empresa) => {
      const cumpleRubro = contiene(empresa.giro, filtros.rubro);
      const cumpleRegion = contiene(empresa.region, filtros.region);
      const cumpleComuna =
        comunas.length === 0 || comunas.includes(normalizar(empresa.comuna));
      const cumpleTrabajadores =
        !maxTrabajadores || Number(empresa.numTrabajadores) <= maxTrabajadores;
      const textoEmpresa = [
        empresa.empresa,
        empresa.giro,
        empresa.comuna,
        empresa.problemaDetectado,
        empresa.necesidad,
      ].join(" ");
      const cumplePalabras = !palabrasClave || normalizar(textoEmpresa).includes(palabrasClave);

      return cumpleRubro && cumpleRegion && cumpleComuna && cumpleTrabajadores && cumplePalabras;
    })
    .map((empresa, index) => ({
      ...empresa,
      idTemporal: `${normalizar(empresa.empresa).replace(/\s+/g, "-")}-${index}`,
      estadoProspeccion: "Encontrada",
      potencial: calcularPotencialEmpresa(empresa),
    }));
}

export async function agregarEmpresaEncontradaAlCRM(empresa) {
  return crearProspectoSeguro({
    empresa: empresa.empresa,
    giro: empresa.giro,
    comuna: empresa.comuna,
    region: empresa.region,
    telefono: empresa.telefono,
    correo: empresa.correo,
    sitioWeb: empresa.sitioWeb,
    numTrabajadores: empresa.numTrabajadores,
    problemaDetectado: empresa.problemaDetectado,
    dolorPrincipal: empresa.dolorPrincipal,
    necesidad: empresa.necesidad,
    origen: "Prospeccion IA",
    estado: "Prospecto",
    probabilidadCierre: empresa.potencial >= 70 ? 45 : 25,
    usaSoftware: false,
    muchoTrabajoAdministrativo: true,
    interesAlto: false,
    necesidadUrgente: empresa.potencial >= 70,
    observaciones: [
      "Empresa encontrada desde Prospeccion IA.",
      empresa.problemaDetectado,
      empresa.necesidad,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export function calcularPotencialEmpresa(empresa) {
  let puntaje = 20;
  if (!empresa.sitioWeb) puntaje += 10;
  if (!empresa.correo) puntaje += 8;
  if (Number(empresa.numTrabajadores) >= 10) puntaje += 18;
  if (Number(empresa.numTrabajadores) >= 25) puntaje += 12;
  if (empresa.problemaDetectado) puntaje += 20;
  if (empresa.necesidad) puntaje += 12;
  return Math.min(puntaje, 100);
}

export function generarRespuestaIAComercial(pregunta, prospectos = [], empresas = []) {
  const consulta = normalizar(pregunta);
  const hoy = new Date();
  const prospectosVencidos = prospectos.filter((prospecto) => {
    if (!prospecto.fechaProximoContacto) return false;
    return new Date(prospecto.fechaProximoContacto) <= hoy;
  });
  const prospectosPrioritarios = [...prospectos]
    .sort((a, b) => Number(b.indiceTactika || 0) - Number(a.indiceTactika || 0))
    .slice(0, 5);
  const empresasPrioritarias = [...empresas]
    .sort((a, b) => Number(b.potencial || 0) - Number(a.potencial || 0))
    .slice(0, 5);

  if (consulta.includes("contacto hoy") || consulta.includes("a quien")) {
    if (prospectosVencidos.length === 0) {
      return "Hoy partiria por los prospectos con mayor Indice Tactika. No veo seguimientos vencidos en este momento.";
    }

    return `Hoy conviene contactar primero a: ${prospectosVencidos
      .slice(0, 5)
      .map((p) => p.empresa)
      .join(", ")}. Estan vencidos o para seguimiento inmediato.`;
  }

  if (consulta.includes("10 dias") || consulta.includes("sin seguimiento")) {
    return "La siguiente version conectara historial por fecha de ultima interaccion. Por ahora revisa la seccion Tareas del CRM para ver prospectos vencidos y mensajes pendientes.";
  }

  if (consulta.includes("mayor potencial") || consulta.includes("potencial")) {
    const nombres = empresasPrioritarias.length
      ? empresasPrioritarias.map((e) => `${e.empresa} (${e.potencial})`).join(", ")
      : prospectosPrioritarios.map((p) => `${p.empresa} (${p.indiceTactika || 0})`).join(", ");

    return nombres
      ? `Las mejores oportunidades ahora son: ${nombres}. Priorizaria llamada o WhatsApp antes de enviar propuesta.`
      : "Todavia no hay datos suficientes. Ejecuta una busqueda o agrega prospectos al CRM.";
  }

  if (consulta.includes("correo")) {
    return "Asunto: Diagnostico para ordenar la gestion de su empresa\n\nHola, soy Claudio Urra de Tactika Consulting. Estamos ayudando a pymes a ordenar clientes, procesos, propuestas y seguimiento mediante un diagnostico y un sistema adaptado a su forma de trabajar. Me gustaria coordinar una conversacion breve de 15 minutos para entender como gestionan hoy su negocio y ver si podemos aportar valor.";
  }

  if (consulta.includes("whatsapp")) {
    return "Hola, soy Claudio Urra de Tactika Consulting. Estamos conversando con pymes de la zona para ayudarles a ordenar clientes, ventas y procesos. Me gustaria coordinar una conversacion breve de 15 minutos para entender como trabajan hoy y ver si un diagnostico les puede aportar valor.";
  }

  if (consulta.includes("llamada") || consulta.includes("guion")) {
    return "Guion sugerido: 1) Presentate como Tactika Consulting. 2) Aclara que no llamas para vender un software de inmediato. 3) Pregunta como controlan clientes, tareas y propuestas. 4) Detecta un problema concreto. 5) Ofrece un diagnostico breve como siguiente paso.";
  }

  if (consulta.includes("propuesta")) {
    return "Propuesta base: Diagnostico Empresarial Tactika, levantamiento de procesos, informe ejecutivo, plan de accion y recomendacion de sistema. Valor de entrada desde $29.990, descontable si la empresa avanza a implementacion.";
  }

  if (consulta.includes("resume") || consulta.includes("reunion")) {
    return "Resumen de reunion sugerido: problema detectado, proceso actual, impacto en tiempo o ventas, prioridad del cliente, siguiente paso y fecha de seguimiento. Guardalo como interaccion en el CRM.";
  }

  return "Puedo ayudarte a priorizar prospectos, preparar mensajes, crear guiones de llamada, redactar propuestas y sugerir el siguiente paso comercial. Preguntame, por ejemplo: ¿a quien contacto hoy?";
}
