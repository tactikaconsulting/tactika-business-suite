import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Mensaje = {
  role: "user" | "assistant";
  content: string;
};

type Lead = {
  problema?: string;
  empresa?: string;
  contacto?: string;
  comuna?: string;
  telefono?: string;
  correo?: string;
  numTrabajadores?: string;
  consentimiento?: boolean;
};

function limpiarTexto(valor: unknown) {
  return typeof valor === "string" ? valor.trim() : "";
}

function limpiarTelefono(valor: unknown) {
  return limpiarTexto(valor).replace(/\s+/g, " ");
}

function numeroTrabajadores(valor: unknown) {
  const limpio = limpiarTexto(valor).replace(/\D/g, "");
  return limpio ? Number(limpio) : null;
}

function fechaManana() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 1);
  return fecha.toISOString().slice(0, 10);
}

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function esAfirmacion(texto: string) {
  const limpio = normalizar(texto);
  return /\b(si|sí|ok|dale|claro|autorizo|acepto|de acuerdo|perfecto|ya|contactame|contáctame|llamame|llámame)\b/.test(limpio);
}

function extraerCorreo(texto: string) {
  return limpiarTexto(texto.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "");
}

function extraerTelefono(texto: string) {
  const match = texto.match(/(\+?56\s?)?(\(?9\)?\s?)?[\d\s.-]{8,14}/);
  return limpiarTelefono(match?.[0] || "");
}

function extraerCampo(texto: string, etiquetas: string[]) {
  for (const etiqueta of etiquetas) {
    const patron = new RegExp(`${etiqueta}\\s*[:=\\-]\\s*([^\\n,;]+)`, "i");
    const match = texto.match(patron);
    if (match?.[1]) return limpiarTexto(match[1]);
  }
  return "";
}

function detectarProblema(texto: string) {
  const limpio = normalizar(texto);
  if (limpio.includes("cliente") || limpio.includes("seguimiento")) return "Ordenar clientes y seguimiento comercial";
  if (limpio.includes("venta") || limpio.includes("propuesta") || limpio.includes("cotizacion")) return "Ordenar ventas, propuestas y cotizaciones";
  if (limpio.includes("inventario") || limpio.includes("stock") || limpio.includes("bodega")) return "Ordenar inventario y procesos internos";
  if (limpio.includes("personal") || limpio.includes("trabajador") || limpio.includes("rrhh")) return "Ordenar personal, tareas y asistencia";
  if (limpio.includes("diagnostico") || limpio.includes("diagnóstico")) return "Solicita diagnóstico empresarial";
  return "";
}

function crearResumenConversacion(messages: Mensaje[]) {
  return messages
    .slice(-10)
    .map((m) => `${m.role === "user" ? "Visitante" : "Agente"}: ${m.content}`)
    .join("\n\n");
}

function calcularIndice(lead: Lead) {
  let indice = 35;
  if (lead.problema) indice += 20;
  if (lead.telefono || lead.correo) indice += 20;
  if (lead.comuna) indice += 10;
  if (numeroTrabajadores(lead.numTrabajadores)) indice += 10;
  if (lead.consentimiento) indice += 5;
  return Math.min(indice, 100);
}

async function buscarProspectoExistente(supabase: any, lead: Lead) {
  const correo = limpiarTexto(lead.correo).toLowerCase();
  const telefono = limpiarTelefono(lead.telefono);

  if (correo) {
    const { data } = await supabase
      .from("prospectos")
      .select("*")
      .eq("correo", correo)
      .maybeSingle();
    if (data) return data;
  }

  if (telefono) {
    const { data } = await supabase
      .from("prospectos")
      .select("*")
      .eq("telefono", telefono)
      .maybeSingle();
    if (data) return data;
  }

  return null;
}

function construirLead(messages: Mensaje[]) {
  const usuarios = messages.filter((m) => m.role === "user").map((m) => m.content);
  const lead: Lead = {};

  for (const texto of usuarios) {
    const correo = extraerCorreo(texto);
    const telefono = extraerTelefono(texto);
    const problema = detectarProblema(texto);

    if (problema && !lead.problema) lead.problema = problema;
    if (correo) lead.correo = correo;
    if (telefono) lead.telefono = telefono;

    const empresa = extraerCampo(texto, ["empresa", "negocio", "local"]);
    const contacto = extraerCampo(texto, ["nombre", "contacto", "soy"]);
    const comuna = extraerCampo(texto, ["comuna", "ciudad", "ubicacion", "ubicación"]);
    const trabajadores = extraerCampo(texto, ["trabajadores", "personas", "empleados"]);

    if (empresa) lead.empresa = empresa;
    if (contacto) lead.contacto = contacto;
    if (comuna) lead.comuna = comuna;
    if (trabajadores) lead.numTrabajadores = trabajadores;
  }

  const ultimoUsuario = normalizar(usuarios[usuarios.length - 1] || "");
  const penultimoAgente = normalizar(
    [...messages].reverse().find((m) => m.role === "assistant")?.content || ""
  );

  if (penultimoAgente.includes("dejo tus datos registrados") && esAfirmacion(ultimoUsuario)) {
    lead.consentimiento = true;
  }

  return lead;
}

