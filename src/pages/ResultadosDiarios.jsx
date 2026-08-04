import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarCheck,
  DollarSign,
  MessageSquareReply,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";

import {
  eliminarResultadoDiario,
  guardarResultadoDiario,
  obtenerResultadosDiarios,
} from "../services/ResultadosDiariosService";

const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function porcentaje(parte, total) {
  if (!total) return 0;
  return Math.round((parte / total) * 100);
}

function KpiResultado({ icon: Icon, titulo, valor, detalle, destacado }) {
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
      <p className={`text-xs mt-1 ${destacado ? "text-slate-400" : "text-slate-500"}`}>
        {detalle}
      </p>
    </div>
  );
}

export default function ResultadosDiarios() {
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] = useState({
    fecha: hoy(),
    prospectosContactados: 0,
    respuestasRecibidas: 0,
    reunionesAgendadas: 0,
    diagnosticosRealizados: 0,
    propuestasEnviadas: 0,
    ventasCerradas: 0,
    montoVendido: 0,
    aprendizajes: "",
    bloqueos: "",
    proximaMejora: "",
  });

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    const data = await obtenerResultadosDiarios();
    setResultados(data);
    setCargando(false);
  }

  function editarResultado(resultado) {
    setFormulario({
      fecha: resultado.fecha,
      prospectosContactados: resultado.prospectosContactados,
      respuestasRecibidas: resultado.respuestasRecibidas,
      reunionesAgendadas: resultado.reunionesAgendadas,
      diagnosticosRealizados: resultado.diagnosticosRealizados,
      propuestasEnviadas: resultado.propuestasEnviadas,
      ventasCerradas: resultado.ventasCerradas,
      montoVendido: resultado.montoVendido,
      aprendizajes: resultado.aprendizajes || "",
      bloqueos: resultado.bloqueos || "",
      proximaMejora: resultado.proximaMejora || "",
    });
  }

  async function guardar(e) {
    e.preventDefault();

    try {
      await guardarResultadoDiario(formulario);
      await cargar();
      Swal.fire({
        icon: "success",
        title: "Resultado diario guardado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.message });
    }
  }

  async function eliminar(resultado) {
    const respuesta = await Swal.fire({
      title: "¿Eliminar resultado diario?",
      text: resultado.fecha,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!respuesta.isConfirmed) return;

    try {
      await eliminarResultadoDiario(resultado.id);
      await cargar();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo eliminar", text: error.message });
    }
  }

  const metricas = useMemo(() => {
    const total = resultados.reduce(
      (acc, item) => ({
        prospectosContactados: acc.prospectosContactados + item.prospectosContactados,
        respuestasRecibidas: acc.respuestasRecibidas + item.respuestasRecibidas,
        reunionesAgendadas: acc.reunionesAgendadas + item.reunionesAgendadas,
        propuestasEnviadas: acc.propuestasEnviadas + item.propuestasEnviadas,
        ventasCerradas: acc.ventasCerradas + item.ventasCerradas,
        montoVendido: acc.montoVendido + item.montoVendido,
      }),
      {
        prospectosContactados: 0,
        respuestasRecibidas: 0,
        reunionesAgendadas: 0,
        propuestasEnviadas: 0,
        ventasCerradas: 0,
        montoVendido: 0,
      }
    );

    return {
      ...total,
      tasaRespuesta: porcentaje(total.respuestasRecibidas, total.prospectosContactados),
      tasaCierre: porcentaje(total.ventasCerradas, total.propuestasEnviadas),
    };
  }, [resultados]);

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-blue-600">Tactika Suite</p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
          Resultados Diarios
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Registra cada dia lo que hiciste para vender: contactos, respuestas, reuniones,
          propuestas, cierres y aprendizajes.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiResultado
          icon={Users}
          titulo="Contactados"
          valor={metricas.prospectosContactados}
          detalle="Ultimos 30 registros"
          destacado
        />
        <KpiResultado
          icon={MessageSquareReply}
          titulo="Tasa respuesta"
          valor={`${metricas.tasaRespuesta}%`}
          detalle={`${metricas.respuestasRecibidas} respuestas recibidas`}
        />
        <KpiResultado
          icon={CalendarCheck}
          titulo="Reuniones"
          valor={metricas.reunionesAgendadas}
          detalle="Agendadas desde prospeccion"
        />
        <KpiResultado
          icon={DollarSign}
          titulo="Monto vendido"
          valor={formatoCLP.format(metricas.montoVendido)}
          detalle={`${metricas.ventasCerradas} ventas cerradas`}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <form onSubmit={guardar} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4 h-fit">
          <h2 className="text-lg font-bold text-slate-800">Cierre del dia</h2>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Fecha</span>
            <input
              type="date"
              value={formulario.fecha}
              onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })}
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["prospectosContactados", "Prospectos contactados"],
              ["respuestasRecibidas", "Respuestas"],
              ["reunionesAgendadas", "Reuniones"],
              ["diagnosticosRealizados", "Diagnosticos"],
              ["propuestasEnviadas", "Propuestas"],
              ["ventasCerradas", "Ventas"],
            ].map(([campo, label]) => (
              <label key={campo} className="block">
                <span className="text-xs font-semibold text-slate-700">{label}</span>
                <input
                  type="number"
                  min="0"
                  value={formulario[campo]}
                  onChange={(e) =>
                    setFormulario({ ...formulario, [campo]: Number(e.target.value || 0) })
                  }
                  className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                />
              </label>
            ))}
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Monto vendido</span>
            <input
              type="number"
              min="0"
              value={formulario.montoVendido}
              onChange={(e) =>
                setFormulario({ ...formulario, montoVendido: Number(e.target.value || 0) })
              }
              placeholder="Ej: 29990"
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Aprendizajes</span>
            <textarea
              value={formulario.aprendizajes}
              onChange={(e) => setFormulario({ ...formulario, aprendizajes: e.target.value })}
              placeholder="Que aprendiste hoy del mercado o de los clientes."
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm min-h-20"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Bloqueos</span>
            <textarea
              value={formulario.bloqueos}
              onChange={(e) => setFormulario({ ...formulario, bloqueos: e.target.value })}
              placeholder="Que te freno hoy."
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm min-h-16"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Proxima mejora</span>
            <input
              type="text"
              value={formulario.proximaMejora}
              onChange={(e) => setFormulario({ ...formulario, proximaMejora: e.target.value })}
              placeholder="Ej: mejorar mensaje de WhatsApp"
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
            />
          </label>

          <button
            type="submit"
            className="w-full min-h-10 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Guardar resultado del dia
          </button>
        </form>

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Historial reciente</h2>
              <p className="text-sm text-slate-500 mt-1">
                Ultimos registros comerciales y aprendizajes.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <BarChart3 size={16} />
              Cierre: {metricas.tasaCierre}%
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {cargando ? (
              <p className="p-5 text-sm text-slate-500">Cargando resultados...</p>
            ) : resultados.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">Aun no hay resultados registrados.</p>
            ) : (
              resultados.map((resultado) => (
                <div key={resultado.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-800">{resultado.fecha}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Contactados: {resultado.prospectosContactados} · Respuestas:{" "}
                        {resultado.respuestasRecibidas} · Reuniones:{" "}
                        {resultado.reunionesAgendadas} · Propuestas:{" "}
                        {resultado.propuestasEnviadas} · Ventas: {resultado.ventasCerradas}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Monto vendido: {formatoCLP.format(resultado.montoVendido)}
                      </p>
                      {resultado.aprendizajes && (
                        <p className="text-xs text-blue-700 mt-2">
                          Aprendizaje: {resultado.aprendizajes}
                        </p>
                      )}
                      {resultado.proximaMejora && (
                        <p className="text-xs text-slate-600 mt-1">
                          Proxima mejora: {resultado.proximaMejora}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => editarResultado(resultado)}
                        className="border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold text-slate-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminar(resultado)}
                        className="border border-red-100 text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>

      <section className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
        <p className="text-xs uppercase font-semibold text-slate-400">Rutina recomendada</p>
        <h2 className="text-xl font-bold mt-2">Cierre comercial de 10 minutos</h2>
        <p className="text-sm text-slate-300 mt-3 max-w-4xl">
          Al final del dia registra tus numeros reales. Si una semana contactas mucho pero tienes
          pocas respuestas, ajustamos mensaje. Si tienes respuestas pero pocas reuniones, ajustamos
          oferta. Si tienes reuniones pero no ventas, ajustamos propuesta y precio.
        </p>
        <Link
          to="/seguimiento-semanal"
          className="inline-flex mt-4 bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold"
        >
          Revisar seguimiento semanal
        </Link>
      </section>
    </div>
  );
}
