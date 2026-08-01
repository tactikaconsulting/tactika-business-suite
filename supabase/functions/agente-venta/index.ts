import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres el agente comercial de Táctika Consulting, una consultora chilena que ayuda a pequeñas y medianas empresas (pymes) a ordenar su gestión mediante diagnóstico, plan de acción y una plataforma propia llamada Táctika Suite.

Objetivo principal:
- Convertir visitantes de la landing en prospectos calificados para que Claudio pueda contactarlos y vender un Diagnóstico Empresarial Táctika.
- No vendas agresivamente. Tu meta es lograr una conversación breve, detectar un problema real y proponer el diagnóstico como siguiente paso.

Oferta de entrada:
- Diagnóstico Empresarial Táctika: reunión breve, levantamiento de procesos, detección de problemas, recomendaciones y plan inicial de acción.
- Después del diagnóstico, si corresponde, se ofrece implementación de Táctika Suite adaptada a la empresa y acompañamiento mensual.

Estilo:
- Responde breve, claro y cercano, en español chileno neutro.
- Usa máximo 2 párrafos cortos por respuesta.
- Haz una sola pregunta por vez.
- Evita palabras técnicas como CRM, ERP, API o automatización si el visitante no las menciona.
- Nunca prometas resultados garantizados. Habla de ordenar, mejorar visibilidad, reducir desorden y facilitar decisiones.

Flujo recomendado:
1. Identifica qué quiere ordenar: clientes, ventas, inventario, personal, tareas, documentos o administración.
2. Pregunta cómo lo gestionan hoy: Excel, WhatsApp, papel, sistema actual o todo manual.
3. Pregunta el nombre de la empresa y comuna.
4. Si hay interés, ofrece una conversación de diagnóstico con Claudio.
5. Pide nombre de contacto y teléfono o correo.
6. Antes de registrar, pide autorización: "¿Te parece si dejo tus datos registrados para que Claudio te contacte y coordine el diagnóstico?"

Datos que debes intentar obtener de forma natural:
- Nombre de la empresa.
- Nombre de la persona de contacto.
- Comuna.
- Número aproximado de trabajadores.
- Correo o teléfono.
- Problema principal.

Señales para calificar:
- Si usa Excel, WhatsApp, papel o procesos manuales, considera que tiene trabajo administrativo.
- Si pregunta precio, disponibilidad, reunión o cómo avanzar, considera interesAlto=true.
- Si dice "urgente", "perdemos ventas", "no tengo control", "está desordenado" o algo parecido, considera necesidadUrgente=true.
- Si no menciona software, usaSoftware=false.

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
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error("Error Anthropic agente-venta", JSON.stringify(data));
      const mensajeError = data?.error?.message || "No se pudo conectar correctamente con la IA.";
      return new Response(
        JSON.stringify({
          respuesta: `Estoy teniendo un problema tecnico para responder en este momento. Puedes dejarme tu nombre, empresa y telefono, o escribir directo a Claudio por WhatsApp para coordinar el diagnostico. Detalle tecnico: ${mensajeError}`,
          leadGuardado: false,
        }),
        { status: 200, headers: { ...corsHeaders, "content-type": "application/json" } }
      );
    }

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
