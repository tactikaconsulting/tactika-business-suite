import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CalendarCheck,
  Copy,
  DollarSign,
  ExternalLink,
  FileText,
  Layers3,
  Mail,
  MessageCircle,
  Rocket,
} from "lucide-react";
import Swal from "sweetalert2";

import { obtenerResumenPortalCliente } from "../services/PortalClienteService";
import {
  crearLinkCorreoPortal,
  crearLinkWhatsAppPortal,
  crearMensajePortalCliente,
  descargarResumenPortalPDF,
} from "../services/PortalEntregablesService";

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

export default function Cliente360() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);

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
                        </div>
                        <span
                          className={`border rounded-full px-2 py-1 text-xs font-bold ${estadoClase(
                            tarea.estado
                          )}`}
                        >
                          {tarea.estado}
                        </span>
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
        </div>
      </section>
    </div>
  );
}
