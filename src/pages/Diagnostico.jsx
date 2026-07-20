import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import DiagnosticoForm from "../components/Diagnostico/DiagnosticoForm";

import {
  obtenerDiagnosticos,
  guardarDiagnostico,
  eliminarDiagnostico,
  obtenerResultado,
} from "../services/DiagnosticoService";
import { obtenerClientes } from "../services/ClienteService";

export default function Diagnostico() {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    cargarDiagnosticos();
    cargarClientes();
  }, []);

  async function cargarDiagnosticos() {
    const data = await obtenerDiagnosticos();
    setDiagnosticos(data);
  }

  async function cargarClientes() {
    const data = await obtenerClientes();
    setClientes(data);
  }

  async function guardar(datos) {
    const resultado = obtenerResultado(datos.preguntas);

    try {
      await guardarDiagnostico({
        ...datos,
        resultado,
      });

      await cargarDiagnosticos();

      Swal.fire({
        icon: "success",
        title: "Diagnóstico guardado",
        text: "El diagnóstico fue registrado correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error.message,
      });
    }
  }

  function eliminar(id) {
    Swal.fire({
      title: "¿Eliminar diagnóstico?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarDiagnostico(id);
          await cargarDiagnosticos();

          Swal.fire({
            icon: "success",
            title: "Diagnóstico eliminado",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error al eliminar",
            text: error.message,
          });
        }
      }
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">
        Diagnóstico Empresarial
      </h1>

      <DiagnosticoForm onGuardar={guardar} clientes={clientes} />

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
                <td colSpan="4" className="text-center p-8 text-gray-500">
                  No existen diagnósticos registrados.
                </td>
              </tr>
            ) : (
              diagnosticos.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{item.empresa}</td>

                  <td className="text-center p-4">
                    <span className="font-bold text-blue-600">
                      {item.resultado}%
                    </span>
                  </td>

                  <td className="text-center p-4">{item.fecha}</td>

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