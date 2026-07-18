export default function PendingPlans() {
  const planes = [
    "Actualizar plan comercial",
    "Implementar proceso de RRHH",
    "Definir indicadores KPI",
    "Crear presupuesto anual",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-xl font-bold mb-6">
        Planes Pendientes
      </h2>

      <ul className="space-y-3">

        {planes.map((plan, index) => (

          <li
            key={index}
            className="flex justify-between items-center border-b pb-2"
          >

            <span>{plan}</span>

            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
              Pendiente
            </span>

          </li>

        ))}

      </ul>

    </div>
  );
}