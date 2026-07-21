import {
  AlertTriangle,
  Clock3,
  CheckCircle2,
} from "lucide-react";

const estilosPorEstado = {
  Pendiente: { color: "bg-red-100 text-red-700", icono: <AlertTriangle size={18} /> },
  "En Proceso": { color: "bg-yellow-100 text-yellow-700", icono: <Clock3 size={18} /> },
  Finalizado: { color: "bg-green-100 text-green-700", icono: <CheckCircle2 size={18} /> },
};

export default function PendingPlans({ planes = [] }) {
  const proximos = planes
    .filter((p) => p.estado !== "Finalizado" && p.fechaLimite)
    .sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Próximos Planes
      </h2>

      {proximos.length === 0 ? (
        <p className="text-sm text-slate-400">
          No hay planes pendientes con fecha límite registrada.
        </p>
      ) : (
        <div className="space-y-4">
          {proximos.map((plan) => {
            const estilo = estilosPorEstado[plan.estado] || estilosPorEstado.Pendiente;

            return (
              <div
                key={plan.id}
                className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {plan.accion}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {plan.empresa}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Fecha límite: {plan.fechaLimite}
                    </p>
                  </div>

                  <span
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${estilo.color}`}
                  >
                    {estilo.icono}
                    {plan.estado}
                  </span>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}