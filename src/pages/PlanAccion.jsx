import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { obtenerPlanes, guardarPlan, eliminarPlan, actualizarEstado } from "../services/PlanAccionService";
export default function PlanAccion() {
  const [planes, setPlanes] = useState([]);

  const [formulario, setFormulario] = useState({
    empresa: "",
    area: "",
    accion: "",
    responsable: "",
    prioridad: "Media",
  });

  useEffect(() => {
    cargarPlanes();
  }, []);

  function cargarPlanes() {
    setPlanes(obtenerPlanes());
  }

  function cambiar(e) {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  }

  function guardar(e) {
    e.preventDefault();

    guardarPlan(formulario);

    cargarPlanes();

    setFormulario({
      empresa: "",
      area: "",
      accion: "",
      responsable: "",
      prioridad: "Media",
    });

    Swal.fire({
      icon: "success",
      title: "Plan guardado",
      timer: 1500,
      showConfirmButton: false,
    });
  }

  function borrar(id) {
    Swal.fire({
      title: "¿Eliminar plan?",
      icon: "warning",
      showCancelButton: true,
    }).then((r) => {
      if (r.isConfirmed) {
        eliminarPlan(id);
        cargarPlanes();
      }
    });
  }

  function cambiarEstado(id, estado) {
    actualizarEstado(id, estado);
    cargarPlanes();
  }

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">
        Plan de Acción
      </h1>

      <form
        onSubmit={guardar}
        className="bg-white rounded-xl shadow p-6 grid grid-cols-2 gap-4"
      >
        <input
          name="empresa"
          placeholder="Empresa"
          value={formulario.empresa}
          onChange={cambiar}
          className="border rounded-lg p-3"
          required
        />

        <input
          name="area"
          placeholder="Área"
          value={formulario.area}
          onChange={cambiar}
          className="border rounded-lg p-3"
          required
        />

        <input
          name="accion"
          placeholder="Acción"
          value={formulario.accion}
          onChange={cambiar}
          className="border rounded-lg p-3"
          required
        />

        <input
          name="responsable"
          placeholder="Responsable"
          value={formulario.responsable}
          onChange={cambiar}
          className="border rounded-lg p-3"
          required
        />

        <select
          name="prioridad"
          value={formulario.prioridad}
          onChange={cambiar}
          className="border rounded-lg p-3"
        >
          <option>Alta</option>
          <option>Media</option>
          <option>Baja</option>
        </select>

        <button
          className="bg-blue-600 text-white rounded-lg"
        >
          Guardar Plan
        </button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-800 text-white">

            <tr>
              <th className="p-3">Empresa</th>
              <th>Área</th>
              <th>Acción</th>
              <th>Responsable</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>

          </thead>

          <tbody>

            {planes.map((plan) => (

              <tr
                key={plan.id}
                className="border-b"
              >

                <td className="p-3">{plan.empresa}</td>

                <td>{plan.area}</td>

                <td>{plan.accion}</td>

                <td>{plan.responsable}</td>

                <td>{plan.prioridad}</td>

                <td>

                  <select
                    value={plan.estado}
                    onChange={(e) =>
                      cambiarEstado(plan.id, e.target.value)
                    }
                    className="border rounded"
                  >
                    <option>Pendiente</option>
                    <option>En Proceso</option>
                    <option>Finalizado</option>
                  </select>

                </td>

                <td>

                  <button
                    onClick={() => borrar(plan.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}