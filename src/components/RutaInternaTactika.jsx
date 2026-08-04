import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { esUsuarioCliente } from "../utils/permisosUsuario";

export default function RutaInternaTactika() {
  const { perfil, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Cargando...
      </div>
    );
  }

  if (esUsuarioCliente(perfil)) {
    return <Navigate to="/portal-cliente" replace />;
  }

  return <Outlet />;
}
