import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Target,
  CalendarCheck,
  BarChart3,
  Settings,
  Briefcase,
} from "lucide-react";

import Logo from "./Logo";
import SidebarItem from "./SidebarItem";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-slate-900 min-h-screen flex flex-col shadow-xl">

      <Logo />

      <nav className="flex-1 mt-6 space-y-1">

        <SidebarItem
          to="/"
          icon={LayoutDashboard}
          text="Dashboard"
        />

        <SidebarItem
          to="/clientes"
          icon={Users}
          text="Clientes"
        />

        <SidebarItem
          to="/diagnosticos"
          icon={ClipboardCheck}
          text="Diagnósticos"
        />

        <SidebarItem
          to="/planes"
          icon={Target}
          text="Planes de Acción"
        />

        <SidebarItem
          to="/seguimiento"
          icon={CalendarCheck}
          text="Seguimiento"
        />

        <SidebarItem
          to="/crm"
          icon={Briefcase}
          text="CRM Comercial"
        />

        <SidebarItem
          to="/reportes"
          icon={BarChart3}
          text="Reportes"
        />

        <SidebarItem
          to="/configuracion"
          icon={Settings}
          text="Configuración"
        />

      </nav>

      <div className="border-t border-slate-700 p-4">

        <p className="text-gray-400 text-xs text-center">
          Táctika Business Suite
        </p>

        <p className="text-gray-500 text-xs text-center mt-1">
          Versión 1.0
        </p>

      </div>

    </aside>
  );
}