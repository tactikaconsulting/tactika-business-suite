import { obtenerClientes } from "./ClienteService";
import { obtenerDiagnosticos } from "./DiagnosticoService";
import { obtenerPlanes } from "./PlanService";
import {
  obtenerSeguimientos,
  calcularAvance,
} from "./seguimientoService";

export function obtenerDashboard() {
  const clientes = obtenerClientes();
  const diagnosticos = obtenerDiagnosticos();
  const planes = obtenerPlanes();
  const seguimientos = obtenerSeguimientos();

  return {
    totalClientes: clientes.length,

    totalDiagnosticos: diagnosticos.length,

    totalPlanes: planes.length,

    totalSeguimientos: seguimientos.length,

    avance: calcularAvance(),

    pendientes: seguimientos.filter(
      (s) => s.estado === "Pendiente"
    ).length,

    proceso: seguimientos.filter(
      (s) => s.estado === "En proceso"
    ).length,

    completados: seguimientos.filter(
      (s) => s.estado === "Completado"
    ).length,
  };
}