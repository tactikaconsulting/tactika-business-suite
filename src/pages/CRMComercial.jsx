import { useEffect, useState } from "react";
import { FileText, MessageSquareText, Search, Sparkles } from "lucide-react";
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
import TareasRecordatorios from "../components/CRM/TareasRecordatorios";
import PlantillasMensajes from "../components/CRM/PlantillasMensajes";
import RegistrarInteraccion from "../components/CRM/RegistrarInteraccion";
import ProspectoResumenPanel from "../components/CRM/ProspectoResumenPanel";
import CrearPropuestaComercial from "../components/CRM/CrearPropuestaComercial";
import SeguimientoPropuestas from "../components/CRM/SeguimientoPropuestas";
import InicioCRM from "../components/CRM/InicioCRM";

import {
  obtenerProspectos,
  crearProspecto,
  actualizarProspecto,
  eliminarProspecto,
  cambiarEstadoProspecto,
  obtenerHistorial,
  convertirProspectoACliente,
} from "../services/ProspectoService";
import {
  crearInteraccionComercial,
  obtenerInteraccionesComerciales,
} from "../services/InteraccionComercialService";
import {
  actualizarEstadoPropuestaComercial,
  crearPropuestaComercial,
  obtenerPropuestasComerciales,
} from "../services/PropuestaComercialService";
import { descargarPropuestaPDF } from "../services/PropuestaPDFService";

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
  const [interacciones, setInteracciones] = useState([]);
  const [propuestas, setPropuestas] = useState([]);
  const [prospectoEditar, setProspectoEditar] = useState(null);
  const [prospectoHistorial, setProspectoHistorial] = useState(null);
  const [prospectoResumen, setProspectoResumen] = useState(null);
  const [prospectoAccionId, setProspectoAccionId] = useState(null);
  const [vista, setVista] = useState("inicio");
  const [mostrarEnriquecimiento, setMostrarEnriquecimiento] = useState(false);
  const [mostrarPlantillas, setMostrarPlantillas] = useState(false);
  const [mostrarInteraccion, setMostrarInteraccion] = useState(false);
  const [mostrarPropuesta, setMostrarPropuesta] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const [dataProspectos, dataHistorial, dataInteracciones, dataPropuestas] = await Promise.all([
      obtenerProspectos(),
      obtenerHistorial(),
      obtenerInteraccionesComerciales(),
      obtenerPropuestasComerciales(),
    ]);
    setProspectos(dataProspectos);
    setHistorial(dataHistorial);
    setInteracciones(dataInteracciones);
    setPropuestas(dataPropuestas);
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

  async function reprogramarSeguimiento(prospecto, fechaProximoContacto) {
    try {
      await actualizarProspecto(prospecto.id, {
        ...prospecto,
        fechaProximoContacto,
      });
      await cargar();

      Swal.fire({
        icon: "success",
        title: "Seguimiento reprogramado",
        text: `${prospecto.empresa} quedó programado para ${fechaProximoContacto}.`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo reprogramar", text: error.message });
    }
  }

  async function guardarInteraccion(interaccion) {
    try {
      await crearInteraccionComercial(interaccion);
      const prospecto = prospectos.find((p) => p.id === interaccion.prospectoId);

      if (prospecto && interaccion.proximoSeguimiento?.fechaProximoContacto) {
        const notaSeguimiento = [
          prospecto.observaciones,
          `Proximo paso sugerido (${new Date().toLocaleDateString("es-CL")}): ${interaccion.proximoSeguimiento.proximoPaso}`,
        ]
          .filter(Boolean)
          .join("\n\n");

        await actualizarProspecto(prospecto.id, {
          ...prospecto,
          fechaProximoContacto: interaccion.proximoSeguimiento.fechaProximoContacto,
          observaciones: notaSeguimiento,
        });
      }

      await cargar();
      setMostrarInteraccion(false);

      Swal.fire({
        icon: "success",
        title: "Interaccion registrada",
        text: interaccion.proximoSeguimiento
          ? "Quedo guardada y se actualizo el proximo seguimiento."
          : "Quedo guardada en el historial comercial del prospecto.",
        timer: 1700,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.message || "Revisa que la tabla prospecto_interacciones exista en Supabase.",
      });
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
    setProspectoResumen(null);
    setProspectoEditar(prospecto);
    setVista("pipeline");
  }

  function abrirInteraccion(prospecto) {
    setProspectoAccionId(prospecto.id);
    setMostrarInteraccion(true);
  }

  function abrirPlantillas(prospecto) {
    setProspectoAccionId(prospecto.id);
    setMostrarPlantillas(true);
  }

  function abrirPropuesta(prospecto) {
    setProspectoAccionId(prospecto.id);
    setMostrarPropuesta(true);
  }

  async function guardarPropuesta(propuesta) {
    try {
      await crearPropuestaComercial(propuesta);

      const prospecto = prospectos.find((p) => p.id === propuesta.prospectoId);
      if (
        prospecto &&
        propuesta.estado === "Enviada" &&
        prospecto.estado !== "Propuesta Enviada"
      ) {
        await cambiarEstadoProspecto(prospecto.id, prospecto.estado, "Propuesta Enviada");
      }

      await cargar();
      setMostrarPropuesta(false);

      Swal.fire({
        icon: "success",
        title: "Propuesta guardada",
        text: "La propuesta comercial quedo registrada en el CRM.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar la propuesta",
        text: error.message || "Revisa que la tabla prospecto_propuestas exista en Supabase.",
      });
    }
  }

  async function actualizarEstadoPropuesta(propuesta, estadoNuevo) {
    try {
      await actualizarEstadoPropuestaComercial(propuesta.id, estadoNuevo);

      const prospecto = prospectos.find((p) => p.id === propuesta.prospectoId);
      if (prospecto) {
        if (estadoNuevo === "Enviada" && prospecto.estado !== "Propuesta Enviada") {
          await cambiarEstadoProspecto(prospecto.id, prospecto.estado, "Propuesta Enviada");
        }

        if (estadoNuevo === "Aceptada" && prospecto.estado !== "Cliente") {
          if (!prospecto.clienteId) {
            await convertirProspectoACliente(prospecto);
          }
          await cambiarEstadoProspecto(prospecto.id, prospecto.estado, "Cliente");
        }

        if (estadoNuevo === "Rechazada" && prospecto.estado !== "Perdido") {
          await cambiarEstadoProspecto(prospecto.id, prospecto.estado, "Perdido");
        }
      }

      await cargar();

      Swal.fire({
        icon: "success",
        title: "Propuesta actualizada",
        text: `La propuesta quedo como ${estadoNuevo}.`,
        timer: 1700,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar la propuesta",
        text: error.message || "Revisa la tabla prospecto_propuestas en Supabase.",
      });
    }
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

  async function cambiarEstadoRapido(prospecto, estadoNuevo) {
    if (!prospecto || prospecto.estado === estadoNuevo) return;

    setProspectoResumen((actual) =>
      actual?.id === prospecto.id ? { ...actual, estado: estadoNuevo } : actual
    );

    await moverEnKanban(prospecto.id, prospecto.estado, estadoNuevo);
  }

  const tabs = [
    { id: "inicio", label: "Inicio" },
    { id: "pipeline", label: "Pipeline" },
    { id: "tareas", label: "Tareas" },
    { id: "propuestas", label: "Propuestas" },
    { id: "dashboard", label: "Dashboard" },
  ];

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-5 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-blue-600">Tactika Suite</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">CRM Comercial</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Prospeccion, seguimiento, propuestas y cierre comercial desde un solo lugar.
            </p>
          </div>

          <div className="flex flex-wrap justify-start md:justify-end gap-2 w-full lg:w-auto">
            <button
              onClick={() => {
                setProspectoAccionId(null);
                setMostrarInteraccion(true);
              }}
              className="min-h-10 px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition flex items-center gap-2"
            >
              <MessageSquareText size={16} />
              Registrar interaccion
            </button>

            <button
              onClick={() => {
                setProspectoAccionId(null);
                setMostrarPlantillas(true);
              }}
              className="min-h-10 px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition flex items-center gap-2"
            >
              <FileText size={16} />
              Plantillas
            </button>

            <button
              onClick={() => setMostrarEnriquecimiento(true)}
              className="min-h-10 px-3.5 py-2 border border-blue-200 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition flex items-center gap-2"
            >
              <Search size={16} />
              Enriquecer
            </button>

            <div className="min-h-10">
              <ImportarArchivo
                columnas={columnasImportacion}
                onImportar={importarProspectos}
                nombreEntidad="prospectos"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-1 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setVista(t.id)}
                className={`min-h-9 px-4 py-2 rounded-md text-sm font-semibold transition whitespace-nowrap ${
                  vista === t.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {vista === "inicio" && (
        <InicioCRM
          prospectos={prospectos}
          propuestas={propuestas}
          onAbrirProspecto={setProspectoResumen}
          onRegistrarInteraccion={abrirInteraccion}
          onCrearPropuesta={abrirPropuesta}
          onIrA={setVista}
        />
      )}

      {vista === "pipeline" && (
        <div className="space-y-6">
          <KpisComerciales prospectos={prospectos} historial={historial} />
          <AlertasSeguimiento prospectos={prospectos} onEditar={editarDesdeKanban} />
          <KanbanBoard
            prospectos={prospectos}
            onCambiarEstado={moverEnKanban}
            onEditar={setProspectoResumen}
            onVerHistorial={setProspectoHistorial}
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-slate-500" />
                <h3 className="text-sm font-bold text-slate-700">Lista de prospectos</h3>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Gestion operativa y edicion completa de prospectos.
              </p>
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
              onVerHistorial={setProspectoHistorial}
            />
          </div>
        </div>
      )}

      {vista === "tareas" && (
        <div className="space-y-6">
          <TareasRecordatorios
            prospectos={prospectos}
            onEditar={editarDesdeKanban}
            onReprogramar={reprogramarSeguimiento}
          />
        </div>
      )}

      {vista === "propuestas" && (
        <SeguimientoPropuestas
          propuestas={propuestas}
          prospectos={prospectos}
          onActualizarEstado={actualizarEstadoPropuesta}
          onDescargarPDF={descargarPropuestaPDF}
          onRegistrarSeguimiento={abrirInteraccion}
          onAbrirProspecto={setProspectoResumen}
        />
      )}

      {vista === "dashboard" && (
        <div className="space-y-6">
          <KpisComerciales prospectos={prospectos} historial={historial} />
          <DashboardComercial prospectos={prospectos} historial={historial} />
        </div>
      )}

      {mostrarEnriquecimiento && (
        <EnriquecimientoProspectos
          prospectos={prospectos}
          onGuardar={guardarEnriquecimiento}
          onCerrar={() => setMostrarEnriquecimiento(false)}
        />
      )}

      {mostrarPlantillas && (
        <PlantillasMensajes
          prospectos={prospectos}
          prospectoInicialId={prospectoAccionId}
          onCerrar={() => setMostrarPlantillas(false)}
        />
      )}

      {mostrarInteraccion && (
        <RegistrarInteraccion
          prospectos={prospectos}
          prospectoInicialId={prospectoAccionId}
          onGuardar={guardarInteraccion}
          onCerrar={() => setMostrarInteraccion(false)}
        />
      )}

      {mostrarPropuesta && (
        <CrearPropuestaComercial
          prospectos={prospectos}
          prospectoInicialId={prospectoAccionId}
          onGuardar={guardarPropuesta}
          onCerrar={() => setMostrarPropuesta(false)}
        />
      )}

      {prospectoHistorial && (
        <ProspectoHistorialPanel
          prospecto={prospectoHistorial}
          historial={historial}
          interacciones={interacciones}
          onCerrar={() => setProspectoHistorial(null)}
        />
      )}

      {prospectoResumen && (
        <ProspectoResumenPanel
          prospecto={prospectoResumen}
          interacciones={interacciones}
          propuestas={propuestas}
          onCerrar={() => setProspectoResumen(null)}
          onEditar={editarDesdeKanban}
          onVerHistorial={(prospecto) => {
            setProspectoResumen(null);
            setProspectoHistorial(prospecto);
          }}
          onRegistrarInteraccion={(prospecto) => {
            setProspectoResumen(null);
            abrirInteraccion(prospecto);
          }}
          onPlantillas={(prospecto) => {
            setProspectoResumen(null);
            abrirPlantillas(prospecto);
          }}
          onCrearPropuesta={(prospecto) => {
            setProspectoResumen(null);
            abrirPropuesta(prospecto);
          }}
          onDescargarPropuesta={descargarPropuestaPDF}
          onReprogramar={reprogramarSeguimiento}
          onCambiarEstadoRapido={cambiarEstadoRapido}
        />
      )}
    </div>
  );
}
