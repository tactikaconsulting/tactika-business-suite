import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Layers3, Settings, ShieldCheck, Sparkles } from "lucide-react";
import Swal from "sweetalert2";

import { obtenerClientes } from "../services/ClienteService";
import {
  catalogoModulosTactika,
  guardarConfiguracionModulosCliente,
  modulosSugeridosPorPlan,
  obtenerModulosCliente,
} from "../services/ImplementacionService";

const planes = ["Base", "Profesional", "Enterprise"];

export default function Configuracion() {
  const [nombreConsultora, setNombreConsultora] = useState("Táctika Consulting");
  const [rutConsultora, setRutConsultora] = useState("77.654.321-5");
  const [region, setRegion] = useState("Región Metropolitana");
  const [exito, setExito] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [plan, setPlan] = useState("Base");
  const [modulosActivos, setModulosActivos] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [cargandoModulos, setCargandoModulos] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    cargarModulosCliente(clienteId);
  }, [clienteId]);

  async function cargarClientes() {
    const data = await obtenerClientes();
    setClientes(data);
  }

  async function cargarModulosCliente(id) {
    if (!id) {
      setModulosActivos([]);
      return;
    }

    setCargandoModulos(true);
    try {
      const modulos = await obtenerModulosCliente(id);
      const activos = modulos.filter((modulo) => modulo.estado === "Activo");

      setModulosActivos(activos.map((modulo) => modulo.modulo));
      setPlan(activos[0]?.plan || "Base");
      setObservaciones(activos[0]?.observaciones || "");
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudieron cargar módulos", text: error.message });
    } finally {
      setCargandoModulos(false);
    }
  }

  function handleGuardarConfig(e) {
    e.preventDefault();
    setExito(true);
    setTimeout(() => setExito(false), 3000);
  }

  function aplicarPlan(nuevoPlan) {
    setPlan(nuevoPlan);
    setModulosActivos(modulosSugeridosPorPlan(nuevoPlan));
  }

  function alternarModulo(modulo) {
    setModulosActivos((actuales) =>
      actuales.includes(modulo)
        ? actuales.filter((item) => item !== modulo)
        : [...actuales, modulo]
    );
  }

  async function guardarModulos() {
    try {
      await guardarConfiguracionModulosCliente({
        clienteId,
        plan,
        modulosActivos,
        observaciones,
      });

      Swal.fire({
        icon: "success",
        title: "Configuración guardada",
        text: "Los módulos del cliente quedaron actualizados.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.message });
    }
  }

  const resumen = useMemo(() => {
    const futuros = catalogoModulosTactika.filter((item) => item.categoria === "Futuro").length;
    return {
      activos: modulosActivos.length,
      disponibles: catalogoModulosTactika.length,
      futuros,
    };
  }, [modulosActivos]);

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-blue-600">Tactika Suite</p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
          Configuración del Sistema
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Administra datos corporativos, planes contratados y módulos activos por cliente.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-800 text-base mb-4">Datos Corporativos</h2>

          <form onSubmit={handleGuardarConfig} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label>
                <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Nombre Comercial de la Suite
                </span>
                <input
                  type="text"
                  value={nombreConsultora}
                  onChange={(e) => setNombreConsultora(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </label>

              <label>
                <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  RUT Empresa Emisora
                </span>
                <input
                  type="text"
                  value={rutConsultora}
                  onChange={(e) => setRutConsultora(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </label>
            </div>

            <label>
              <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Ubicación Casa Matriz
              </span>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </label>

            <div className="flex justify-between items-center pt-2">
              {exito ? (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                  Cambios del sistema actualizados
                </span>
              ) : (
                <div />
              )}
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
              >
                Guardar Ajustes
              </button>
            </div>
          </form>
        </section>

        <aside className="bg-slate-900 text-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-300" />
              <h2 className="font-bold text-base">Control modular</h2>
            </div>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Cada cliente puede tener módulos distintos según el servicio contratado. Esta es la
              base para vender Tactika como plataforma adaptable.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xl font-bold">{resumen.activos}</p>
              <p className="text-xs text-slate-300">Activos</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xl font-bold">{resumen.disponibles}</p>
              <p className="text-xs text-slate-300">Disponibles</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xl font-bold">{resumen.futuros}</p>
              <p className="text-xs text-slate-300">Futuros</p>
            </div>
          </div>
        </aside>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Layers3 size={19} className="text-blue-600" />
              <h2 className="text-xl font-bold text-slate-800">Módulos por Cliente</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Define qué herramientas tendrá activa cada empresa según su plan contratado.
            </p>
          </div>

          <button
            type="button"
            onClick={guardarModulos}
            disabled={!clienteId || cargandoModulos}
            className="min-h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Guardar módulos
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Cliente</span>
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
            </label>

            <div>
              <span className="text-sm font-semibold text-slate-700">Plan contratado</span>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {planes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => aplicarPlan(item)}
                    className={`min-h-10 rounded-lg border text-sm font-semibold transition ${
                      plan === item
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Observaciones</span>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: cliente parte con diagnóstico y CRM, inventario queda para fase 2."
                className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm min-h-28"
              />
            </label>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2 text-sm text-blue-900">
              <Sparkles size={16} className="mt-0.5 shrink-0" />
              <p>
                El plan sugiere módulos, pero puedes ajustar manualmente según la realidad de cada
                cliente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {catalogoModulosTactika.map((item) => {
              const activo = modulosActivos.includes(item.modulo);
              return (
                <button
                  key={item.modulo}
                  type="button"
                  onClick={() => alternarModulo(item.modulo)}
                  disabled={!clienteId}
                  className={`text-left border rounded-xl p-4 transition disabled:opacity-60 ${
                    activo
                      ? "bg-blue-50 border-blue-200 ring-1 ring-blue-100"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-800">{item.modulo}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.categoria}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        activo ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-3 leading-relaxed">{item.descripcion}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
