import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import DiagnosticoForm from "../components/diagnostico/DiagnosticoForm";

import { obtenerDiagnosticos, guardarDiagnostico, eliminarDiagnostico, obtenerResultado } from "../services/DiagnosticoService";

export default function Diagnostico() {
  const [diagnosticos, setDiagnosticos] = useState([]);

  useEffect(() => {
    cargarDiagnosticos();
  }, []);

  function cargarDiagnosticos() {
    setDiagnosticos(obtenerDiagnosticos());
  }

  function guardar(datos) {
    const resultado = obtenerResultado(datos.preguntas);

    guardarDiagnostico({
      ...datos,
      resultado,
    });

    cargarDiagnosticos();

    Swal.fire({
      icon: "success",
      title: "Diagnóstico guardado",
      text: "El diagnóstico fue registrado correctamente.",
      timer: 1800,
      showConfirmButton: false,
    });
  }

  function eliminar(id) {
    Swal.fire({
      title: "¿Eliminar diagnóstico?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarDiagnostico(id);
        cargarDiagnosticos();

        Swal.fire({
          icon: "success",
          title: "Diagnóstico eliminado",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold text-slate-800">
        Diagnóstico Empresarial
      </h1>

      <DiagnosticoForm onGuardar={guardar} />

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-800 text-white">

            <tr>
              <th className="p-4 text-left">Empresa</th>
              <th className="p-4 text-center">Resultado</th>
              <th className="p-4 text-center">Fecha</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>

          </thead>

          <tbody>

            {diagnosticos.length === 0 ? (

              <tr>

                <td
                  colSpan="4"
                  className="text-center p-8 text-gray-500"
                >
                  No existen diagnósticos registrados.
                </td>

              </tr>

            ) : (

              diagnosticos.map((item) => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4 font-medium">
                    {item.empresa}
                  </td>

                  <td className="text-center p-4">
                    <span className="font-bold text-blue-600">
                      {item.resultado}%
                    </span>
                  </td>

                  <td className="text-center p-4">
                    {item.fecha}
                  </td>

                  <td className="text-center p-4">

                    <button
                      onClick={() => eliminar(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Eliminar
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}