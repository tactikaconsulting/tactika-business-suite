import {
  AlertTriangle,
  Clock3,
  CheckCircle2,
} from "lucide-react";

export default function PendingPlans({ planes = [] }) {

  const pendientes = planes.filter(
    (plan) =>
      plan.estado === "Pendiente" ||
      plan.estado === "En proceso"
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Próximos Planes
      </h2>

      {pendientes.length === 0 ? (

        <div className="text-center py-10 text-slate-400">
          No existen planes pendientes.
        </div>

      ) : (

        <div className="space-y-4">

          {pendientes.map((plan) => (

            <div
              key={plan.id}
              className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition"
            >

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="font-semibold text-slate-800">
                    {plan.accion || plan.plan}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {plan.responsable || "-"}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Fecha: {plan.fecha || "-"}
                  </p>

                </div>

                <span
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                    plan.estado === "Pendiente"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >

                  {plan.estado === "Pendiente" ? (
                    <AlertTriangle size={18} />
                  ) : (
                    <Clock3 size={18} />
                  )}

                  {plan.estado}

                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}