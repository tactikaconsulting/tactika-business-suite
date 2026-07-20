import {
  Bell,
  Search,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { perfil, cerrarSesion } = useAuth();

  return (
    <header className="bg-white shadow px-8 h-16 flex items-center justify-between">

      <div className="flex items-center gap-3 border rounded-lg px-4 py-2 w-96">

        <Search size={18} className="text-gray-400" />

        <input
          placeholder="Buscar..."
          className="outline-none w-full"
        />

      </div>

      <div className="flex items-center gap-6">

        <Bell className="text-gray-500 cursor-pointer" />

        <div className="flex items-center gap-2">

          <UserCircle size={35} />

          <div>

            <p className="font-semibold">
              {perfil?.nombre || "Usuario"}
            </p>

            <p className="text-sm text-gray-500 capitalize">
              {perfil?.rol || "..."}
            </p>

          </div>

        </div>

        <button
          onClick={cerrarSesion}
          className="text-gray-500 hover:text-red-600 flex items-center gap-1"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>

      </div>

    </header>
  );
}