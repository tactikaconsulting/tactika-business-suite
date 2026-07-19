import {
  FaUsers,
  FaClipboardCheck,
  FaTasks,
  FaChartLine,
  FaCalendarCheck,
} from "react-icons/fa";

export default function DashboardCards({
  clientes = 0,
  diagnosticos = 0,
  planes = 0,
  seguimientos = 0,
  cumplimiento = 0,
}) {
  const cards = [
    {
      titulo: "Clientes",
      valor: clientes,
      icono: <FaUsers size={30} />,
      color: "bg-blue-500",
    },
    {
      titulo: "Diagnósticos",
      valor: diagnosticos,
      icono: <FaClipboardCheck size={30} />,
      color: "bg-green-500",
    },
    {
      titulo: "Planes de Acción",
      valor: planes,
      icono: <FaTasks size={30} />,
      color: "bg-orange-500",
    },
    {
      titulo: "Seguimientos",
      valor: seguimientos,
      icono: <FaCalendarCheck size={30} />,
      color: "bg-cyan-500",
    },
    {
      titulo: "Cumplimiento",
      valor: `${cumplimiento}%`,
      icono: <FaChartLine size={30} />,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
      {cards.map((card) => (
        <div
          key={card.titulo}
          className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-slate-100"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                {card.titulo}
              </p>

              <h2 className="text-3xl font-bold mt-2 text-slate-800">
                {card.valor}
              </h2>
            </div>

            <div className={`${card.color} text-white rounded-xl p-4`}>
              {card.icono}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}