import {
  Building2,
  ClipboardCheck,
  Target,
  CalendarCheck,
  Activity,
} from "lucide-react";

function tiempoRelativo(fechaISO) {
  if (!fechaISO) return "";

  const diffMs = Date.now() - new Date(fechaISO).getTime();
  const minutos = Math.floor(diffMs / 60000);

  if (minutos < 1) return "Justo ahora";
  if (minutos < 60) return `Hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} hora${horas > 1 ? "s" : ""}`;

  const dias = Math.floor(horas / 24);
  return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
}

export default function RecentActivity({
  clientes = [],
  diagnosticos = [],
  planes = [],
  seguimientos = [],
}) {
  const actividades = [
    ...clientes.map((c) => ({
      icono: <Building2 className="text-blue-600" size={20} />,
      titulo: "Nuevo cliente registrado",
      descripcion: c.nombre || "Empresa incorporada al sistema.",
      fecha: c.createdAt,
    })),
    ...diagnosticos.map((d) => ({
      icono: <ClipboardCheck className="text-green-600" size={20} />,
      titulo: "Diagnóstico completado",
      descripcion: d.empresa || "Se registró un nuevo diagnóstico.",
      fecha: d.createdAt,
    })),
    ...planes.map((p) => ({
      icono: <Target className="text-orange-500" size={20} />,
      titulo: "Plan de acción creado",
      descripcion: p.accion || "Nuevo plan disponible.",
      fecha: p.createdAt,
    })),
    ...seguimientos.map((s) => ({
      icono: <CalendarCheck className="text-cyan-600" size={20} />,
      titulo: "Seguimiento registrado",
      descripcion: s.tarea || "Se modificó el estado de una tarea.",
      fecha: s.createdAt,
    })),
  ]
    .filter((a) => a.fecha)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 6);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">

      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-blue-600" />

        <h2 className="text-xl font-bold text-slate-800">
          Actividad Reciente
        </h2>
      </div>

      {actividades.length === 0 ? (
        <p className="text-sm text-slate-400">
          Todavía no hay actividad registrada.
        </p>
      ) : (
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
                    {tiempoRelativo(item.fecha)}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  {item.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}