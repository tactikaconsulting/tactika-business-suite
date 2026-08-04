import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CalendarCheck,
  Clock3,
  Copy,
  DollarSign,
  ExternalLink,
  FileText,
  Layers3,
  Mail,
  MessageCircle,
  Plus,
  Rocket,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";

import { obtenerResumenPortalCliente } from "../services/PortalClienteService";
import {
  crearLinkCorreoPortal,
  crearLinkWhatsAppPortal,
  crearMensajePortalCliente,
  descargarResumenPortalPDF,
} from "../services/PortalEntregablesService";
import {
  crearEventoBitacoraCliente,
  eliminarEventoBitacoraCliente,
} from "../services/BitacoraClienteService";
import {
  actualizarEstadoTareaImplementacion,
  crearTareaImplementacionCliente,
} from "../services/ImplementacionService";
import {
  crearDocumentoCliente,
  eliminarDocumentoCliente,
} from "../services/DocumentoClienteService";

const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function Kpi360({ icon: Icon, titulo, valor, detalle, destacado }) {
  return (
    <div
      className={`border rounded-xl p-5 shadow-sm ${
        destacado ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm font-semibold ${destacado ? "text-slate-300" : "text-slate-500"}`}>
          {titulo}
        </p>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            destacado ? "bg-white/10" : "bg-blue-50 text-blue-700"
          }`}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold mt-3">{valor}</p>
      <p className={`text-xs mt-1 ${destacado ? "text-slate-400" : "text-slate-400"}`}>
        {detalle}
      </p>
    </div>
  );
}

function estadoClase(estado) {
  if (estado === "Completado" || estado === "Activo" || estado === "Pagado") {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (estado === "En proceso") return "bg-blue-50 text-blue-700 border-blue-200";
  if (estado === "Pendiente") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function texto(valor, fallback = "-") {
  return valor || fallback;
}

function fechaHoraInput() {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  return ahora.toISOString().slice(0, 16);
}

function fechaVisible(valor) {
  if (!valor) return "Sin fecha";
  return new Date(valor).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function Cliente360() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [documento, setDocumento] = useState({
    titulo: "",
    tipo: "Informe",
    url: "",
    descripcion: "",
    visibleCliente: true,
    fechaDocumento: new Date().toISOString().slice(0, 10),
  });
  const [eventoBitacora, setEventoBitacora] = useState({
    tipo: "reunion",
    titulo: "",
    detalle: "",
    resultado: "",
    proximoPaso: "",
    responsable: "Claudio Urra",
    visibleCliente: false,
    fechaEvento: fechaHoraInput(),
  });
  const [compromiso, setCompromiso] = useState({
    crearTarea: true,
    prioridad: "Media",
    fechaLimite: "",
  });

  useEffect(() => {
    cargar();
  }, [clienteId]);

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerResumenPortalCliente(clienteId);
      setResumen(data);
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar la ficha", text: error.message });
    } finally {
      setCargando(false);
    }
  }

  async function copiarResumenCliente() {
    try {
      await navigator.clipboard.writeText(crearMensajePortalCliente(resumen));
      Swal.fire({
        icon: "success",
        title: "Resumen copiado",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo copiar" });
    }
  }

  async function guardarDocumento(e) {
    e.preventDefault();

    if (!documento.titulo) {
      Swal.fire({ icon: "warning", title: "Indica el nombre del documento" });
      return;
    }

    try {
      await crearDocumentoCliente({
        ...documento,
        clienteId,
      });
      setDocumento({
        titulo: "",
        tipo: "Informe",
        url: "",
        descripcion: "",
        visibleCliente: true,
        fechaDocumento: new Date().toISOString().slice(0, 10),
      });
      await cargar();
      Swal.fire({
        icon: "success",
        title: "Documento registrado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.message });
    }
  }

  async function eliminarDocumento(documentoCliente) {
    const respuesta = await Swal.fire({
      title: "¿Eliminar documento?",
      text: documentoCliente.titulo,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!respuesta.isConfirmed) return;

    try {
      await eliminarDocumentoCliente(documentoCliente.id);
      await cargar();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo eliminar", text: error.message });
    }
  }

  async function guardarEventoBitacora(e) {
    e.preventDefault();

    if (!eventoBitacora.titulo) {
      Swal.fire({ icon: "warning", title: "Indica el titulo del registro" });
      return;
    }

    if (compromiso.crearTarea && !eventoBitacora.proximoPaso) {
      Swal.fire({
        icon: "warning",
        title: "Indica el proximo paso",
        text: "Para crear una tarea automatica necesitamos saber que compromiso queda pendiente.",
      });
      return;
    }

    try {
      await crearEventoBitacoraCliente({
        ...eventoBitacora,
        clienteId,
      });

      if (compromiso.crearTarea && eventoBitacora.proximoPaso && resumen?.implementacion?.id) {
        await crearTareaImplementacionCliente({
          implementacionId: resumen?.implementacion?.id,
          clienteId,
          titulo: eventoBitacora.proximoPaso,
          descripcion: [
            eventoBitacora.titulo ? `Origen: ${eventoBitacora.titulo}` : "",
            eventoBitacora.detalle,
            eventoBitacora.resultado ? `Resultado: ${eventoBitacora.resultado}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
          responsable: eventoBitacora.responsable,
          prioridad: compromiso.prioridad,
          fechaLimite: compromiso.fechaLimite,
        });
      }

      setEventoBitacora({
        tipo: "reunion",
        titulo: "",
        detalle: "",
        resultado: "",
        proximoPaso: "",
        responsable: "Claudio Urra",
        visibleCliente: false,
        fechaEvento: fechaHoraInput(),
      });
      setCompromiso({
        crearTarea: true,
        prioridad: "Media",
        fechaLimite: "",
      });
      await cargar();
      Swal.fire({
        icon: "success",
        title:
          compromiso.crearTarea && eventoBitacora.proximoPaso && resumen?.implementacion?.id
            ? "Bitacora y tarea registradas"
            : "Bitacora registrada",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.message });
    }
  }

  async function cambiarEstadoTarea(tarea, estado) {
    try {
      await actualizarEstadoTareaImplementacion(tarea.id, estado);
      await cargar();
      Swal.fire({
        icon: "success",
        title: "Tarea actualizada",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo actualizar", text: error.message });
    }
  }

  async function eliminarEventoBitacora(evento) {
    const respuesta = await Swal.fire({
      title: "¿Eliminar registro?",
      text: evento.titulo,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!respuesta.isConfirmed) return;

    try {
      await eliminarEventoBitacoraCliente(evento.id);
      await cargar();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo eliminar", text: error.message });
    }
  }

  const metricas = useMemo(() => {
    const serviciosActivos = resumen?.servicios?.filter((item) =>
      ["Activo", "Pagado"].includes(item.estado)
    );
    const totalServicios = serviciosActivos?.reduce((sum, item) => sum + item.valor, 0) || 0;
    const tareasPendientes =
      resumen?.tareas?.filter((item) => item.estado !== "Completado").length || 0;
    const modulosActivos = resumen?.modulos?.filter((item) => item.estado === "Activo").length || 0;

    return {
      avance: resumen?.implementacion?.avance || 0,
      totalServicios,
      tareasPendientes,
      modulosActivos,
    };
  }, [resumen]);

  if (cargando) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-8 text-sm text-slate-500">
        Cargando ficha 360 del cliente...
      </section>
    );
  }

  if (!resumen?.cliente) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <h1 className="text-xl font-bold text-slate-800">Cliente no encontrado</h1>
        <button
          type="button"
          onClick={() => navigate("/clientes")}
          className="mt-4 bg-slate-900 text-white rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Volver a clientes
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button
              type="button"
              onClick={() => navigate("/clientes")}
              className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-3"
            >
              <ArrowLeft size={16} />
              Volver a clientes
            </button>
            <p className="text-xs font-semibold uppercase text-blue-600">Ficha 360 Cliente</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
              {resumen.cliente.nombre}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Vista central de datos, servicios, implementacion, tareas, modulos y entregables.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={`/portal-cliente?cliente=${resumen.cliente.id}`}
              className="min-h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
              <ExternalLink size={16} />
              Ver portal
            </Link>
            <button
              type="button"
              onClick={() => descargarResumenPortalPDF(resumen)}
              className="min-h-10 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi360
          icon={Rocket}
          titulo="Avance"
          valor={`${metricas.avance}%`}
          detalle={resumen.implementacion?.etapa || "Diagnostico inicial"}
          destacado
        />
        <Kpi360
          icon={Layers3}
          titulo="Modulos activos"
          valor={metricas.modulosActivos}
          detalle="Herramientas habilitadas"
        />
        <Kpi360
          icon={CalendarCheck}
          titulo="Tareas pendientes"
          valor={metricas.tareasPendientes}
          detalle="Plan abierto"
        />
        <Kpi360
          icon={DollarSign}
          titulo="Servicios"
          valor={formatoCLP.format(metricas.totalServicios)}
          detalle="Pagado o activo"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800">Datos del cliente</h2>
            <div className="space-y-3 mt-4 text-sm">
              <p><span className="font-semibold text-slate-500">RUT:</span> {texto(resumen.cliente.rut)}</p>
              <p><span className="font-semibold text-slate-500">Rubro:</span> {texto(resumen.cliente.giro)}</p>
              <p><span className="font-semibold text-slate-500">Contacto:</span> {texto(resumen.cliente.contacto)}</p>
              <p><span className="font-semibold text-slate-500">Correo:</span> {texto(resumen.cliente.email)}</p>
              <p><span className="font-semibold text-slate-500">Telefono:</span> {texto(resumen.cliente.telefono)}</p>
              <p><span className="font-semibold text-slate-500">Estado:</span> {texto(resumen.cliente.estado)}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800">Acciones rapidas</h2>
            <div className="grid grid-cols-1 gap-2 mt-4">
              <button
                type="button"
                onClick={copiarResumenCliente}
                className="min-h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
              >
                <Copy size={16} />
                Copiar resumen
              </button>
              <button
                type="button"
                onClick={() =>
                  window.open(crearLinkWhatsAppPortal(resumen), "_blank", "noopener,noreferrer")
                }
                className="min-h-10 border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
              >
                <MessageCircle size={16} />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = crearLinkCorreoPortal(resumen);
                }}
                className="min-h-10 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
              >
                <Mail size={16} />
                Correo
              </button>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Implementacion</h2>
              <p className="text-sm text-slate-500 mt-1">
                Estado operativo del proyecto y plan de trabajo.
              </p>
            </div>
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Proyecto</p>
                <h3 className="font-bold text-slate-800 mt-1">
                  {texto(resumen.proyecto?.nombre, "Sin proyecto")}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Estado: {texto(resumen.proyecto?.estado)} · Responsable:{" "}
                  {texto(resumen.proyecto?.responsable)}
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Etapa actual</p>
                <h3 className="font-bold text-slate-800 mt-1">
                  {texto(resumen.implementacion?.etapa, "Sin implementacion")}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Estado: {texto(resumen.implementacion?.estado)} · Avance: {metricas.avance}%
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Plan de trabajo</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {resumen.tareas.length === 0 ? (
                  <p className="p-5 text-sm text-slate-500">Sin tareas registradas.</p>
                ) : (
                  resumen.tareas.map((tarea) => (
                    <div key={tarea.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm text-slate-800">{tarea.titulo}</p>
                          <p className="text-xs text-slate-500 mt-1">{tarea.descripcion}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            Responsable: {texto(tarea.responsable, "Sin responsable")} · Fecha:{" "}
                            {texto(tarea.fechaLimite, "Sin fecha")} · Prioridad: {tarea.prioridad}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`border rounded-full px-2 py-1 text-xs font-bold ${estadoClase(
                              tarea.estado
                            )}`}
                          >
                            {tarea.estado}
                          </span>
                          <div className="flex flex-wrap justify-end gap-1">
                            {tarea.estado !== "En proceso" && (
                              <button
                                type="button"
                                onClick={() => cambiarEstadoTarea(tarea, "En proceso")}
                                className="border border-blue-100 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md px-2 py-1 text-[11px] font-bold"
                              >
                                En proceso
                              </button>
                            )}
                            {tarea.estado !== "Completado" && (
                              <button
                                type="button"
                                onClick={() => cambiarEstadoTarea(tarea, "Completado")}
                                className="border border-green-100 text-green-700 bg-green-50 hover:bg-green-100 rounded-md px-2 py-1 text-[11px] font-bold"
                              >
                                Completar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Servicios contratados</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {resumen.servicios.length === 0 ? (
                  <p className="p-5 text-sm text-slate-500">Sin servicios registrados.</p>
                ) : (
                  resumen.servicios.map((servicio) => (
                    <div key={servicio.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm text-slate-800">{servicio.servicio}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {servicio.modalidad} · {formatoCLP.format(servicio.valor)}
                          </p>
                        </div>
                        <span
                          className={`border rounded-full px-2 py-1 text-xs font-bold ${estadoClase(
                            servicio.estado
                          )}`}
                        >
                          {servicio.estado}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800">Modulos activos</h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {resumen.modulos.filter((item) => item.estado === "Activo").length === 0 ? (
                <p className="text-sm text-slate-500">Sin modulos activos.</p>
              ) : (
                resumen.modulos
                  .filter((item) => item.estado === "Activo")
                  .map((modulo) => (
                    <span
                      key={modulo.id}
                      className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1.5 text-xs font-bold"
                    >
                      {modulo.modulo}
                    </span>
                  ))
              )}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock3 size={18} />
                Bitacora operativa
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Registra reuniones, llamadas, acuerdos, problemas y proximos pasos del cliente.
              </p>
            </div>

            <div className="p-5 grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
              <form onSubmit={guardarEventoBitacora} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Plus size={16} />
                  Nuevo registro
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Tipo</span>
                    <select
                      value={eventoBitacora.tipo}
                      onChange={(e) =>
                        setEventoBitacora({ ...eventoBitacora, tipo: e.target.value })
                      }
                      className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                    >
                      <option value="reunion">Reunion</option>
                      <option value="llamada">Llamada</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="correo">Correo</option>
                      <option value="acuerdo">Acuerdo</option>
                      <option value="problema">Problema</option>
                      <option value="decision">Decision</option>
                      <option value="nota">Nota</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Fecha</span>
                    <input
                      type="datetime-local"
                      value={eventoBitacora.fechaEvento}
                      onChange={(e) =>
                        setEventoBitacora({ ...eventoBitacora, fechaEvento: e.target.value })
                      }
                      className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Titulo</span>
                  <input
                    type="text"
                    value={eventoBitacora.titulo}
                    onChange={(e) =>
                      setEventoBitacora({ ...eventoBitacora, titulo: e.target.value })
                    }
                    placeholder="Ej: Reunion de levantamiento"
                    className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Detalle</span>
                  <textarea
                    value={eventoBitacora.detalle}
                    onChange={(e) =>
                      setEventoBitacora({ ...eventoBitacora, detalle: e.target.value })
                    }
                    placeholder="Que se converso o que ocurrio."
                    className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm min-h-20"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Resultado</span>
                  <input
                    type="text"
                    value={eventoBitacora.resultado}
                    onChange={(e) =>
                      setEventoBitacora({ ...eventoBitacora, resultado: e.target.value })
                    }
                    placeholder="Ej: Cliente confirma interes"
                    className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Proximo paso</span>
                  <input
                    type="text"
                    value={eventoBitacora.proximoPaso}
                    onChange={(e) =>
                      setEventoBitacora({ ...eventoBitacora, proximoPaso: e.target.value })
                    }
                    placeholder="Ej: Enviar propuesta el viernes"
                    className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                  />
                </label>

                <div className="border border-blue-100 bg-blue-50 rounded-xl p-3 space-y-3">
                  <label className="flex items-start gap-2 text-sm text-blue-900">
                    <input
                      type="checkbox"
                      checked={compromiso.crearTarea}
                      onChange={(e) =>
                        setCompromiso({ ...compromiso, crearTarea: e.target.checked })
                      }
                      className="mt-1"
                    />
                    <span>Crear tarea automatica con el proximo paso.</span>
                  </label>

                  {compromiso.crearTarea && (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs font-semibold text-blue-900">Prioridad</span>
                        <select
                          value={compromiso.prioridad}
                          onChange={(e) =>
                            setCompromiso({ ...compromiso, prioridad: e.target.value })
                          }
                          className="mt-1 w-full border border-blue-100 rounded-lg p-2 text-sm bg-white"
                        >
                          <option>Alta</option>
                          <option>Media</option>
                          <option>Baja</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-xs font-semibold text-blue-900">Fecha limite</span>
                        <input
                          type="date"
                          value={compromiso.fechaLimite}
                          onChange={(e) =>
                            setCompromiso({ ...compromiso, fechaLimite: e.target.value })
                          }
                          className="mt-1 w-full border border-blue-100 rounded-lg p-2 text-sm bg-white"
                        />
                      </label>
                    </div>
                  )}

                  {!resumen?.implementacion?.id && compromiso.crearTarea && (
                    <p className="text-xs text-amber-700">
                      Este cliente aun no tiene implementacion creada. Se guardara la bitacora, pero
                      la tarea necesita una implementacion activa.
                    </p>
                  )}
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Responsable</span>
                  <input
                    type="text"
                    value={eventoBitacora.responsable}
                    onChange={(e) =>
                      setEventoBitacora({ ...eventoBitacora, responsable: e.target.value })
                    }
                    className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                  />
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={eventoBitacora.visibleCliente}
                    onChange={(e) =>
                      setEventoBitacora({
                        ...eventoBitacora,
                        visibleCliente: e.target.checked,
                      })
                    }
                  />
                  Visible en Portal Cliente
                </label>

                <button
                  type="submit"
                  className="w-full min-h-10 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Guardar bitacora
                </button>
              </form>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[120px_1fr_120px_auto] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500">
                  <span>Tipo</span>
                  <span>Registro</span>
                  <span>Visibilidad</span>
                  <span>Accion</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {(resumen.bitacora || []).length === 0 ? (
                    <p className="p-5 text-sm text-slate-500">Sin registros de bitacora.</p>
                  ) : (
                    resumen.bitacora.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 md:grid-cols-[120px_1fr_120px_auto] gap-3 px-4 py-3 text-sm items-start"
                      >
                        <span className="w-fit bg-slate-50 text-slate-700 border border-slate-200 rounded-full px-2.5 py-1 text-xs font-bold capitalize">
                          {item.tipo}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">{item.titulo}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {fechaVisible(item.fechaEvento)} · Responsable:{" "}
                            {texto(item.responsable, "Sin responsable")}
                          </p>
                          {item.detalle && (
                            <p className="text-xs text-slate-500 mt-2">{item.detalle}</p>
                          )}
                          {item.resultado && (
                            <p className="text-xs text-slate-600 mt-2">
                              <span className="font-bold">Resultado:</span> {item.resultado}
                            </p>
                          )}
                          {item.proximoPaso && (
                            <p className="text-xs text-blue-700 mt-1">
                              <span className="font-bold">Proximo paso:</span> {item.proximoPaso}
                            </p>
                          )}
                        </div>
                        <span
                          className={`w-fit border rounded-full px-2.5 py-1 text-xs font-bold ${
                            item.visibleCliente
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {item.visibleCliente ? "Cliente" : "Interno"}
                        </span>
                        <button
                          type="button"
                          onClick={() => eliminarEventoBitacora(item)}
                          className="justify-self-start md:justify-self-end border border-red-100 text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 text-xs font-bold transition flex items-center gap-1"
                        >
                          <Trash2 size={13} />
                          Eliminar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Documentos del cliente</h2>
              <p className="text-sm text-slate-500 mt-1">
                Registra contratos, propuestas, informes, links de Drive o respaldos del proyecto.
              </p>
            </div>

            <div className="p-5 grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
              <form onSubmit={guardarDocumento} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Plus size={16} />
                  Nuevo documento
                </h3>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Nombre</span>
                  <input
                    type="text"
                    value={documento.titulo}
                    onChange={(e) => setDocumento({ ...documento, titulo: e.target.value })}
                    placeholder="Ej: Contrato de implementación"
                    className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Tipo</span>
                    <select
                      value={documento.tipo}
                      onChange={(e) => setDocumento({ ...documento, tipo: e.target.value })}
                      className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                    >
                      <option>Informe</option>
                      <option>Contrato</option>
                      <option>Propuesta</option>
                      <option>Diagnostico</option>
                      <option>Excel</option>
                      <option>Otro</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Fecha</span>
                    <input
                      type="date"
                      value={documento.fechaDocumento}
                      onChange={(e) =>
                        setDocumento({ ...documento, fechaDocumento: e.target.value })
                      }
                      className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Link del archivo</span>
                  <input
                    type="url"
                    value={documento.url}
                    onChange={(e) => setDocumento({ ...documento, url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Observaciones</span>
                  <textarea
                    value={documento.descripcion}
                    onChange={(e) => setDocumento({ ...documento, descripcion: e.target.value })}
                    placeholder="Breve contexto del documento."
                    className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm min-h-20"
                  />
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={documento.visibleCliente}
                    onChange={(e) =>
                      setDocumento({ ...documento, visibleCliente: e.target.checked })
                    }
                  />
                  Visible en Portal Cliente
                </label>

                <button
                  type="submit"
                  className="w-full min-h-10 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Guardar documento
                </button>
              </form>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_120px_110px_auto] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500">
                  <span>Documento</span>
                  <span>Tipo</span>
                  <span>Visibilidad</span>
                  <span>Acción</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {(resumen.documentos || []).length === 0 ? (
                    <p className="p-5 text-sm text-slate-500">Sin documentos registrados.</p>
                  ) : (
                    resumen.documentos.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr_120px_110px_auto] gap-3 px-4 py-3 text-sm items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{item.titulo}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {item.fechaDocumento || "Sin fecha"} · {item.descripcion || "Sin observaciones"}
                          </p>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-1 inline-flex"
                            >
                              Abrir documento
                            </a>
                          )}
                        </div>
                        <span className="text-slate-600">{item.tipo}</span>
                        <span
                          className={`w-fit border rounded-full px-2.5 py-1 text-xs font-bold ${
                            item.visibleCliente
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {item.visibleCliente ? "Cliente" : "Interno"}
                        </span>
                        <button
                          type="button"
                          onClick={() => eliminarDocumento(item)}
                          className="justify-self-start md:justify-self-end border border-red-100 text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 text-xs font-bold transition flex items-center gap-1"
                        >
                          <Trash2 size={13} />
                          Eliminar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