function proximaPregunta(lead: Lead) {
  if (!lead.problema) {
    return "Perfecto. Para orientarte mejor, ¿qué te gustaría ordenar primero en tu empresa: clientes, ventas, inventario, personal o administración?";
  }

  if (!lead.empresa) {
    return "Entiendo. Eso suele pasar cuando la información queda repartida entre WhatsApp, Excel o conversaciones sueltas. ¿Cómo se llama tu empresa o negocio?";
  }

  if (!lead.comuna) {
    return `Gracias. ¿En qué comuna está ${lead.empresa}?`;
  }

  if (!lead.contacto) {
    return "¿Cuál es tu nombre para que Claudio sepa con quién debe hablar?";
  }

  if (!lead.telefono && !lead.correo) {
    return "¿Me dejas un teléfono o correo para que Claudio pueda contactarte y coordinar una conversación breve?";
  }

  if (!lead.numTrabajadores) {
    return "Última pregunta para priorizar bien el diagnóstico: ¿aproximadamente cuántas personas trabajan en la empresa?";
  }

  if (!lead.consentimiento) {
    return "Con esos datos ya podemos revisar tu caso. ¿Te parece si dejo tus datos registrados para que Claudio te contacte y coordine el diagnóstico?";
  }

  return "";
}

async function guardarLead(lead: Lead, messages: Mensaje[]) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const existente = await buscarProspectoExistente(supabase, lead);
  const problema = limpiarTexto(lead.problema) || "Interesado en diagnóstico empresarial Táctika.";
  const datosProspecto = {
    empresa: limpiarTexto(lead.empresa),
    contacto_nombre: limpiarTexto(lead.contacto) || existente?.contacto_nombre || null,
    correo: limpiarTexto(lead.correo).toLowerCase() || existente?.correo || null,
    telefono: limpiarTelefono(lead.telefono) || existente?.telefono || null,
    comuna: limpiarTexto(lead.comuna) || existente?.comuna || null,
    num_trabajadores: numeroTrabajadores(lead.numTrabajadores) || existente?.num_trabajadores || null,
    problema_detectado: problema,
    usa_software: false,
    software_actual: existente?.software_actual || null,
    trabajo_administrativo: true,
    interes_alto: true,
    necesidad_urgente: false,
    indice_tactika: calcularIndice(lead),
    origen: existente?.origen || "Landing / Agente guiado",
    estado: existente?.estado || "Prospecto",
    fecha_proximo_contacto: existente?.fecha_proximo_contacto || fechaManana(),
    observaciones: [
      existente?.observaciones,
      `Lead capturado por agente guiado (${new Date().toLocaleDateString("es-CL")}): ${problema}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    updated_at: new Date().toISOString(),
  };

  const { data: prospectoGuardado, error } = existente
    ? await supabase
        .from("prospectos")
        .update(datosProspecto)
        .eq("id", existente.id)
        .select("id")
        .single()
    : await supabase
        .from("prospectos")
        .insert([datosProspecto])
        .select("id")
        .single();

  if (error) throw error;

  if (prospectoGuardado?.id) {
    await supabase.from("prospecto_interacciones").insert([
      {
        prospecto_id: prospectoGuardado.id,
        tipo: "nota",
        titulo: existente ? "Lead actualizado por agente guiado" : "Lead capturado por agente guiado",
        resultado: "Solicito contacto desde la landing",
        detalle: crearResumenConversacion(messages),
        fecha_interaccion: new Date().toISOString(),
      },
    ]);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages = [] } = await req.json();
    const lead = construirLead(messages);
    const pregunta = proximaPregunta(lead);

    if (!pregunta && lead.empresa && (lead.telefono || lead.correo) && lead.consentimiento) {
      await guardarLead(lead, messages);
      return new Response(
        JSON.stringify({
          respuesta: "Listo. Dejé tus datos registrados para que Claudio te contacte y coordine el diagnóstico. Mientras tanto, puedes revisar la página para conocer el método y los planes de Táctika.",
          leadGuardado: true,
        }),
        { headers: { ...corsHeaders, "content-type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ respuesta: pregunta, leadGuardado: false }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error agente-venta guiado", String(error));
    return new Response(
      JSON.stringify({
        respuesta: "Tuve un problema para registrar la información. Intenta nuevamente o escribe directo por WhatsApp para coordinar el diagnóstico.",
        leadGuardado: false,
      }),
      { status: 200, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
});
