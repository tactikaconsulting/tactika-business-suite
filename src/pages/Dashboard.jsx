import { useEffect, useState } from "react";

import {
  DashboardCards,
  DashboardChart,
  RecentActivity,
  PendingPlans,
  QuickActions,
} from "../components/Dashboard";

import { obtenerClientes } from "../services/ClienteService";
import { obtenerDiagnosticos } from "../services/DiagnosticoService";
import { obtenerPlanes } from "../services/PlanAccionService";
import { obtenerSeguimientos } from "../services/SeguimientoService";

export default function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);

  useEffect(() => {
    setClientes(obtenerClientes());
    setDiagnosticos(obtenerDiagnosticos());
    setPlanes(obtenerPlanes());
    setSeguimientos(obtenerSeguimientos());
  }, []);

  const planesFinalizados = planes.filter(
    (plan) => plan.estado === "Finalizado"
  ).length;

  const cumplimiento =
    planes.length === 0
      ? 0
      : Math.round((planesFinalizados / planes.length) * 100);

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard Ejecutivo
        </h1>

        <p className="text-slate-500 mt-2">
          Bienvenido a Táctika Business Suite
        </p>
      </div>

      <DashboardCards
        clientes={clientes.length}
        diagnosticos={diagnosticos.length}
        planes={planes.length}
        seguimientos={seguimientos.length}
        cumplimiento={cumplimiento}
      />

      <DashboardChart
        clientes={clientes.length}
        diagnosticos={diagnosticos.length}
        planes={planes.length}
        seguimientos={seguimientos.length}
      />

      <QuickActions />

      <div className="grid lg:grid-cols-2 gap-6">
        <RecentActivity />
        <PendingPlans />
      </div>

    </div>
  );
}