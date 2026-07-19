import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function SeguimientoTable({
  seguimientos,
  onEditar,
  onEliminar,
}) {
  const eliminar = (id) => {
    Swal.fire({
      title: "¿Eliminar seguimiento?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        onEliminar(id);

        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "Seguimiento eliminado correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const colorEstado = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-red-100 text-red-700";

      case "En proceso":
        return "bg-yellow-100 text-yellow-700";

      case "Completado":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="text-left p-4">Tarea</th>

            <th className="text-left p-4">Responsable</th>

            <th className="text-left p-4">Fecha</th>

            <th className="text-left p-4">Estado</th>

            <th className="text-center p-4">Acciones</th>

          </tr>

        </thead>

        <tbody>

          {seguimientos.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="text-center py-10 text-gray-500"
              >
                No existen seguimientos registrados.
              </td>
            </tr>
          ) : (
            seguimientos.map((item) => (
              <tr
                key={item.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="p-4">{item.tarea}</td>

                <td className="p-4">{item.responsable}</td>

                <td className="p-4">{item.fecha}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${colorEstado(
                      item.estado
                    )}`}
                  >
                    {item.estado}
                  </span>
                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-3">

                    <button
                      onClick={() => onEditar(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => eliminar(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}