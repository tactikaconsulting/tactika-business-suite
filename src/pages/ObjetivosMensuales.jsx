import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  DollarSign,
  LineChart,
  MessageCircle,
  Pencil,
  PhoneCall,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";

import {
  eliminarObjetivoMensual,
  guardarObjetivoMensual,
  obtenerMesActual,
  obtenerPanelObjetivoMensual,
} from "../services/ObjetivoMensualService";

const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function colorAvance(valor) {
  if (valor >= 100) return "bg-emerald-500";
  if (valor >= 70) return "bg-blue-600";
  if (valor >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function numero(valor) {
  return Number(valor || 0);
}

function KpiMes({ icon: Icon, titulo, real, meta, avance, detalle, destacado }) {
  return (
    <div
      className={`border rounded-xl p-5 shadow-sm ${
        destacado ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold ${destacado ? "text-slate-300" : "text-slate-500"}`}>
            {titulo}
          </p>
          <p className="text-2xl font-bold mt-2">
            {real}
            <span className="text-sm font-semibold text-slate-400"> de {meta}</span>
          </p>
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            destacado ? "bg-white/10" : "bg-blue-50 text-blue-700"
          }`}
        >
          <Icon size={18} />
        </div>
      </div>
      <div className={`h-2 rounded-full mt-4 ${destacado ? "bg-white/10" : "bg-slate-100"}`}>
        <div className={`h-2 rounded-full ${colorAvance(avance)}`} style={{ width: `${avance}%` }} />
      </div>
      <p className={`text-xs mt-2 ${destacado ? "text-slate-400" : "text-slate-500"}`}>
        {avance}% · {detalle}
      </p>
    </div>
  );
}

export default function ObjetivosMensuales() {
  const [panel, setPanel] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] = useState({
    mes: obtenerMesActual(),
    metaContactos: 200,
    metaRespuestas: 40,
    metaReuniones: 20,
    metaDiagnosticos: 12,
    metaPropuestas: 8,
    metaClientes: 3,
    metaVenta: 300000,
    metaMensualidad: 150000,
    focoMes: "Conseguir primeros clientes de pago para validar Tactika.",
    decisionMes: "",
  });

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerPanelObjetivoMensual();
      setPanel(data);
      setFormulario(data.objetivo);
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar", text: error.message });
    } finally {
      setCargando(false);
    }
  }

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  function editarObjetivo(objetivo) {
    setFormulario(objetivo);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function guardar(e) {
    e.preventDefault();

    try {
      await guardarObjetivoMensual(formulario);
      await cargar();
      Swal.fire({
        icon: "success",
        title: "Objetivo mensual guardado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.message });
    }
  }

  async function eliminar(objetivo) {
    const respuesta = await Swal.fire({
      title: "¿Eliminar objetivo mensual?",
      text: objetivo.mes,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!respuesta.isConfirmed) return;

    try {
      await eliminarObjetivoMensual(objetivo.id);
      await cargar();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo eliminar", text: error.message });
    }
  }

  const real = panel?.real || {};
  const avance = panel?.avance || {};
  const tasas = panel?.tasas || {};

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-blue-600">Tactika Suite</p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
          Objetivos Mensuales
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Controla si Tactika esta creciendo: prospeccion, reuniones, diagnosticos, ventas,
          clientes nuevos e ingreso mensual activo.
        </p>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <form onSubmit={guardar} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4 h-fit">
          <div className="flex items-center gap-2">
            <CalendarRange size={18} className="text-blue-700" />
            <h2 className="text-lg font-bold text-slate-800">Meta del mes</h2>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Mes</span>
            <input
              type="month"
              value={formulario.mes}
              onChange={(e) => cambiar("mes", e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["metaContactos", "Contactos"],
              ["metaRespuestas", "Respuestas"],
              ["metaReuniones", "Reuniones"],
              ["metaDiagnosticos", "Diagnosticos"],
              ["metaPropuestas", "Propuestas"],
              ["metaClientes", "Clientes"],
            ].map(([campo, label]) => (
              <label key={campo} className="block">
                <span className="text-xs font-semibold text-slate-700">{label}</span>
                <input
                  type="number"
                  min="0"
                  value={formulario[campo]}
                  onChange={(e) => cambiar(campo, Number(e.target.value || 0))}
                  className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                />
              </label>
            ))}
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Meta venta mensual</span>
            <input
              type="number"
              min="0"
              value={formulario.metaVenta}
              onChange={(e) => cambiar("metaVenta", Number(e.target.value || 0))}
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Meta mensualidad activa</span>
            <input
              type="number"
              min="0"
              value={formulario.metaMensualidad}
              onChange={(e) => cambiar("metaMensualidad", Number(e.target.value || 0))}
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Foco del mes</span>
            <textarea
              value={formulario.focoMes}
              onChange={(e) => cambiar("focoMes", e.target.value)}
              placeholder="Ej: cerrar 3 diagnosticos pagados y 1 implementacion."
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm min-h-20"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Decision de cierre mensual</span>
            <textarea
              value={formulario.decisionMes}
              onChange={(e) => cambiar("decisionMes", e.target.value)}
              placeholder="Al cierre del mes, registra que se mantiene, cambia o elimina."
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm min-h-20"
            />
          </label>

          <button
            type="submit"
            className="w-full min-h-10 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Guardar objetivo mensual
          </button>
        </form>

        <div className="space-y-4">
          <section className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase font-semibold text-slate-400">Decision ejecutiva</p>
            <h2 className="text-xl font-bold mt-2">Lectura del mes</h2>
            <p className="text-sm text-slate-300 mt-3">{panel?.decision || "Cargando..."}</p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiMes
              icon={Users}
              titulo="Contactos"
              real={numero(real.prospectosContactados)}
              meta={numero(formulario.metaContactos)}
              avance={numero(avance.contactos)}
              detalle="Actividad comercial"
              destacado
            />
            <KpiMes
              icon={MessageCircle}
              titulo="Respuestas"
              real={numero(real.respuestasRecibidas)}
              meta={numero(formulario.metaRespuestas)}
              avance={numero(avance.respuestas)}
              detalle={`Tasa respuesta ${numero(tasas.respuesta)}%`}
            />
            <KpiMes
              icon={PhoneCall}
              titulo="Reuniones"
              real={numero(real.reunionesAgendadas)}
              meta={numero(formulario.metaReuniones)}
              avance={numero(avance.reuniones)}
              detalle={`Respuesta a reunion ${numero(tasas.reunion)}%`}
            />
            <KpiMes
              icon={Target}
              titulo="Diagnosticos"
              real={numero(real.diagnosticosRealizados)}
              meta={numero(formulario.metaDiagnosticos)}
              avance={numero(avance.diagnosticos)}
              detalle="Oferta de entrada"
            />
            <KpiMes
              icon={LineChart}
              titulo="Propuestas"
              real={numero(real.propuestasEnviadas)}
              meta={numero(formulario.metaPropuestas)}
              avance={numero(avance.propuestas)}
              detalle="Oportunidades formales"
            />
            <KpiMes
              icon={CheckCircle2}
              titulo="Clientes"
              real={numero(real.clientesNuevos)}
              meta={numero(formulario.metaClientes)}
              avance={numero(avance.clientes)}
              detalle={`Cierre ${numero(tasas.cierre)}%`}
            />
            <KpiMes
              icon={DollarSign}
              titulo="Venta"
              real={formatoCLP.format(numero(real.totalVendido))}
              meta={formatoCLP.format(numero(formulario.metaVenta))}
              avance={numero(avance.venta)}
              detalle="Ingreso vendido"
            />
            <KpiMes
              icon={DollarSign}
              titulo="Mensualidad"
              real={formatoCLP.format(numero(real.mensualidadActiva))}
              meta={formatoCLP.format(numero(formulario.metaMensualidad))}
              avance={numero(avance.mensualidad)}
              detalle="Ingreso recurrente"
            />
          </section>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Historial mensual</h2>
              <p className="text-sm text-slate-500 mt-1">
                Cada mes deja una meta y una decision para aprender con datos.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {cargando ? (
                <p className="p-5 text-sm text-slate-500">Cargando objetivos...</p>
              ) : panel?.objetivos?.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">Aun no hay objetivos mensuales guardados.</p>
              ) : (
                panel?.objetivos?.map((objetivo) => (
                  <div key={objetivo.id} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-800">Mes {objetivo.mes}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Meta: {objetivo.metaContactos} contactos · {objetivo.metaReuniones} reuniones ·{" "}
                        {objetivo.metaClientes} clientes · {formatoCLP.format(objetivo.metaVenta)}
                      </p>
                      {objetivo.focoMes && (
                        <p className="text-xs text-blue-700 mt-2">Foco: {objetivo.focoMes}</p>
                      )}
                      {objetivo.decisionMes && (
                        <p className="text-xs text-slate-600 mt-1">
                          Decision: {objetivo.decisionMes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => editarObjetivo(objetivo)}
                        className="border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 flex items-center gap-1"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminar(objetivo)}
                        className="border border-red-100 text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <div className="flex gap-3">
              <AlertTriangle className="text-amber-700 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-amber-900">
                  Este tablero es para tomar decisiones, no solo mirar numeros. Si el mes no avanza,
                  se ajusta canal, mensaje, oferta o cantidad de contactos.
                </p>
                <Link
                  to="/decisiones"
                  className="inline-flex mt-3 text-sm font-bold text-amber-900 underline"
                >
                  Abrir tablero de decisiones
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
