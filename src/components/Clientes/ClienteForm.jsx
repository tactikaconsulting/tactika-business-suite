import { useState } from "react";

export default function ClienteForm({ onGuardar }) {
  const [cliente, setCliente] = useState({
    nombre: "",
    rut: "",
    giro: "",
    contacto: "",
    email: "",
    telefono: "",
    estado: "Prospecto",
  });

  const cambiarValor = (e) => {
    setCliente({
      ...cliente,
      [e.target.name]: e.target.value,
    });
  };

  const guardar = (e) => {
    e.preventDefault();

    onGuardar(cliente);

    setCliente({
      nombre: "",
      rut: "",
      giro: "",
      contacto: "",
      email: "",
      telefono: "",
      estado: "Prospecto",
    });
  };

  return (
    <form
      onSubmit={guardar}
      className="bg-white rounded-xl shadow p-6 space-y-4"
    >
      <h2 className="text-2xl font-bold">
        Nueva Empresa Cliente
      </h2>

      <input
        className="w-full border rounded p-2"
        placeholder="Empresa"
        name="nombre"
        value={cliente.nombre}
        onChange={cambiarValor}
      />

      <input
        className="w-full border rounded p-2"
        placeholder="RUT"
        name="rut"
        value={cliente.rut}
        onChange={cambiarValor}
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Giro"
        name="giro"
        value={cliente.giro}
        onChange={cambiarValor}
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Contacto"
        name="contacto"
        value={cliente.contacto}
        onChange={cambiarValor}
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Correo"
        name="email"
        value={cliente.email}
        onChange={cambiarValor}
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Teléfono"
        name="telefono"
        value={cliente.telefono}
        onChange={cambiarValor}
      />

      <select
        className="w-full border rounded p-2"
        name="estado"
        value={cliente.estado}
        onChange={cambiarValor}
      >
        <option>Prospecto</option>
        <option>Activo</option>
        <option>En Consultoría</option>
        <option>Finalizado</option>
      </select>

      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Guardar Empresa
      </button>
    </form>
  );
}