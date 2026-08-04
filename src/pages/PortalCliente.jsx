import { useEffect, useMemo, useState } from "react";
import { Briefcase, CalendarCheck, CheckCircle2, FileText, Layers3, Rocket } from "lucide-react";
import Swal from "sweetalert2";

import { obtenerClientes } from "../services/ClienteService";
import {
  obtenerClienteIdPortalAsignado,
  obtenerResumenPortalCliente,
} from "../services/PortalClienteService";
import { useAuth } from "../context/AuthContext";

const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const rolesTactika = ["admin_tactika", "consultor_tactika"];

function KpiPortal({ icon: Icon, titulo, valor, detalle, destacado }) {
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
  return "bg-slate-50 text-slate-600 border-slate-200";
}

export default function PortalCliente() {
  const { perfil } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);

  const esTactika =
    rolesTactika.includes(perfil?.tipo_usuario);

  useEffect(() => {
    iniciar();
  }, []);

  useEffect(() => {
    if (clienteId) cargarResumen(clienteId);
  }, [clienteId]);

  async function iniciar() {
    setCargando(true);
    try {
      const clienteAsignado = await obtenerClienteIdPortalAsignado();
      if (esTactika) {
        const dataClientes = await obtenerClientes();
        setClientes(dataClientes);
        setClienteId(clienteAsignado || dataClientes[0]?.id || "");
      } else {
        setClienteId(clienteAsignado || "");
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar el portal", text: error.message });
    } finally {
      setCargando(false);
    }
  }

  async function cargarResumen(id) {
    setCargando(true);
    try {
      const data = await obtenerResumenPortalCliente(id);
      setResumen(data);
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar el cliente", text: error.message });
    } finally {
      setCargando(false);
    }
  }

  const metricas = useMemo(() => {
    const serviciosActivos = resumen?.servicios?.filter((item) =>
      ["Activo", "Pagado"].includes(item.estado)
    );
    const valorContratado = serviciosActivos?.reduce((sum, item) => sum + item.valor, 0) || 0;
    const tareasPendientes =
      resumen?.tareas?.filter((item) => item.estado !== "Completado").length || 0;

    return {
      avance: resumen?.implementacion?.avance || 0,
      modulos: resumen?.modulos?.filter((item) => item.estado === "Activo").length || 0,
      tareasPendientes,
      valorContratado,
    };
  }, [resumen]);

  if (cargando && !resumen) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-sm text-slate-500">
        Cargando portal del cliente...
      </div>
    );
  }

  if (!clienteId && !esTactika) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <h1 className="text-xl font-bold text-slate-800">Portal no configurado</h1>
        <p className="text-sm text-slate-500 mt-2">
          Tu usuario todavia no tiene una empresa asociada. Contacta a Tactika Consulting.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">Portal Cliente</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
              {resumen?.cliente?.nombre || "Cliente"}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Resumen de implementacion, modulos activos, servicios contratados y plan de trabajo.
            </p>
          </div>

          {esTactika && (
            <div className="min-w-72">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Vista previa como cliente
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {!resumen?.cliente ? (
        <section className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <h2 className="text-lg font-bold text-slate-700">Selecciona un cliente</h2>
          <p className="text-sm text-slate-500 mt-1">
            Usa el selector para previsualizar el portal que verá cada empresa.
          </p>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiPortal
              icon={Rocket}
              titulo="Avance implementación"
              valor={`${metricas.avance}%`}
              detalle={resumen.implementacion?.etapa || "Sin implementacion"}
              destacado
            />
            <KpiPortal
              icon={Layers3}
              titulo="Módulos activos"
              valor={metricas.modulos}
              detalle="Herramientas habilitadas"
            />
            <KpiPortal
              icon={CalendarCheck}
              titulo="Tareas pendientes"
              valor={metricas.tareasPendientes}
              detalle="Plan de trabajo abierto"
            />
            <KpiPortal
              icon={Briefcase}
              titulo="Servicios contratados"
              valor={formatoCLP.format(metricas.valorContratado)}
              detalle="Pagado o activo"
            />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Plan de trabajo</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Próximos pasos acordados para avanzar con la implementación.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {resumen.tareas.length === 0 ? (
                  <p className="p-5 text-sm text-slate-500">Aun no hay tareas de implementacion.</p>
                ) : (
                  resumen.tareas.map((tarea) => (
                    <div key={tarea.id} className="p-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{tarea.titulo}</p>
                        <p className="text-xs text-slate-500 mt-1">{tarea.descripcion}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          Fecha objetivo: {tarea.fechaLimite || "Sin fecha"} · Prioridad:{" "}
                          {tarea.prioridad}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 border rounded-full px-2.5 py-1 text-xs font-bold ${estadoClase(
                          tarea.estado
                        )}`}
                      >
                        {tarea.estado}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Layers3 size={18} />
                  Módulos habilitados
                </h2>
                <div className="flex flex-wrap gap-2 mt-4">
                  {resumen.modulos.filter((item) => item.estado === "Activo").length === 0 ? (
                    <p className="text-sm text-slate-500">Sin módulos activos.</p>
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
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={18} />
                  Servicios
                </h2>
                <div className="space-y-3 mt-4">
                  {resumen.servicios.length === 0 ? (
                    <p className="text-sm text-slate-500">Sin servicios registrados.</p>
                  ) : (
                    resumen.servicios.map((servicio) => (
                      <div key={servicio.id} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-sm text-slate-800">{servicio.servicio}</p>
                            <p className="text-xs text-slate-500 mt-1">{servicio.modalidad}</p>
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
            </div>
          </section>

          <section className="bg-slate-900 text-white rounded-xl p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-bold">Acompañamiento Táctika</h2>
              <p className="text-sm text-slate-300 mt-1">
                Si necesitas ajustar el alcance, agregar módulos o resolver dudas, coordina una
                reunión con Tactika Consulting.
              </p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-sm">
              Responsable: {resumen.implementacion?.responsable || "Tactika Consulting"}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
