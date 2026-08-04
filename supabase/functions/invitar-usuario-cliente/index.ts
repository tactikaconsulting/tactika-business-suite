import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Payload = {
  nombre?: string;
  email?: string;
  clienteId?: string;
  tipoUsuario?: "cliente_admin" | "cliente_usuario";
};

function limpiarTexto(valor: unknown) {
  return typeof valor === "string" ? valor.trim() : "";
}

function limpiarEmail(valor: unknown) {
  return limpiarTexto(valor).toLowerCase();
}

function validarPayload(payload: Payload) {
  const nombre = limpiarTexto(payload.nombre);
  const email = limpiarEmail(payload.email);
  const clienteId = limpiarTexto(payload.clienteId);
  const tipoUsuario = limpiarTexto(payload.tipoUsuario);

  if (!nombre) throw new Error("Debes indicar el nombre del usuario.");
  if (!email || !email.includes("@")) throw new Error("Debes indicar un correo valido.");
  if (!clienteId) throw new Error("Debes seleccionar una empresa cliente.");
  if (!["cliente_admin", "cliente_usuario"].includes(tipoUsuario)) {
    throw new Error("Tipo de acceso invalido.");
  }

  return { nombre, email, clienteId, tipoUsuario };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) throw new Error("Sesion no encontrada.");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseUsuario = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: usuarioActual, error: errorUsuario } = await supabaseUsuario.auth.getUser();
    if (errorUsuario || !usuarioActual?.user) throw new Error("No se pudo validar tu sesion.");

    const { data: perfilAdmin, error: errorPerfil } = await supabaseAdmin
      .from("perfiles")
      .select("id, tipo_usuario")
      .eq("id", usuarioActual.user.id)
      .maybeSingle();

    if (errorPerfil) throw errorPerfil;
    if (perfilAdmin?.tipo_usuario !== "admin_tactika") {
      throw new Error("Solo un Admin Tactika puede invitar usuarios cliente.");
    }

    const payload = validarPayload(await req.json());

    const { data: cliente, error: errorCliente } = await supabaseAdmin
      .from("clientes")
      .select("id, empresa")
      .eq("id", payload.clienteId)
      .maybeSingle();

    if (errorCliente) throw errorCliente;
    if (!cliente) throw new Error("Cliente no encontrado.");

    const { data: invitacion, error: errorInvitacion } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(payload.email, {
        data: {
          nombre: payload.nombre,
          cliente_id: payload.clienteId,
          tipo_usuario: payload.tipoUsuario,
        },
      });

    if (errorInvitacion) throw errorInvitacion;

    const usuarioInvitado = invitacion?.user;
    if (!usuarioInvitado?.id) {
      throw new Error("No se pudo crear la invitacion del usuario.");
    }

    const { error: errorPerfilInvitado } = await supabaseAdmin
      .from("perfiles")
      .upsert(
        {
          id: usuarioInvitado.id,
          nombre: payload.nombre,
          rol: "cliente",
          tipo_usuario: payload.tipoUsuario,
          cliente_id: payload.clienteId,
        },
        { onConflict: "id" }
      );

    if (errorPerfilInvitado) throw errorPerfilInvitado;

    return new Response(
      JSON.stringify({
        ok: true,
        message: `Invitacion enviada a ${payload.email}`,
        cliente: cliente.empresa,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Error al invitar usuario.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
