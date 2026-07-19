import {
  Building2,
  ClipboardCheck,
  Target,
  CalendarCheck,
  Activity,
} from "lucide-react";

export default function RecentActivity() {
  const actividades = [
    {
      icono: <Building2 className="text-blue-600" size={20} />,
      titulo: "Nuevo cliente registrado",
      descripcion: "Empresa incorporada al sistema.",
      hora: "Hace 5 min",
    },
    {
      icono: <ClipboardCheck className="text-green-600" size={20} />,
      titulo: "Diagnóstico completado",
      descripcion: "Se registró un nuevo diagnóstico.",
      hora: "Hace 20 min",
    },
    {
      icono: <Target className="text-orange-500" size={20} />,
      titulo: "Plan de acción creado",
      descripcion: "Nuevo plan disponible.",
      hora: "Hace 1 hora",
    },
    {
      icono: <CalendarCheck className="text-cyan-600" size={20} />,
      titulo: "Seguimiento actualizado",
      descripcion: "Se modificó el estado de una tarea.",
      hora: "Hace 2 horas",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">

      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-blue-600" />

        <h2 className="text-xl font-bold text-slate-800">
          Actividad Reciente
        </h2>
      </div>

      <div className="space-y-4">

        {actividades.map((item, index) => (

          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition"
          >

            <div className="bg-slate-100 p-3 rounded-xl">
              {item.icono}
            </div>

            <div className="flex-1">

              <div className="flex justify-between">

                <h3 className="font-semibold text-slate-800">
                  {item.titulo}
                </h3>

                <span className="text-xs text-slate-400">
                  {item.hora}
                </span>

              </div>

              <p className="text-sm text-slate-500 mt-1">
                {item.descripcion}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}