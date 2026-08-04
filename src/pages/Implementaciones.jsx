import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Layers3, Rocket, Settings2 } from "lucide-react";
import Swal from "sweetalert2";

import {
  actualizarEstadoTareaImplementacion,
  actualizarImplementacion,
  obtenerImplementacionesCliente,
} from "../services/ImplementacionService";

const etapas = [
  "Diagnostico inicial",
  "Configuracion",
  "Capacitacion",
  "Puesta en marcha",
  "Seguimiento mensual",
];

const estados = ["Pendiente", "En proceso", "Completado", "Bloqueado"];

function KpiImplementacion({ icon: Icon, titulo, valor, detalle, destacado }) {
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

function estadoTareaClase(estado) {
  if (estado === "Completado") return "bg-green-50 text-green-700 border-green-200";
  if (estado === "En proceso") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

export default function Implementaciones() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    const data = await obtenerImplementacionesCliente();
    setProyectos(data);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  const metricas = useMemo(() => {
    const total = proyectos.length;
    const enProceso = proyectos.filter((p) => p.implementacion?.estado === "En proceso").length;
    const completadas = proyectos.filter((p) => p.implementacion?.estado === "Completado").length;
    const tareasPendientes = proyectos.reduce(
      (sum, p) => sum + p.tareas.filter((t) => t.estado !== "Completado").length,
      0
    );

    return { total, enProceso, completadas, tareasPendientes };
  }, [proyectos]);

  async function cambiarEstadoTarea(tarea, estado) {
    try {
      await actualizarEstadoTareaImplementacion(tarea.id, estado);
      await cargar();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo actualizar", text: error.message });
    }
  }

  async function cambiarImplementacion(implementacion, campo, valor) {
    try {
      await actualizarImplementacion(implementacion.id, {
        ...implementacion,
        [campo]: valor,
      });
      await cargar();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo actualizar", text: error.message });
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-blue-600">Tactika Suite</p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
          Implementaciones
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Controla el trabajo interno despues de convertir un prospecto en cliente: proyecto,
          implementacion, tareas, modulos activos y seguimiento inicial.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiImplementacion
          icon={Rocket}
          titulo="Proyectos creados"
          valor={metricas.total}
          detalle="Clientes en implementacion"
          destacado
        />
        <KpiImplementacion
          icon={Settings2}
          titulo="En proceso"
          valor={metricas.enProceso}
          detalle="Implementaciones activas"
        />
        <KpiImplementacion
          icon={CheckCircle2}
          titulo="Completadas"
          valor={metricas.completadas}
          detalle="Clientes ya entregados"
        />
        <KpiImplementacion
          icon={ClipboardList}
          titulo="Tareas pendientes"
          valor={metricas.tareasPendientes}
          detalle="Plan de trabajo abierto"
        />
      </section>

      {cargando ? (
        <section className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-500">
          Cargando implementaciones...
        </section>
      ) : proyectos.length === 0 ? (
        <section className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <Rocket size={28} className="mx-auto text-slate-300" />
          <h2 className="text-lg font-bold text-slate-700 mt-3">Aun no hay implementaciones</h2>
          <p className="text-sm text-slate-500 mt-1">
            Cuando un prospecto pase a Cliente en el CRM, Tactika creara aqui su proyecto de
            implementacion.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {proyectos.map((proyecto) => (
            <article
              key={proyecto.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-600">
                    {proyecto.clienteNombre || "Cliente"}
                  </p>
                  <h2 className="text-xl font-bold text-slate-800 mt-1">{proyecto.nombre}</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Inicio: {proyecto.fechaInicio} · Objetivo: {proyecto.fechaObjetivo || "Sin fecha"}
                  </p>
                </div>

                <span className="bg-slate-900 text-white rounded-full px-3 py-1 text-xs font-bold">
                  {proyecto.estado}
                </span>
              </div>

              {proyecto.implementacion && (
                <div className="p-5 grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
                  <div className="border border-slate-200 rounded-xl p-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Estado de implementacion</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Ajusta etapa, estado y avance sin salir de esta vista.
                      </p>
                    </div>

                    <label className="block">
                      <span className="text-xs font-semibold text-slate-500">Etapa</span>
                      <select
                        value={proyecto.implementacion.etapa}
                        onChange={(e) =>
                          cambiarImplementacion(proyecto.implementacion, "etapa", e.target.value)
                        }
                        className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                      >
                        {etapas.map((etapa) => (
                          <option key={etapa}>{etapa}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-slate-500">Estado</span>
                      <select
                        value={proyecto.implementacion.estado}
                        onChange={(e) =>
                          cambiarImplementacion(proyecto.implementacion, "estado", e.target.value)
                        }
                        className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                      >
                        {estados.map((estado) => (
                          <option key={estado}>{estado}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-slate-500">
                        Avance: {proyecto.implementacion.avance}%
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={proyecto.implementacion.avance}
                        onChange={(e) =>
                          cambiarImplementacion(proyecto.implementacion, "avance", e.target.value)
                        }
                        className="mt-2 w-full"
                      />
                    </label>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Layers3 size={16} />
                        Modulos activos
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {proyecto.modulos.map((modulo) => (
                          <span
                            key={modulo.id}
                            className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-1 text-xs font-bold"
                          >
                            {modulo.modulo}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-800">Plan de trabajo inicial</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Tareas creadas automaticamente al ganar el cliente.
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {proyecto.tareas.map((tarea) => (
                        <div
                          key={tarea.id}
                          className="p-4 flex items-start justify-between gap-4 flex-wrap"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-800">{tarea.titulo}</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                              {tarea.descripcion}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                              Limite: {tarea.fechaLimite || "Sin fecha"} · Prioridad:{" "}
                              {tarea.prioridad}
                            </p>
                          </div>

                          <select
                            value={tarea.estado}
                            onChange={(e) => cambiarEstadoTarea(tarea, e.target.value)}
                            className={`border rounded-lg px-2.5 py-2 text-xs font-bold ${estadoTareaClase(
                              tarea.estado
                            )}`}
                          >
                            <option>Pendiente</option>
                            <option>En proceso</option>
                            <option>Completado</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
