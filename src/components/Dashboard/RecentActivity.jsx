import { FaUserPlus, FaClipboardCheck, FaTasks } from "react-icons/fa";

export default function RecentActivity() {
  const actividades = [
    {
      icono: <FaUserPlus className="text-blue-600" />,
      titulo: "Cliente registrado",
      descripcion: "Se agregó un nuevo cliente al CRM.",
    },
    {
      icono: <FaClipboardCheck className="text-green-600" />,
      titulo: "Diagnóstico completado",
      descripcion: "Se registró un nuevo diagnóstico empresarial.",
    },
    {
      icono: <FaTasks className="text-orange-500" />,
      titulo: "Plan de acción creado",
      descripcion: "Se creó un nuevo plan de acción.",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-xl font-bold mb-6">
        Actividad Reciente
      </h2>

      <div className="space-y-5">

        {actividades.map((item, index) => (

          <div
            key={index}
            className="flex items-start gap-4 border-b pb-4"
          >

            <div className="text-2xl">
              {item.icono}
            </div>

            <div>

              <h3 className="font-semibold">
                {item.titulo}
              </h3>

              <p className="text-gray-500 text-sm">
                {item.descripcion}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}