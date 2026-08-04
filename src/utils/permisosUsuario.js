const tiposCliente = ["cliente_admin", "cliente_usuario"];
const tiposTactika = ["admin_tactika", "consultor_tactika"];

export function esUsuarioCliente(perfil) {
  return tiposCliente.includes(perfil?.tipo_usuario);
}

export function esUsuarioTactika(perfil) {
  if (!perfil?.tipo_usuario) return true;
  return tiposTactika.includes(perfil.tipo_usuario);
}

export function nombreTipoUsuario(perfil) {
  if (perfil?.tipo_usuario === "admin_tactika") return "Admin Tactika";
  if (perfil?.tipo_usuario === "consultor_tactika") return "Consultor Tactika";
  if (perfil?.tipo_usuario === "cliente_admin") return "Cliente Admin";
  if (perfil?.tipo_usuario === "cliente_usuario") return "Cliente Usuario";
  return perfil?.rol || "Usuario interno";
}
