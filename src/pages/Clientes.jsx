import { useEffect, useState } from "react";
import ClienteForm from "../components/clientes/ClienteForm";
import {
  obtenerClientes,
  guardarCliente,
} from "../services/clienteService";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    setClientes(obtenerClientes());
  }, []);

  const agregarCliente = (cliente) => {
    guardarCliente(cliente);
    setClientes(obtenerClientes());
  };

  return (
    <div className="space-y-8">
      <ClienteForm onGuardar={agregarCliente} />

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">
          Empresas Registradas
        </h2>

        {clientes.length === 0 ? (
          <p>No hay empresas registradas.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Empresa</th>
                <th className="text-left p-2">Contacto</th>
                <th className="text-left p-2">Correo</th>
                <th className="text-left p-2">Estado</th>
              </tr>
            </thead>

            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="border-b">
                  <td className="p-2">{cliente.nombre}</td>
                  <td className="p-2">{cliente.contacto}</td>
                  <td className="p-2">{cliente.email}</td>
                  <td className="p-2">{cliente.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}