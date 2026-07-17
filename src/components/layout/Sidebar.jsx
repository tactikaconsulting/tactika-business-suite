import { NavLink } from "react-router-dom";

const menu = [
  { name: "Dashboard", path: "/" },
  { name: "Clientes", path: "/clientes" },
  { name: "Diagnósticos", path: "/diagnosticos" },
  { name: "Planes de Acción", path: "/planes" },
  { name: "Seguimiento", path: "/seguimiento" },
  { name: "Reportes", path: "/reportes" },
  { name: "Configuración", path: "/configuracion" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">
          Táctika
        </h1>

        <p className="text-sm text-gray-400">
          Business Suite
        </p>
      </div>

      <nav className="mt-6">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-6 py-3 ${
                isActive
                  ? "bg-blue-600"
                  : "hover:bg-slate-700"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}