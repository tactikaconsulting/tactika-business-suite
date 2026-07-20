import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida() {
  const { sesion, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Cargando...
      </div>
    );
  }

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}