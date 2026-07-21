import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import ProspectoForm from "../components/CRM/ProspectoForm";
import ProspectoTable from "../components/CRM/ProspectoTable";

import {
  obtenerProspectos,
  crearProspecto,
  actualizarProspecto,
  eliminarProspecto,
} from "../services/ProspectoService";

export default function CRMComercial() {
  const [prospectos, setProspectos] = useState([]);
  const [prospectoEditar, setProspectoEditar] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const data = await obtenerProspectos();
    setProspectos(data);
  }

  async function guardar(datos) {
    try {
      if (prospectoEditar) {
        await actualizarProspecto(prospectoEditar.id, datos);
      } else {
        await crearProspecto(datos);
      }

      setProspectoEditar(null);
      await cargar();

      Swal.fire({
        icon: "success",
        title: prospectoEditar ? "Prospecto actualizado" : "Prospecto creado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error al guardar", text: error.message });
    }
  }

  function eliminar(id) {
    Swal.fire({
      title: "¿Eliminar prospecto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await eliminarProspecto(id);
          await cargar();
        } catch (error) {
          Swal.fire({ icon: "error", title: "Error al eliminar", text: error.message });
        }
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">CRM Comercial</h1>
        <p className="text-slate-500 mt-1">Prospección y seguimiento comercial de nuevos clientes.</p>
      </div>

      <ProspectoForm
        onGuardar={guardar}
        prospectoEditar={prospectoEditar}
        onCancelar={() => setProspectoEditar(null)}
      />

      <ProspectoTable
        prospectos={prospectos}
        onEditar={setProspectoEditar}
        onEliminar={eliminar}
      />
    </div>
  );
}