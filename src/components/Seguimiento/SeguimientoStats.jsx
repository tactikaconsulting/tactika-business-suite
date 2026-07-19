export default function SeguimientoStats({ estadisticas }) {
  const cards = [
    {
      titulo: "Total",
      valor: estadisticas.total,
      color: "bg-blue-500",
    },
    {
      titulo: "Pendientes",
      valor: estadisticas.pendientes,
      color: "bg-red-500",
    },
    {
      titulo: "En proceso",
      valor: estadisticas.proceso,
      color: "bg-yellow-500",
    },
    {
      titulo: "Completados",
      valor: estadisticas.completados,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => (
        <div
          key={card.titulo}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className={`w-3 h-3 rounded-full ${card.color} mb-3`} />

          <h3 className="text-gray-500 text-sm">
            {card.titulo}
          </h3>

          <p className="text-3xl font-bold mt-2">
            {card.valor}
          </p>
        </div>
      ))}
    </div>
  );
}