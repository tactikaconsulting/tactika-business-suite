import { useEffect, useState } from "react";

import {
  WelcomeBanner,
  DashboardCards,
  DashboardChart,
  QuickActions,
  RecentActivity,
  PendingPlans,
} from "../components/Dashboard";
import AlertasSeguimiento from "../components/CRM/AlertasSeguimiento";

import { obtenerClientes } from "../services/ClienteService";
import { obtenerDiagnosticos } from "../services/DiagnosticoService";
import { obtenerPlanes } from "../services/PlanAccionService";
import { obtenerSeguimientos } from "../services/SeguimientoService";
import { obtenerProspectos } from "../services/ProspectoService";

export default function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [prospectos, setProspectos] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const [dataClientes, dataDiagnosticos, dataPlanes, dataSeguimientos, dataProspectos] =
      await Promise.all([
        obtenerClientes(),
        obtenerDiagnosticos(),
        obtenerPlanes(),
        obtenerSeguimientos(),
        obtenerProspectos(),
      ]);

    setClientes(dataClientes);
    setDiagnosticos(dataDiagnosticos);
    setPlanes(dataPlanes);
    setSeguimientos(dataSeguimientos);
    setProspectos(dataProspectos);
  }

  const planesFinalizados = planes.filter(
    (plan) => plan.estado === "Finalizado"
  ).length;

  const cumplimiento =
    planes.length === 0
      ? 0
      : Math.round((planesFinalizados / planes.length) * 100);

  return (
    <div className="space-y-8">

      <WelcomeBanner />

      <AlertasSeguimiento prospectos={prospectos} onEditar={() => {}} />

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

      <div className="grid xl:grid-cols-2 gap-6">
        <RecentActivity
          clientes={clientes}
          diagnosticos={diagnosticos}
          planes={planes}
          seguimientos={seguimientos}
        />
        <PendingPlans planes={planes} />
      </div>

    </div>
  );
}