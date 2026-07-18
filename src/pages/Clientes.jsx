import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import ClienteForm from "../components/Clientes/ClienteForm";
import ClienteStats from "../components/Clientes/ClienteStats";
import ClienteSearch from "../components/Clientes/ClienteSearch";
import ClienteTable from "../components/Clientes/ClienteTable";

import {
  obtenerClientes,
  guardarCliente,
  eliminarCliente,
} from "../services/ClienteService";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [buscar, setBuscar] = useState("");

  useEffect(() => {
    cargarClientes();
  }, []);

  function cargarClientes() {
    setClientes(obtenerClientes());
  }

  function agregarCliente(cliente) {
    guardarCliente(cliente);
    cargarClientes();

    Swal.fire({
      icon: "success",
      title: "Empresa registrada",
      text: "La empresa fue registrada correctamente.",
      timer: 1800,
      showConfirmButton: false,
    });
  }

  function borrarCliente(id) {
    Swal.fire({
      title: "¿Eliminar empresa?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarCliente(id);
        cargarClientes();

        Swal.fire({
          icon: "success",
          title: "Empresa eliminada",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  function editarCliente(cliente) {
    Swal.fire({
      icon: "info",
      title: "Próximamente",
      text: `La edición de "${cliente.nombre}" estará disponible en el siguiente sprint.`,
    });
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = buscar.toLowerCase();

    return (
      cliente.nombre.toLowerCase().includes(texto) ||
      cliente.contacto.toLowerCase().includes(texto) ||
      cliente.email.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-slate-800">
        Gestión de Clientes
      </h1>

      <ClienteStats clientes={clientes} />

      <ClienteSearch
        buscar={buscar}
        setBuscar={setBuscar}
      />

      <ClienteForm onGuardar={agregarCliente} />

      <ClienteTable
        clientes={clientesFiltrados}
        onEliminar={borrarCliente}
        onEditar={editarCliente}
      />

    </div>
  );
}