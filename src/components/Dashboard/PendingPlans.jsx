import { obtenerPlanes } from "../../services/PlanAccionService";
import { useEffect, useState } from "react";

export default function PendingPlans() {
  const [planes, setPlanes] = useState([]);

  useEffect(() => {
    setPlanes(obtenerPlanes());
  }, []);

  const pendientes = planes.filter((plan) => plan.estado !== "Finalizado");

  function colorBadge(estado) {
    switch (estado) {
      case "En Proceso":
        return "bg-blue-100 text-blue-700";
      case "Finalizado":
        return "bg-green-100 text-green-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
      <h2 className="text-xl font-bold mb-6 text-slate-800">
        Planes Pendientes
      </h2>

      {pendientes.length === 0 ? (
        <p className="text-slate-400 text-sm">
          No hay planes pendientes por el momento.
        </p>
      ) : (
        <ul className="space-y-3">
          {pendientes.map((plan) => (
            <li
              key={plan.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="text-slate-700 font-medium">{plan.accion}</p>
                <p className="text-slate-400 text-xs">
                  {plan.empresa} · {plan.area}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm ${colorBadge(
                  plan.estado
                )}`}
              >
                {plan.estado}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}