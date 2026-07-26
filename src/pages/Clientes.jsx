import { useState, useEffect } from "react";
import ClienteForm from "../components/Clientes/ClienteForm";
import ImportarArchivo from "../components/Shared/ImportarArchivo";
import Swal from "sweetalert2";
import {
  obtenerClientes,
  guardarCliente,
  actualizarCliente,
  eliminarCliente,
} from "../services/ClienteService";

const columnasImportacion = [
  { clave: "nombre", etiqueta: "Empresa", requerido: true },
  { clave: "rut", etiqueta: "RUT", requerido: false },
  { clave: "giro", etiqueta: "Giro", requerido: false },
  { clave: "contacto", etiqueta: "Contacto", requerido: false },
  { clave: "email", etiqueta: "Correo", requerido: false },
  { clave: "telefono", etiqueta: "Teléfono", requerido: false },
  { clave: "estado", etiqueta: "Estado", requerido: false },
];

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [clienteEditar, setClienteEditar] = useState(null);

  const cargarClientes = async () => {
    setCargando(true);
    try {
      const data = await obtenerClientes();
      setClientes(data);
    } catch (error) {
      alert("Error al cargar clientes: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const guardarClienteForm = async (cliente) => {
    try {
      if (cliente.id) {
        await actualizarCliente(cliente.id, cliente);
      } else {
        await guardarCliente(cliente);
      }
      setClienteEditar(null);
      await cargarClientes();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  async function importarClientes(filas) {
    let exitosos = 0;
    let fallidos = 0;

    for (const fila of filas) {
      if (!fila.nombre) {
        fallidos++;
        continue;
      }
      try {
        await guardarCliente({
          ...fila,
          estado: fila.estado || "Prospecto",
        });
        exitosos++;
      } catch (error) {
        fallidos++;
      }
    }

    await cargarClientes();

    if (fallidos > 0) {
      Swal.fire({
        icon: "warning",
        title: "Importación con observaciones",
        text: `${exitosos} clientes creados correctamente, ${fallidos} no se pudieron crear (revisa que tengan al menos el nombre de la empresa).`,
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Importación completa",
        text: `${exitosos} clientes creados correctamente.`,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    try {
      await eliminarCliente(id);
      await cargarClientes();
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <ImportarArchivo
          columnas={columnasImportacion}
          onImportar={importarClientes}
          nombreEntidad="clientes"
        />
      </div>

      <ClienteForm onGuardar={guardarClienteForm} clienteEditar={clienteEditar} />

      {cargando ? (
        <p>Cargando clientes...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">Empresa</th>
                <th className="p-3">RUT</th>
                <th className="p-3">Giro</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3">{c.nombre}</td>
                  <td className="p-3">{c.rut}</td>
                  <td className="p-3">{c.giro}</td>
                  <td className="p-3">{c.contacto}</td>
                  <td className="p-3">{c.estado}</td>
                  <td className="p-3 space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setClienteEditar(c)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => eliminar(c.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}