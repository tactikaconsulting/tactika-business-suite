import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchText";
const CANTIDADES_PERMITIDAS = [10, 25, 50, 100];
const PAGE_SIZE = 20;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type FiltrosProspeccion = {
  rubro?: string;
  comunas?: string;
  region?: string;
  cantidad?: number | string;
  palabrasClave?: string;
};

type ProspectoEncontrado = {
  googlePlaceId: string;
  empresa: string;
  giro: string;
  comuna: string;
  region: string;
  telefono: string;
  sitioWeb: string;
  dominio: string;
  direccion: string;
  googleMapsUrl: string;
  rating: number | null;
  userRatingCount: number | null;
  fuente: string;
  consulta: string;
  problemaDetectado: string;
  dolorPrincipal: string;
  necesidad: string;
  estadoProspeccion: string;
  potencial: number;
  raw: Record<string, unknown>;
};

function texto(valor: unknown) {
  return typeof valor === "string" ? valor.trim() : "";
}

function normalizar(valor: unknown) {
  return texto(valor)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizarTelefono(valor: unknown) {
  return texto(valor).replace(/\D/g, "");
}

function obtenerDominio(url: unknown) {
  const limpio = texto(url);
  if (!limpio) return "";

  try {
    const parsed = new URL(limpio.startsWith("http") ? limpio : `https://${limpio}`);
    return parsed.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return limpio.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
  }
}

function comunasComoLista(comunas: unknown) {
  return texto(comunas)
    .split(/,|\n/)
    .map((comuna) => texto(comuna))
    .filter(Boolean);
}

function cantidadPermitida(valor: unknown) {
  const cantidad = Number(valor || 10);
  return CANTIDADES_PERMITIDAS.includes(cantidad) ? cantidad : 10;
}

function detectarComuna(place: Record<string, unknown>, comunas: string[], fallback: string) {
  const direccion = normalizar(place.formattedAddress);
  return comunas.find((comuna) => direccion.includes(normalizar(comuna))) || fallback;
}

function dedupeKeys(prospecto: ProspectoEncontrado) {
  return [
    prospecto.googlePlaceId ? `place:${prospecto.googlePlaceId}` : "",
    prospecto.telefono ? `tel:${normalizarTelefono(prospecto.telefono)}` : "",
    prospecto.dominio ? `dom:${prospecto.dominio}` : "",
    prospecto.empresa ? `nom:${normalizar(prospecto.empresa)}` : "",
    prospecto.direccion ? `dir:${normalizar(prospecto.direccion)}` : "",
  ].filter(Boolean);
}

function calcularPotencial(prospecto: ProspectoEncontrado) {
  let puntaje = 35;
  if (prospecto.telefono) puntaje += 20;
  if (!prospecto.sitioWeb) puntaje += 15;
  if (prospecto.rating && prospecto.rating >= 4) puntaje += 10;
  if ((prospecto.userRatingCount || 0) >= 10) puntaje += 10;
  if (prospecto.googleMapsUrl) puntaje += 5;
  if (prospecto.direccion) puntaje += 5;
  return Math.min(puntaje, 100);
}

function inferirDolor(rubro: string, prospecto: ProspectoEncontrado) {
  const rubroNormalizado = normalizar(rubro);
  const nombre = normalizar(prospecto.empresa);
  const tipos = Array.isArray(prospecto.raw.types) ? prospecto.raw.types.join(" ") : "";
  const textoBase = `${rubroNormalizado} ${nombre} ${normalizar(tipos)}`;

  if (/construct|construccion|obra|inmobili/.test(textoBase)) {
    return {
      problemaDetectado: "Gestion comercial y seguimiento de proyectos probablemente repartidos entre llamadas, WhatsApp y planillas.",
      dolorPrincipal: "Puede perder trazabilidad de clientes, cotizaciones y avances.",
      necesidad: "CRM, control de propuestas, tareas y seguimiento de oportunidades.",
    };
  }

  if (/restaurant|comida|cafeter|bar|sandwich|burger|poll/.test(textoBase)) {
    return {
      problemaDetectado: "Pedidos, compras, reservas o stock pueden estar funcionando en canales separados.",
      dolorPrincipal: "Dificultad para controlar ventas, costos y clientes recurrentes.",
      necesidad: "Ventas, inventario, agenda, clientes y reportes simples.",
    };
  }

  if (/ferreter|tienda|comerc|market|retail/.test(textoBase)) {
    return {
      problemaDetectado: "Stock, ventas y compras pueden no estar conectados en un solo sistema.",
      dolorPrincipal: "Riesgo de quiebres de stock y baja visibilidad de productos rentables.",
      necesidad: "Inventario, compras, ventas y tablero de control.",
    };
  }

  if (/taller|mecanic|automotriz|moto/.test(textoBase)) {
    return {
      problemaDetectado: "Ordenes de trabajo, clientes y pagos pueden quedar dispersos.",
      dolorPrincipal: "Falta de historial claro de servicios y seguimiento.",
      necesidad: "Agenda, clientes, ordenes de trabajo y control de pagos.",
    };
  }

  return {
    problemaDetectado: "Empresa real encontrada en fuente publica; requiere diagnostico para confirmar dolor operativo.",
    dolorPrincipal: "Posible falta de seguimiento centralizado de clientes, tareas o procesos internos.",
    necesidad: "Diagnostico comercial para identificar el modulo de sistema mas relevante.",
  };
}

function transformarPlace(
  place: Record<string, unknown>,
  filtros: Required<Pick<FiltrosProspeccion, "rubro" | "region">>,
  comunas: string[],
  comunaFallback: string,
  consulta: string,
) {
  const displayName = place.displayName as { text?: string } | undefined;
  const empresa = texto(displayName?.text);
  const sitioWeb = texto(place.websiteUri);
  const telefono = texto(place.internationalPhoneNumber) || texto(place.nationalPhoneNumber);
  const prospecto: ProspectoEncontrado = {
    googlePlaceId: texto(place.id),
    empresa,
    giro: filtros.rubro,
    comuna: detectarComuna(place, comunas, comunaFallback),
    region: filtros.region,
    telefono,
    sitioWeb,
    dominio: obtenerDominio(sitioWeb),
    direccion: texto(place.formattedAddress),
    googleMapsUrl: texto(place.googleMapsUri),
    rating: typeof place.rating === "number" ? place.rating : null,
    userRatingCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    fuente: "Google Places",
    consulta,
    problemaDetectado: "",
    dolorPrincipal: "",
    necesidad: "",
    estadoProspeccion: "Encontrada",
    potencial: 0,
    raw: place,
  };

  const inferencia = inferirDolor(filtros.rubro, prospecto);
  prospecto.problemaDetectado = inferencia.problemaDetectado;
  prospecto.dolorPrincipal = inferencia.dolorPrincipal;
  prospecto.necesidad = inferencia.necesidad;
  prospecto.potencial = calcularPotencial(prospecto);
  return prospecto;
}

function agregarUnico(
  prospectos: ProspectoEncontrado[],
  vistos: Set<string>,
  prospecto: ProspectoEncontrado,
) {
  if (!prospecto.empresa) return false;

  const keys = dedupeKeys(prospecto);
  if (keys.some((key) => vistos.has(key))) return false;

  keys.forEach((key) => vistos.add(key));
  prospectos.push(prospecto);
  return true;
}

async function buscarPaginaGoogle(apiKey: string, body: Record<string, unknown>) {
  const response = await fetch(GOOGLE_PLACES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.websiteUri",
        "places.googleMapsUri",
        "places.types",
        "places.rating",
        "places.userRatingCount",
        "nextPageToken",
        "searchUri",
      ].join(","),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Google Places no pudo completar la busqueda.");
  }

  return data;
}

