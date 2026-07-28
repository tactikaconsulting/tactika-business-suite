import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres el asistente comercial de Táctika Consulting, una consultora chilena que ayuda a pequeñas y medianas empresas (pymes) a ordenar su gestión mediante asesoría profesional y una plataforma propia (Táctika Business Suite).

Tu tarea:
- Responder preguntas del visitante sobre el servicio de forma breve, cercana y en español chileno, sin sonar robótico.
- El servicio incluye: diagnóstico de la empresa, plan de acción con responsables y plazos, y seguimiento a través de la plataforma.
- Atienden principalmente pymes de Buin y la Región Metropolitana.
- De forma natural durante la conversación, intenta obtener: nombre de la empresa, nombre de la persona de contacto, comuna, número aproximado de trabajadores, y un correo o teléfono de contacto, y qué problema tiene la empresa.
- No preguntes todo de golpe como un formulario — ve conversando naturalmente.
- Antes de registrar los datos en el CRM, pide autorizacion de forma simple, por ejemplo: "¿Te parece si dejo tus datos registrados para que Claudio te contacte?". Solo registra el lead si la persona acepta, pide agendar o solicita claramente que la contacten.
- Mientras conversas, evalúa (sin preguntarlo directamente como encuesta) estas señales, según lo que el visitante cuente:
  - ¿La empresa usa algún software de gestión hoy? (sí/no, y cuál si menciona uno)
  - ¿Parece tener mucho trabajo administrativo o manual (planillas, papeles, todo a mano)?
  - ¿El visitante muestra interés alto en avanzar (pregunta por precios, quiere agendar, pide más info)?
  - ¿Menciona una necesidad urgente o un problema que quiere resolver pronto?

Cuando ya tengas al menos el nombre de la empresa, un dato de contacto (correo o teléfono) Y autorizacion para registrar/contactar, agrega AL FINAL de tu respuesta (después de tu texto normal, en una línea nueva) este bloque exacto con los datos que tengas:
<<<LEAD>>>{"empresa":"...","contacto":"...","correo":"...","telefono":"...","comuna":"...","numTrabajadores":"...","problema":"...","usaSoftware":true_o_false,"softwareActual":"...","trabajoAdministrativo":true_o_false,"interesAlto":true_o_false,"necesidadUrgente":true_o_false,"consentimiento":true}<<<END>>>

Reglas para ese bloque:
- Usa "" vacío para los campos de texto que no tengas.
- Usa false (no null, no "") para los campos true/false si no tienes evidencia clara — solo pon true cuando el visitante lo haya insinuado o dicho.
- Si la persona no autorizo el contacto, no incluyas el bloque LEAD.
- Ese bloque no lo ve el visitante (se procesa aparte), así que no lo menciones ni lo expliques en tu respuesta visible.`;

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

function calcularIndice(lead: any) {
  let indice = 0;
  const trabajadores = numeroTrabajadores(lead.numTrabajadores);

  if (!lead.usaSoftware) indice += 20;
  if (String(lead.softwareActual || "").toLowerCase().includes("excel")) indice += 15;
  if (trabajadores && trabajadores > 10) indice += 10;
  if (lead.trabajoAdministrativo) indice += 15;
  if (limpiarTexto(lead.problema)) indice += 15;
  if (lead.interesAlto) indice += 15;
  if (lead.necesidadUrgente) indice += 10;

  return Math.min(indice, 100);
}

async function buscarProspectoExistente(supabase: any, lead: any) {
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

function crearResumenConversacion(messages: any[]) {
  return messages
    .slice(-8)
    .map((m) => `${m.role === "user" ? "Visitante" : "Agente"}: ${m.content}`)
    .join("\n\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await aiResponse.json();
    const texto = data?.content?.[0]?.text ?? "Lo siento, no pude procesar tu mensaje.";

    let respuestaVisible = texto;
    let lead: any = null;
    let leadGuardado = false;

    const match = texto.match(/<<<LEAD>>>([\s\S]*?)<<<END>>>/);
    if (match) {
      respuestaVisible = texto.replace(match[0], "").trim();
      try {
        lead = JSON.parse(match[1]);
      } catch (_e) {
        lead = null;
      }
    }

    if (lead && lead.empresa && (lead.correo || lead.telefono) && lead.consentimiento === true) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const existente = await buscarProspectoExistente(supabase, lead);
      const datosProspecto = {
        empresa: limpiarTexto(lead.empresa),
        contacto_nombre: limpiarTexto(lead.contacto) || existente?.contacto_nombre || null,
        correo: limpiarTexto(lead.correo).toLowerCase() || existente?.correo || null,
        telefono: limpiarTelefono(lead.telefono) || existente?.telefono || null,
        comuna: limpiarTexto(lead.comuna) || existente?.comuna || null,
        num_trabajadores: numeroTrabajadores(lead.numTrabajadores) || existente?.num_trabajadores || null,
        problema_detectado: limpiarTexto(lead.problema) || existente?.problema_detectado || null,
        usa_software: !!lead.usaSoftware,
        software_actual: limpiarTexto(lead.softwareActual) || existente?.software_actual || null,
        trabajo_administrativo: !!lead.trabajoAdministrativo,
        interes_alto: !!lead.interesAlto,
        necesidad_urgente: !!lead.necesidadUrgente,
        indice_tactika: calcularIndice(lead),
        origen: existente?.origen || "Landing / Agente IA",
        estado: existente?.estado || "Prospecto",
        fecha_proximo_contacto: existente?.fecha_proximo_contacto || fechaManana(),
        observaciones: [
          existente?.observaciones,
          `Lead capturado por agente IA (${new Date().toLocaleDateString("es-CL")}): ${limpiarTexto(lead.problema) || "Interesado en Tactika Consulting."}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
        updated_at: new Date().toISOString(),
      };

      const { data: prospectoGuardado, error: errorProspecto } = existente
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

      if (!errorProspecto && prospectoGuardado?.id) {
        await supabase.from("prospecto_interacciones").insert([
          {
            prospecto_id: prospectoGuardado.id,
            tipo: "nota",
            titulo: existente ? "Lead actualizado por agente IA" : "Lead capturado por agente IA",
            resultado: "Solicito contacto desde la landing",
            detalle: crearResumenConversacion(messages),
            fecha_interaccion: new Date().toISOString(),
          },
        ]);
        leadGuardado = true;
      }
    }

    return new Response(JSON.stringify({ respuesta: respuestaVisible, leadGuardado }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
