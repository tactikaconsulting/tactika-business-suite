import { supabase } from "../lib/supabase";
import { crearProspectoSeguro } from "./ProspectoService";

function normalizar(valor) {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function comunasComoLista(comunas) {
  return String(comunas || "")
    .split(/,|\n/)
    .map((comuna) => normalizar(comuna))
    .filter(Boolean);
}

export async function buscarEmpresasReales(filtros) {
  const { data, error } = await supabase.functions.invoke("buscar-prospectos", {
    body: {
      rubro: filtros.rubro,
      comunas: filtros.comunas,
      region: filtros.region,
      cantidad: Number(filtros.cantidad || 10),
      palabrasClave: filtros.palabrasClave,
    },
  });

  if (error) {
    throw new Error(error.message || "No se pudo conectar con el buscador de prospectos.");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  const empresas = Array.isArray(data?.empresas) ? data.empresas : [];
  return {
    ...data,
    empresas: empresas.map((empresa, index) => ({
      ...empresa,
      correo: empresa.correo || "",
      sitioWeb: empresa.sitioWeb || "",
      idTemporal:
        empresa.googlePlaceId ||
        `${normalizar(empresa.empresa).replace(/\s+/g, "-")}-${index}`,
      estadoProspeccion: empresa.estadoProspeccion || "Encontrada",
      potencial: empresa.potencial || calcularPotencialEmpresa(empresa),
    })),
  };
}

export function generarEnlacesBusquedaProspectos(filtros) {
  const rubro = String(filtros.rubro || "pyme").trim();
  const comunas = comunasComoLista(filtros.comunas);
  const comunaPrincipal = comunas[0] || "buin";
  const region = String(filtros.region || "Region Metropolitana").trim();
  const palabrasClave = String(filtros.palabrasClave || "contacto WhatsApp").trim();
  const terminoBase = `${rubro} ${comunaPrincipal} ${region}`;

  return [
    {
      label: "Google: contacto y WhatsApp",
      descripcion: "Busca empresas con datos publicos de contacto.",
      url: `https://www.google.com/search?q=${encodeURIComponent(`${terminoBase} ${palabrasClave}`)}`,
    },
    {
      label: "Google Maps: empresas cercanas",
      descripcion: "Abre el mapa para revisar negocios reales y telefonos publicos.",
      url: `https://www.google.com/maps/search/${encodeURIComponent(terminoBase)}`,
    },
    {
      label: "Instagram: negocios activos",
      descripcion: "Encuentra cuentas con actividad reciente y WhatsApp visible.",
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:instagram.com ${terminoBase}`)}`,
    },
    {
      label: "Facebook: paginas y publicaciones",
      descripcion: "Encuentra paginas locales y grupos donde aparezcan empresas.",
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:facebook.com ${terminoBase}`)}`,
    },
    {
      label: "Directorios web",
      descripcion: "Busca sitios o directorios con correos publicos del rubro.",
      url: `https://www.google.com/search?q=${encodeURIComponent(`${terminoBase} correo contacto empresa`)}`,
    },
  ];
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
      "Empresa real encontrada desde Prospeccion IA.",
      empresa.fuente ? `Fuente: ${empresa.fuente}` : "",
      empresa.direccion ? `Direccion: ${empresa.direccion}` : "",
      empresa.googleMapsUrl ? `Google Maps: ${empresa.googleMapsUrl}` : "",
      empresa.problemaDetectado,
      empresa.necesidad,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export function calcularPotencialEmpresa(empresa) {
  let puntaje = 35;
  if (empresa.telefono) puntaje += 20;
  if (!empresa.sitioWeb) puntaje += 10;
  if (!empresa.correo) puntaje += 8;
  if (Number(empresa.numTrabajadores) >= 10) puntaje += 18;
  if (Number(empresa.numTrabajadores) >= 25) puntaje += 12;
  if (Number(empresa.rating) >= 4) puntaje += 8;
  if (Number(empresa.userRatingCount) >= 10) puntaje += 7;
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
