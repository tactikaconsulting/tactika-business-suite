import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import ProspectoForm from "../components/CRM/ProspectoForm";
import ProspectoTable from "../components/CRM/ProspectoTable";
import KanbanBoard from "../components/CRM/KanbanBoard";
import DashboardComercial from "../components/CRM/DashboardComercial";
import AlertasSeguimiento from "../components/CRM/AlertasSeguimiento";

import {
  obtenerProspectos,
  crearProspecto,
  actualizarProspecto,
  eliminarProspecto,
  cambiarEstadoProspecto,
  obtenerHistorial,
} from "../services/ProspectoService";

export default function CRMComercial() {
  const [prospectos, setProspectos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [prospectoEditar, setProspectoEditar] = useState(null);
  const [vista, setVista] = useState("kanban");

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const [dataProspectos, dataHistorial] = await Promise.all([
      obtenerProspectos(),
      obtenerHistorial(),
    ]);
    setProspectos(dataProspectos);
    setHistorial(dataHistorial);
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
    setProspectos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: estadoNuevo } : p))
    );

    try {
      await cambiarEstadoProspecto(id, estadoAnterior, estadoNuevo);
      await cargar();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo mover el prospecto", text: error.message });
      await cargar();
    }
  }

  const tabs = [
    { id: "kanban", label: "Kanban" },
    { id: "lista", label: "Lista" },
    { id: "dashboard", label: "Dashboard" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">CRM Comercial</h1>
          <p className="text-slate-500 mt-1">Prospección y seguimiento comercial de nuevos clientes.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-1 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setVista(t.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                vista === t.id ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AlertasSeguimiento prospectos={prospectos} onEditar={editarDesdeKanban} />

      {vista === "kanban" && (
        <KanbanBoard
          prospectos={prospectos}
          onCambiarEstado={moverEnKanban}
          onEditar={editarDesdeKanban}
        />
      )}

      {vista === "lista" && (
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

      {vista === "dashboard" && (
        <DashboardComercial prospectos={prospectos} historial={historial} />
      )}
    </div>
  );
}