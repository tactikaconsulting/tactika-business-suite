import { useNavigate } from "react-router-dom";
import {
  Users,
  ClipboardCheck,
  Target,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";

export default function QuickActions() {
  const navigate = useNavigate();

  const acciones = [
    {
      titulo: "Clientes",
      descripcion: "Administrar clientes",
      icono: <Users size={24} />,
      color: "bg-blue-500",
      ruta: "/clientes",
    },
    {
      titulo: "Diagnósticos",
      descripcion: "Ver diagnósticos",
      icono: <ClipboardCheck size={24} />,
      color: "bg-green-500",
      ruta: "/diagnosticos",
    },
    {
      titulo: "Planes",
      descripcion: "Gestionar planes",
      icono: <Target size={24} />,
      color: "bg-orange-500",
      ruta: "/planes",
    },
    {
      titulo: "Seguimientos",
      descripcion: "Control de seguimiento",
      icono: <CalendarCheck size={24} />,
      color: "bg-cyan-500",
      ruta: "/seguimiento",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Accesos rápidos
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        {acciones.map((accion) => (
          <button
            key={accion.titulo}
            onClick={() => navigate(accion.ruta)}
            className="text-left border border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-center">

              <div className={`${accion.color} text-white rounded-xl p-3`}>
                {accion.icono}
              </div>

              <ArrowRight className="text-slate-400" size={20} />

            </div>

            <h3 className="font-bold text-slate-800 mt-4">
              {accion.titulo}
            </h3>

            <p className="text-sm text-slate-500">
              {accion.descripcion}
            </p>

          </button>
        ))}

      </div>

    </div>
  );
}