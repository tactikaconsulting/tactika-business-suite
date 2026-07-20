import { useState, useEffect } from "react";
import ClienteForm from "../components/Clientes/ClienteForm";
import {
  obtenerClientes,
  guardarCliente,
  actualizarCliente,
  eliminarCliente,
} from "../services/ClienteService";

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
      <h1 className="text-3xl font-bold">Clientes</h1>

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