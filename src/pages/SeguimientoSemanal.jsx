import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  DollarSign,
  MessageCircle,
  Pencil,
  PhoneCall,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";

import {
  eliminarSeguimientoSemanal,
  guardarSeguimientoSemanal,
  obtenerPanelSeguimientoSemanal,
  obtenerSemanaActual,
} from "../services/SeguimientoSemanalService";

const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function progresoColor(valor) {
  if (valor >= 100) return "bg-emerald-500";
  if (valor >= 60) return "bg-blue-600";
  if (valor >= 30) return "bg-amber-500";
  return "bg-red-500";
}

function KpiSemana({ icon: Icon, titulo, real, meta, avance, detalle, destacado }) {
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
            <span className={`text-sm font-semibold ${destacado ? "text-slate-400" : "text-slate-400"}`}>
              {" "}de {meta}
            </span>
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
        <div className={`h-2 rounded-full ${progresoColor(avance)}`} style={{ width: `${avance}%` }} />
      </div>
      <p className={`text-xs mt-2 ${destacado ? "text-slate-400" : "text-slate-500"}`}>
        {avance}% · {detalle}
      </p>
    </div>
  );
}

function numero(valor) {
  return Number(valor || 0);
}

export default function SeguimientoSemanal() {
  const [panel, setPanel] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] = useState({
    semanaInicio: obtenerSemanaActual(),
    metaContactos: 50,
    metaRespuestas: 10,
    metaReuniones: 5,
    metaDiagnosticos: 3,
    metaPropuestas: 2,
    metaVentas: 1,
    metaMonto: 29990,
    focoSemana: "Conseguir conversaciones reales con duenos de pymes.",
    decisionSemana: "",
  });

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerPanelSeguimientoSemanal();
      setPanel(data);
      setFormulario(data.semana);
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar", text: error.message });
    } finally {
      setCargando(false);
    }
  }

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  function editarSemana(semana) {
    setFormulario(semana);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function guardar(e) {
    e.preventDefault();

    try {
      await guardarSeguimientoSemanal(formulario);
      await cargar();
      Swal.fire({
        icon: "success",
        title: "Seguimiento semanal guardado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.message });
    }
  }

  async function eliminar(semana) {
    const respuesta = await Swal.fire({
      title: "¿Eliminar seguimiento semanal?",
      text: semana.semanaInicio,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!respuesta.isConfirmed) return;

    try {
      await eliminarSeguimientoSemanal(semana.id);
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
          Seguimiento Semanal
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Define metas comerciales, compara el avance real con los cierres diarios y decide que
          ajustar para captar clientes.
        </p>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <form onSubmit={guardar} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4 h-fit">
          <div className="flex items-center gap-2">
            <CalendarRange size={18} className="text-blue-700" />
            <h2 className="text-lg font-bold text-slate-800">Plan de la semana</h2>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Inicio de semana</span>
            <input
              type="date"
              value={formulario.semanaInicio}
              onChange={(e) => cambiar("semanaInicio", e.target.value)}
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
              ["metaVentas", "Ventas"],
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
            <span className="text-sm font-semibold text-slate-700">Meta de venta</span>
            <input
              type="number"
              min="0"
              value={formulario.metaMonto}
              onChange={(e) => cambiar("metaMonto", Number(e.target.value || 0))}
              placeholder="Ej: 29990"
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Foco de la semana</span>
            <textarea
              value={formulario.focoSemana}
              onChange={(e) => cambiar("focoSemana", e.target.value)}
              placeholder="Ej: contactar constructoras de Buin y agendar diagnosticos."
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm min-h-20"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Decision de cierre semanal</span>
            <textarea
              value={formulario.decisionSemana}
              onChange={(e) => cambiar("decisionSemana", e.target.value)}
              placeholder="Al terminar la semana, registra que se cambia para la siguiente."
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm min-h-20"
            />
          </label>

          <button
            type="submit"
            className="w-full min-h-10 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Guardar plan semanal
          </button>
        </form>

        <div className="space-y-4">
          <section className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase font-semibold text-slate-400">Recomendacion comercial</p>
            <h2 className="text-xl font-bold mt-2">Decision de la semana</h2>
            <p className="text-sm text-slate-300 mt-3">{panel?.recomendacion || "Cargando..."}</p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <KpiSemana
              icon={Users}
              titulo="Contactos"
              real={numero(real.prospectosContactados)}
              meta={numero(formulario.metaContactos)}
              avance={numero(avance.contactos)}
              detalle="Volumen comercial"
              destacado
            />
            <KpiSemana
              icon={MessageCircle}
              titulo="Respuestas"
              real={numero(real.respuestasRecibidas)}
              meta={numero(formulario.metaRespuestas)}
              avance={numero(avance.respuestas)}
              detalle={`Tasa respuesta ${numero(tasas.respuesta)}%`}
            />
            <KpiSemana
              icon={PhoneCall}
              titulo="Reuniones"
              real={numero(real.reunionesAgendadas)}
              meta={numero(formulario.metaReuniones)}
              avance={numero(avance.reuniones)}
              detalle={`De respuesta a reunion ${numero(tasas.reunion)}%`}
            />
            <KpiSemana
              icon={Target}
              titulo="Diagnosticos"
              real={numero(real.diagnosticosRealizados)}
              meta={numero(formulario.metaDiagnosticos)}
              avance={numero(avance.diagnosticos)}
              detalle="Puerta de entrada"
            />
            <KpiSemana
              icon={CheckCircle2}
              titulo="Ventas"
              real={numero(real.ventasCerradas)}
              meta={numero(formulario.metaVentas)}
              avance={numero(avance.ventas)}
              detalle={`Cierre ${numero(tasas.cierre)}%`}
            />
            <KpiSemana
              icon={DollarSign}
              titulo="Monto"
              real={formatoCLP.format(numero(real.montoVendido))}
              meta={formatoCLP.format(numero(formulario.metaMonto))}
              avance={numero(avance.monto)}
              detalle="Facturacion semanal"
            />
          </section>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Historial semanal</h2>
              <p className="text-sm text-slate-500 mt-1">
                Guarda una semana por vez para comparar foco, metas y decisiones.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {cargando ? (
                <p className="p-5 text-sm text-slate-500">Cargando seguimiento...</p>
              ) : panel?.seguimientos?.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">Aun no hay semanas guardadas.</p>
              ) : (
                panel?.seguimientos?.map((semana) => (
                  <div key={semana.id} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-800">Semana {semana.semanaInicio}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Meta: {semana.metaContactos} contactos · {semana.metaReuniones} reuniones ·{" "}
                        {semana.metaVentas} venta(s) · {formatoCLP.format(semana.metaMonto)}
                      </p>
                      {semana.focoSemana && (
                        <p className="text-xs text-blue-700 mt-2">Foco: {semana.focoSemana}</p>
                      )}
                      {semana.decisionSemana && (
                        <p className="text-xs text-slate-600 mt-1">
                          Decision: {semana.decisionSemana}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => editarSemana(semana)}
                        className="border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 flex items-center gap-1"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminar(semana)}
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
              <p className="text-sm text-amber-900">
                Este panel no reemplaza el registro diario. Primero anota cada dia en Resultados;
                luego aqui revisas la semana y decides que ajustar para vender mejor.
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
