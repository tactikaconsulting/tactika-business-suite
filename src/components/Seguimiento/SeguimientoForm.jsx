import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

export default function SeguimientoForm({
  onGuardar,
  seguimientoSeleccionado,
}) {
  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  useEffect(() => {
    if (seguimientoSeleccionado) {
      reset(seguimientoSeleccionado);
    } else {
      reset({
        tarea: "",
        responsable: "",
        fecha: "",
        estado: "Pendiente",
      });
    }
  }, [seguimientoSeleccionado, reset]);

  const guardar = (data) => {
    if (seguimientoSeleccionado?.id) {
      data.id = seguimientoSeleccionado.id;
      data.fechaCreacion = seguimientoSeleccionado.fechaCreacion;
    }

    onGuardar(data);

    Swal.fire({
      icon: "success",
      title: "Guardado",
      text: "Seguimiento guardado correctamente.",
      timer: 1500,
      showConfirmButton: false,
    });

    reset({
      tarea: "",
      responsable: "",
      fecha: "",
      estado: "Pendiente",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(guardar)}
      className="bg-white rounded-xl shadow-md p-6 mb-6"
    >
      <h2 className="text-xl font-bold mb-6">
        {seguimientoSeleccionado
          ? "Editar Seguimiento"
          : "Nuevo Seguimiento"}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        <div>
          <label className="block mb-2 font-medium">
            Tarea
          </label>

          <input
            {...register("tarea", { required: true })}
            className="w-full border rounded-lg p-3"
            placeholder="Nombre de la tarea"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Responsable
          </label>

          <input
            {...register("responsable", { required: true })}
            className="w-full border rounded-lg p-3"
            placeholder="Responsable"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Fecha límite
          </label>

          <input
            type="date"
            {...register("fecha", { required: true })}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Estado
          </label>

          <select
            {...register("estado")}
            className="w-full border rounded-lg p-3"
          >
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Completado</option>
          </select>
        </div>

      </div>

      <button
        type="submit"
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
      >
        Guardar Seguimiento
      </button>
    </form>
  );
}