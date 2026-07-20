import {
  Building2,
  ClipboardCheck,
  Target,
  CalendarCheck,
  Activity,
} from "lucide-react";

export default function RecentActivity({
  clientes = [],
  diagnosticos = [],
  planes = [],
  seguimientos = [],
}) {

  const actividades = [];

  clientes.slice(0, 2).forEach((cliente) => {
    actividades.push({
      icono: <Building2 className="text-blue-600" size={20} />,
      titulo: "Nuevo cliente",
      descripcion: cliente.nombre || cliente.empresa,
    });
  });

  diagnosticos.slice(0, 2).forEach((item) => {
    actividades.push({
      icono: <ClipboardCheck className="text-green-600" size={20} />,
      titulo: "Diagnóstico registrado",
      descripcion: item.nombre || item.empresa || "",
    });
  });

  planes.slice(0, 2).forEach((plan) => {
    actividades.push({
      icono: <Target className="text-orange-500" size={20} />,
      titulo: "Plan creado",
      descripcion: plan.accion || plan.plan || "",
    });
  });

  seguimientos.slice(0, 2).forEach((seg) => {
    actividades.push({
      icono: <CalendarCheck className="text-cyan-600" size={20} />,
      titulo: "Seguimiento actualizado",
      descripcion: seg.accion || seg.descripcion || "",
    });
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">

      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-blue-600" />

        <h2 className="text-xl font-bold text-slate-800">
          Actividad Reciente
        </h2>
      </div>

      {actividades.length === 0 ? (

        <div className="text-center py-10 text-slate-400">
          No hay actividad registrada.
        </div>

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

              <div>

                <h3 className="font-semibold text-slate-800">
                  {item.titulo}
                </h3>

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