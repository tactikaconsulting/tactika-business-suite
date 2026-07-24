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
- Mientras conversas, evalúa (sin preguntarlo directamente como encuesta) estas señales, según lo que el visitante cuente:
  - ¿La empresa usa algún software de gestión hoy? (sí/no, y cuál si menciona uno)
  - ¿Parece tener mucho trabajo administrativo o manual (planillas, papeles, todo a mano)?
  - ¿El visitante muestra interés alto en avanzar (pregunta por precios, quiere agendar, pide más info)?
  - ¿Menciona una necesidad urgente o un problema que quiere resolver pronto?

Cuando ya tengas al menos el nombre de la empresa Y un dato de contacto (correo o teléfono), agrega AL FINAL de tu respuesta (después de tu texto normal, en una línea nueva) este bloque exacto con los datos que tengas:
<<<LEAD>>>{"empresa":"...","contacto":"...","correo":"...","telefono":"...","comuna":"...","numTrabajadores":"...","problema":"...","usaSoftware":true_o_false,"softwareActual":"...","trabajoAdministrativo":true_o_false,"interesAlto":true_o_false,"necesidadUrgente":true_o_false}<<<END>>>

Reglas para ese bloque:
- Usa "" vacío para los campos de texto que no tengas.
- Usa false (no null, no "") para los campos true/false si no tienes evidencia clara — solo pon true cuando el visitante lo haya insinuado o dicho.
- Ese bloque no lo ve el visitante (se procesa aparte), así que no lo menciones ni lo expliques en tu respuesta visible.`;

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

    const match = texto.match(/<<<LEAD>>>([\s\S]*?)<<<END>>>/);
    if (match) {
      respuestaVisible = texto.replace(match[0], "").trim();
      try {
        lead = JSON.parse(match[1]);
      } catch (_e) {
        lead = null;
      }
    }

    if (lead && lead.empresa) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      let indice = 0;
      if (!lead.usaSoftware) indice += 20;
      if (String(lead.softwareActual || "").toLowerCase().includes("excel")) indice += 15;
      if (Number(lead.numTrabajadores) > 10) indice += 10;
      if (lead.trabajoAdministrativo) indice += 15;
      if (lead.problema && lead.problema.trim()) indice += 15;
      if (lead.interesAlto) indice += 15;
      if (lead.necesidadUrgente) indice += 10;
      indice = Math.min(indice, 100);

      await supabase.from("prospectos").insert([
        {
          empresa: lead.empresa,
          contacto_nombre: lead.contacto || null,
          correo: lead.correo || null,
          telefono: lead.telefono || null,
          comuna: lead.comuna || null,
          num_trabajadores: lead.numTrabajadores ? Number(lead.numTrabajadores) : null,
          problema_detectado: lead.problema || null,
          usa_software: !!lead.usaSoftware,
          software_actual: lead.softwareActual || null,
          trabajo_administrativo: !!lead.trabajoAdministrativo,
          interes_alto: !!lead.interesAlto,
          necesidad_urgente: !!lead.necesidadUrgente,
          indice_tactika: indice,
          origen: "Chat Landing (IA)",
          estado: "Prospecto",
        },
      ]);
    }

    return new Response(JSON.stringify({ respuesta: respuestaVisible }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});