async function buscarPorConsulta(
  apiKey: string,
  consulta: string,
  filtros: Required<Pick<FiltrosProspeccion, "rubro" | "region">>,
  comunas: string[],
  comunaFallback: string,
  cantidadObjetivo: number,
  prospectos: ProspectoEncontrado[],
  vistos: Set<string>,
) {
  let pageToken = "";
  let paginas = 0;

  while (prospectos.length < cantidadObjetivo && paginas < 3) {
    const data = await buscarPaginaGoogle(apiKey, {
      textQuery: consulta,
      pageSize: PAGE_SIZE,
      pageToken: pageToken || undefined,
      languageCode: "es",
      regionCode: "CL",
      includePureServiceAreaBusinesses: true,
    });

    for (const place of data.places || []) {
      const prospecto = transformarPlace(place, filtros, comunas, comunaFallback, consulta);
      agregarUnico(prospectos, vistos, prospecto);
      if (prospectos.length >= cantidadObjetivo) break;
    }

    pageToken = texto(data.nextPageToken);
    paginas += 1;
    if (!pageToken) break;
  }
}

async function guardarResultados(prospectos: ProspectoEncontrado[], rubro: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceRoleKey || prospectos.length === 0) return { guardados: 0 };

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const filas = prospectos.map((prospecto) => ({
    google_place_id: prospecto.googlePlaceId,
    empresa: prospecto.empresa,
    giro: prospecto.giro,
    comuna: prospecto.comuna,
    region: prospecto.region,
    telefono: prospecto.telefono || null,
    sitio_web: prospecto.sitioWeb || null,
    dominio: prospecto.dominio || null,
    direccion: prospecto.direccion || null,
    google_maps_url: prospecto.googleMapsUrl || null,
    rating: prospecto.rating,
    user_rating_count: prospecto.userRatingCount,
    fuente: prospecto.fuente,
    rubro_buscado: rubro,
    consulta: prospecto.consulta,
    problema_detectado: prospecto.problemaDetectado,
    dolor_principal: prospecto.dolorPrincipal,
    necesidad: prospecto.necesidad,
    potencial: prospecto.potencial,
    estado: "Encontrada",
    raw: prospecto.raw,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("prospectos_encontrados")
    .upsert(filas, { onConflict: "google_place_id" });

  if (error) {
    console.error("No se pudieron guardar prospectos_encontrados", error.message);
    return { guardados: 0, advertencia: error.message };
  }

  return { guardados: filas.length };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY") || Deno.env.get("GOOGLE_PLACES_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Falta configurar GOOGLE_PLACES_API_KEY en Supabase." }),
        { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } },
      );
    }

    const body = (await req.json()) as FiltrosProspeccion;
    const rubro = texto(body.rubro);
    const region = texto(body.region) || "Region Metropolitana";
    const palabrasClave = texto(body.palabrasClave);
    const comunas = comunasComoLista(body.comunas);
    const cantidad = cantidadPermitida(body.cantidad);

    if (!rubro) {
      return new Response(JSON.stringify({ error: "Indica un rubro para buscar." }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (comunas.length === 0) {
      return new Response(JSON.stringify({ error: "Indica al menos una comuna." }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const prospectos: ProspectoEncontrado[] = [];
    const vistos = new Set<string>();
    const filtros = { rubro, region };
    const variantes = [
      `${rubro} ${palabrasClave}`.trim(),
      `${rubro} empresas`,
      `${rubro} servicios`,
      `${rubro} negocios`,
    ];

    for (const comuna of comunas) {
      for (const variante of variantes) {
        if (prospectos.length >= cantidad) break;
        const consulta = `${variante} en ${comuna}, ${region}, Chile`;
        await buscarPorConsulta(apiKey, consulta, filtros, comunas, comuna, cantidad, prospectos, vistos);
      }
      if (prospectos.length >= cantidad) break;
    }

    const guardado = await guardarResultados(prospectos, rubro);

    return new Response(
      JSON.stringify({
        empresas: prospectos.slice(0, cantidad),
        total: prospectos.length,
        cantidadSolicitada: cantidad,
        fuente: "Google Places",
        guardado,
      }),
      { headers: { ...corsHeaders, "content-type": "application/json" } },
    );
  } catch (error) {
    console.error("Error buscar-prospectos", String(error));
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "No se pudo buscar prospectos." }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } },
    );
  }
});
