import {
  AlertTriangle,
  Clock3,
  CheckCircle2,
} from "lucide-react";

export default function PendingPlans() {
  const planes = [
    {
      empresa: "Empresa Demo",
      plan: "Actualizar Reglamento Interno",
      fecha: "25 Jul 2026",
      estado: "Pendiente",
      color: "bg-red-100 text-red-700",
      icono: <AlertTriangle size={18} />,
    },
    {
      empresa: "Transportes Norte",
      plan: "Capacitación de Personal",
      fecha: "28 Jul 2026",
      estado: "En proceso",
      color: "bg-yellow-100 text-yellow-700",
      icono: <Clock3 size={18} />,
    },
    {
      empresa: "Comercial Sur",
      plan: "Evaluación de Desempeño",
      fecha: "30 Jul 2026",
      estado: "Completado",
      color: "bg-green-100 text-green-700",
      icono: <CheckCircle2 size={18} />,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Próximos Planes
      </h2>

      <div className="space-y-4">

        {planes.map((plan, index) => (
          <div
            key={index}
            className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">

              <div>

                <h3 className="font-semibold text-slate-800">
                  {plan.plan}
                </h3>

                <p className="text-sm text-slate-500">
                  {plan.empresa}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Fecha límite: {plan.fecha}
                </p>

              </div>

              <span
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${plan.color}`}
              >
                {plan.icono}
                {plan.estado}
              </span>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}