export default function ClienteStats({ clientes }) {
  const total = clientes.length;

  const prospectos = clientes.filter(
    (cliente) => cliente.estado === "Prospecto"
  ).length;

  const activos = clientes.filter(
    (cliente) => cliente.estado === "Activo"
  ).length;

  const consultoria = clientes.filter(
    (cliente) => cliente.estado === "En Consultoría"
  ).length;

  const finalizados = clientes.filter(
    (cliente) => cliente.estado === "Finalizado"
  ).length;

  const cards = [
    {
      titulo: "Total Empresas",
      valor: total,
      color: "bg-slate-800",
    },
    {
      titulo: "Prospectos",
      valor: prospectos,
      color: "bg-yellow-500",
    },
    {
      titulo: "Activos",
      valor: activos,
      color: "bg-green-600",
    },
    {
      titulo: "En Consultoría",
      valor: consultoria,
      color: "bg-blue-600",
    },
    {
      titulo: "Finalizados",
      valor: finalizados,
      color: "bg-gray-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.titulo}
          className={`${card.color} text-white rounded-xl shadow-lg p-6`}
        >
          <p className="text-sm opacity-80">{card.titulo}</p>

          <h2 className="text-4xl font-bold mt-2">
            {card.valor}
          </h2>
        </div>
      ))}
    </div>
  );
}