import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Target,
  CalendarCheck,
  CalendarDays,
  TrendingUp,
  BarChart3,
  Settings,
  Briefcase,
  DollarSign,
  Sparkles,
  Rocket,
  MonitorSmartphone,
} from "lucide-react";

import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import { useAuth } from "../../context/AuthContext";
import { esUsuarioCliente } from "../../utils/permisosUsuario";

export default function Sidebar() {
  const { perfil } = useAuth();
  const usuarioCliente = esUsuarioCliente(perfil);

  return (
    <aside className="w-72 bg-slate-900 min-h-screen flex flex-col shadow-xl">

      <Logo />

      <nav className="flex-1 mt-6 space-y-1">

        {!usuarioCliente && (
          <>
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
              to="/agenda"
              icon={CalendarDays}
              text="Agenda"
            />

            <SidebarItem
              to="/resultados"
              icon={TrendingUp}
              text="Resultados"
            />

            <SidebarItem
              to="/prospeccion-ia"
              icon={Sparkles}
              text="Prospección IA"
            />

            <SidebarItem
              to="/crm"
              icon={Briefcase}
              text="CRM Comercial"
            />

            <SidebarItem
              to="/implementaciones"
              icon={Rocket}
              text="Implementaciones"
            />
          </>
        )}

        <SidebarItem
          to="/portal-cliente"
          icon={MonitorSmartphone}
          text="Portal Cliente"
        />

        {!usuarioCliente && (
          <>
            <SidebarItem
              to="/ventas"
              icon={DollarSign}
              text="Ventas"
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
          </>
        )}

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
