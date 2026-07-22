import { supabase } from "../lib/supabase";

/**
 * ARQUITECTURA PREPARADA PARA IA — NO IMPLEMENTADA TODAVÍA.
 *
 * Esta función define el CONTRATO que va a usar la futura IA de
 * recomendación: qué datos recibe y qué formato de respuesta entrega.
 * Por ahora no llama a ningún modelo — solo deja la estructura lista
 * para conectarla más adelante (ej. vía una Edge Function de Supabase
 * que llame a un modelo de lenguaje).
 *
 * Cuando se implemente, esta función debería:
 * 1. Tomar los datos del prospecto (incluyendo su historial de estados)
 * 2. Enviarlos a un servicio de IA (ej. Edge Function + modelo)
 * 3. Guardar la respuesta en la columna `recomendacion_ia` (jsonb)
 * 4. Retornar la recomendación al componente que la llamó
 */
export async function obtenerRecomendacionIA(prospecto) {
  console.warn("IAService.obtenerRecomendacionIA: aún no implementado. Retornando estructura vacía.");

  return {
    disponible: false,
    moduloRecomendado: null,      // ej. "Diagnóstico + Plan de Acción"
    tipoAsesoria: null,           // ej. "Ordenamiento de procesos"
    accionesSugeridas: [],        // ej. ["Agendar diagnóstico", "Enviar propuesta"]
    probabilidadCierreIA: null,   // ej. 0-100, estimado por el modelo
    razonamiento: null,           // explicación en texto de por qué
  };
}

/**
 * Guarda una recomendación de IA ya generada en el prospecto.
 * Lista para usarse cuando obtenerRecomendacionIA() esté implementada de verdad.
 */
export async function guardarRecomendacionIA(prospectoId, recomendacion) {
  const { error } = await supabase
    .from("prospectos")
    .update({ recomendacion_ia: recomendacion })
    .eq("id", prospectoId);

  if (error) {
    console.error(error);
    throw error;
  }
}