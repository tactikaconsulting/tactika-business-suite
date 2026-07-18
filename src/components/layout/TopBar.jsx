import {
  Bell,
  Search,
  UserCircle,
} from "lucide-react";

export default function Topbar() {
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
              Claudio Urra
            </p>

            <p className="text-sm text-gray-500">
              Administrador
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}