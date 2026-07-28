import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import ProspectoForm from "../components/CRM/ProspectoForm";
import ProspectoTable from "../components/CRM/ProspectoTable";
import KanbanBoard from "../components/CRM/KanbanBoard";
import DashboardComercial from "../components/CRM/DashboardComercial";
import AlertasSeguimiento from "../components/CRM/AlertasSeguimiento";
import ImportarArchivo from "../components/Shared/ImportarArchivo";
import EnriquecimientoProspectos from "../components/CRM/EnriquecimientoProspectos";
import KpisComerciales from "../components/CRM/KpisComerciales";
import ProspectoHistorialPanel from "../components/CRM/ProspectoHistorialPanel";

import {
  obtenerProspectos,
  crearProspecto,
  actualizarProspecto,
  eliminarProspecto,
  cambiarEstadoProspecto,
  obtenerHistorial,
  convertirProspectoACliente,
} from "../services/ProspectoService";

const columnasImportacion = [
  { clave: "empresa", etiqueta: "Empresa", requerido: true },
  { clave: "rut", etiqueta: "RUT", requerido: false },
  { clave: "giro", etiqueta: "Rubro / Giro", requerido: false },
  { clave: "comuna", etiqueta: "Comuna", requerido: false },
  { clave: "region", etiqueta: "Región", requerido: false },
  { clave: "contactoNombre", etiqueta: "Contacto", requerido: false },
  { clave: "telefono", etiqueta: "Teléfono", requerido: false },
  { clave: "correo", etiqueta: "Correo", requerido: false },
  { clave: "sitioWeb", etiqueta: "Sitio Web", requerido: false },
  { clave: "origen", etiqueta: "Origen", requerido: false },
  { clave: "observaciones", etiqueta: "Observaciones", requerido: false },
];

export default function CRMComercial() {
  const [prospectos, setProspectos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [prospectoEditar, setProspectoEditar] = useState(null);
  const [prospectoHistorial, setProspectoHistorial] = useState(null);
  const [vista, setVista] = useState("kanban");
  const [mostrarEnriquecimiento, setMostrarEnriquecimiento] = useState(false);

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
        if (datos.estado !== prospectoEditar.estado) {
          await cambiarEstadoProspecto(prospectoEditar.id, prospectoEditar.estado, datos.estado);
        }
        if (datos.estado === "Cliente" && !prospectoEditar.clienteId) {
          await convertirProspectoACliente({ ...datos, id: prospectoEditar.id });
        }
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

  async function importarProspectos(filas) {
    let exitosos = 0;
    let fallidos = 0;

    for (const fila of filas) {
      if (!fila.empresa) {
        fallidos++;
        continue;
      }
      try {
        await crearProspecto({
          ...fila,
          estado: fila.estado || "Prospecto",
          origen: fila.origen || "Importación Excel/CSV",
        });
        exitosos++;
      } catch {
        fallidos++;
      }
    }

    await cargar();

    if (fallidos > 0) {
      Swal.fire({
        icon: "warning",
        title: "Importación con observaciones",
        text: `${exitosos} prospectos creados correctamente, ${fallidos} no se pudieron crear (revisa que tengan al menos el nombre de la empresa).`,
      });
    }
  }

  async function guardarEnriquecimiento(id, datos) {
    try {
      await actualizarProspecto(id, datos);
      await cargar();
      setMostrarEnriquecimiento(false);

      Swal.fire({
        icon: "success",
        title: "Datos actualizados",
        text: "La ficha del prospecto fue enriquecida correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error al enriquecer", text: error.message });
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
    const prospecto = prospectos.find((p) => p.id === id);

    setProspectos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: estadoNuevo } : p))
    );

    try {
      if (estadoNuevo === "Cliente" && prospecto && !prospecto.clienteId) {
        await convertirProspectoACliente(prospecto);
      }

      await cambiarEstadoProspecto(id, estadoAnterior, estadoNuevo);
      await cargar();

      if (estadoNuevo === "Cliente") {
        Swal.fire({
          icon: "success",
          title: "¡Nuevo cliente! 🎉",
          text: `${prospecto?.empresa} fue agregado automáticamente a tu cartera de Clientes.`,
          timer: 2500,
          showConfirmButton: false,
        });
      }
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMostrarEnriquecimiento(true)}
            className="px-4 py-2.5 border border-blue-200 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
          >
            Enriquecer prospectos
          </button>

          <ImportarArchivo
            columnas={columnasImportacion}
            onImportar={importarProspectos}
            nombreEntidad="prospectos"
          />

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
      </div>

      <KpisComerciales prospectos={prospectos} historial={historial} />

      <AlertasSeguimiento prospectos={prospectos} onEditar={editarDesdeKanban} />

      {vista === "kanban" && (
        <KanbanBoard
          prospectos={prospectos}
          onCambiarEstado={moverEnKanban}
          onEditar={editarDesdeKanban}
          onVerHistorial={setProspectoHistorial}
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
            onVerHistorial={setProspectoHistorial}
          />
        </>
      )}

      {vista === "dashboard" && (
        <DashboardComercial prospectos={prospectos} historial={historial} />
      )}

      {mostrarEnriquecimiento && (
        <EnriquecimientoProspectos
          prospectos={prospectos}
          onGuardar={guardarEnriquecimiento}
          onCerrar={() => setMostrarEnriquecimiento(false)}
        />
      )}

      {prospectoHistorial && (
        <ProspectoHistorialPanel
          prospecto={prospectoHistorial}
          historial={historial}
          onCerrar={() => setProspectoHistorial(null)}
        />
      )}
    </div>
  );
}
