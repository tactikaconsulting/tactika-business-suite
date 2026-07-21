import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import ProspectoForm from "../components/CRM/ProspectoForm";
import ProspectoTable from "../components/CRM/ProspectoTable";
import KanbanBoard from "../components/CRM/KanbanBoard";

import {
  obtenerProspectos,
  crearProspecto,
  actualizarProspecto,
  eliminarProspecto,
  cambiarEstadoProspecto,
} from "../services/ProspectoService";

export default function CRMComercial() {
  const [prospectos, setProspectos] = useState([]);
  const [prospectoEditar, setProspectoEditar] = useState(null);
  const [vista, setVista] = useState("kanban");

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

  function editarDesdeKanban(prospecto) {
    setProspectoEditar(prospecto);
    setVista("lista");
  }

  async function moverEnKanban(id, estadoAnterior, estadoNuevo) {
    // Actualización optimista: cambia en pantalla al instante
    setProspectos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: estadoNuevo } : p))
    );

    try {
      await cambiarEstadoProspecto(id, estadoAnterior, estadoNuevo);
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo mover el prospecto", text: error.message });
      await cargar(); // revierte si falló
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">CRM Comercial</h1>
          <p className="text-slate-500 mt-1">Prospección y seguimiento comercial de nuevos clientes.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-1 flex gap-1">
          <button
            onClick={() => setVista("kanban")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              vista === "kanban" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setVista("lista")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              vista === "lista" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      {vista === "kanban" ? (
        <KanbanBoard
          prospectos={prospectos}
          onCambiarEstado={moverEnKanban}
          onEditar={editarDesdeKanban}
        />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}