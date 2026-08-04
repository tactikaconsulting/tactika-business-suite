import { supabase } from "../lib/supabase";

const nombresTipoUsuario = {
  admin_tactika: "Admin Tactika",
  consultor_tactika: "Consultor Tactika",
  cliente_admin: "Cliente Admin",
  cliente_usuario: "Cliente Usuario",
};

function aPerfil(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    rol: fila.rol,
    tipoUsuario: fila.tipo_usuario,
    clienteId: fila.cliente_id,
    clienteNombre: fila.cliente_nombre || "",
    createdAt: fila.created_at,
  };
}

export function nombreTipoUsuario(tipoUsuario) {
  return nombresTipoUsuario[tipoUsuario] || "Sin acceso cliente";
}

export async function obtenerPerfilesAccesoCliente() {
  const { data, error } = await supabase.rpc("obtener_perfiles_acceso_cliente");

  if (error) {
    console.error(error);
    throw error;
  }

  return (data || []).map(aPerfil);
}

export async function asignarUsuarioCliente({ perfilId, tipoUsuario, clienteId }) {
  const { error } = await supabase.rpc("asignar_usuario_cliente", {
    perfil_id: perfilId,
    nuevo_tipo_usuario: tipoUsuario,
    nuevo_cliente_id: clienteId,
  });

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function quitarAccesoCliente(perfilId) {
  const { error } = await supabase.rpc("quitar_acceso_cliente", {
    perfil_id: perfilId,
  });

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function invitarUsuarioCliente({ nombre, email, clienteId, tipoUsuario }) {
  const { data, error } = await supabase.functions.invoke("invitar-usuario-cliente", {
    body: {
      nombre,
      email,
      clienteId,
      tipoUsuario,
    },
  });

  if (error) {
    console.error(error);
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}
