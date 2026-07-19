import { Link } from "react-router-dom";
import {
  Users,
  ClipboardCheck,
  Target,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";

export default function QuickActions() {
  const acciones = [
    {
      titulo: "Nuevo Cliente",
      descripcion: "Registrar un nuevo cliente",
      icono: <Users size={24} />,
      color: "bg-blue-500",
      ruta: "/clientes",
    },
    {
      titulo: "Nuevo Diagnóstico",
      descripcion: "Crear un diagnóstico",
      icono: <ClipboardCheck size={24} />,
      color: "bg-green-500",
      ruta: "/diagnosticos",
    },
    {
  titulo: "Nuevo Plan",
  descripcion: "Agregar plan de acción",
  icono: <Target size={24} />,
  color: "bg-orange-500",
  ruta: "/planes",
},
    {
      titulo: "Nuevo Seguimiento",
      descripcion: "Registrar seguimiento",
      icono: <CalendarCheck size={24} />,
      color: "bg-cyan-500",
      ruta: "/seguimiento",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Accesos Rápidos
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        {acciones.map((accion) => (
          <Link
            key={accion.titulo}
            to={accion.ruta}
            className="group border border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-center">

              <div className={`text-white p-3 rounded-xl ${accion.color}`}>
                {accion.icono}
              </div>

              <ArrowRight
                size={20}
                className="text-slate-400 group-hover:text-blue-600"
              />

            </div>

            <h3 className="font-bold text-slate-800 mt-4">
              {accion.titulo}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {accion.descripcion}
            </p>

          </Link>
        ))}

      </div>

    </div>
  );
}