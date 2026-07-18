import { FaTrash, FaEdit, FaEye } from "react-icons/fa";

export default function ClienteTable({
  clientes,
  onEliminar,
  onEditar,
}) {
  if (clientes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-500">
          No existen empresas registradas
        </h3>

        <p className="text-gray-400 mt-2">
          Agrega tu primera empresa para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-slate-800 text-white">

          <tr>

            <th className="p-4 text-left">Empresa</th>
            <th className="p-4 text-left">Contacto</th>
            <th className="p-4 text-left">Correo</th>
            <th className="p-4 text-left">Estado</th>
            <th className="p-4 text-center">Acciones</th>

          </tr>

        </thead>

        <tbody>

          {clientes.map((cliente) => (

            <tr
              key={cliente.id}
              className="border-b hover:bg-gray-50"
            >

              <td className="p-4 font-medium">
                {cliente.nombre}
              </td>

              <td className="p-4">
                {cliente.contacto}
              </td>

              <td className="p-4">
                {cliente.email}
              </td>

              <td className="p-4">

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold

                  ${
                    cliente.estado === "Activo"
                      ? "bg-green-100 text-green-700"

                    : cliente.estado === "Prospecto"
                      ? "bg-yellow-100 text-yellow-700"

                    : cliente.estado === "En Consultoría"
                      ? "bg-blue-100 text-blue-700"

                    : "bg-gray-200 text-gray-700"
                  }

                  `}
                >

                  {cliente.estado}

                </span>

              </td>

              <td className="p-4">

                <div className="flex justify-center gap-3">

                  <button
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEye />
                  </button>

                  <button
                    onClick={() => onEditar(cliente)}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => onEliminar(cliente.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}