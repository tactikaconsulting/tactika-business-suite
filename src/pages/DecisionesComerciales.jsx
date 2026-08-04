import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Lightbulb,
  MessageCircle,
  PhoneCall,
  Target,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";

import { obtenerTableroDecisiones } from "../services/DecisionComercialService";

const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function BadgePrioridad({ prioridad }) {
  const clase =
    prioridad === "Alta"
      ? "bg-red-50 text-red-700 border-red-100"
      : "bg-amber-50 text-amber-700 border-amber-100";

  return <span className={`px-2 py-1 rounded-full border text-xs font-bold ${clase}`}>{prioridad}</span>;
}

function KpiDecision({ icon: Icon, titulo, valor, detalle, destacado }) {
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

export default function DecisionesComerciales() {
  const [tablero, setTablero] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerTableroDecisiones();
      setTablero(data);
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar", text: error.message });
    } finally {
      setCargando(false);
    }
  }

  const real = tablero?.panelMensual?.real || {};
  const tasas = tablero?.panelMensual?.tasas || {};
  const decision = tablero?.decision;

  if (cargando && !tablero) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-8 text-sm text-slate-500">
        Cargando tablero de decisiones...
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-blue-600">Tactika Suite</p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
          Decisiones Comerciales
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Lee los resultados y convierte los numeros en acciones: mensaje, canal, volumen,
          seguimiento, propuesta o precio.
        </p>
      </section>

      <section className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Decision principal</p>
            <h2 className="text-2xl font-bold mt-2">{decision?.etapa}</h2>
            <p className="text-sm text-slate-300 mt-3 max-w-4xl">{decision?.problema}</p>
            <p className="text-sm text-white font-semibold mt-3">{decision?.decision}</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3 min-w-48">
            <p className="text-xs text-slate-400 uppercase font-semibold">Estado</p>
            <p className="text-xl font-bold mt-1">{decision?.estado}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiDecision
          icon={Users}
          titulo="Contactos mes"
          valor={real.prospectosContactados || 0}
          detalle="Volumen comercial"
          destacado
        />
        <KpiDecision
          icon={MessageCircle}
          titulo="Respuesta"
          valor={`${tasas.respuesta || 0}%`}
          detalle={`${real.respuestasRecibidas || 0} respuestas recibidas`}
        />
        <KpiDecision
          icon={PhoneCall}
          titulo="Reunion"
          valor={`${tasas.reunion || 0}%`}
          detalle={`${real.reunionesAgendadas || 0} reuniones agendadas`}
        />
        <KpiDecision
          icon={DollarSign}
          titulo="Venta"
          valor={formatoCLP.format(real.totalVendido || 0)}
          detalle={`${real.clientesNuevos || 0} clientes nuevos`}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Acciones recomendadas</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Si haces solo una cosa, parte por la primera.
                </p>
              </div>
              <Lightbulb className="text-blue-700" size={20} />
            </div>

            <div className="divide-y divide-slate-100">
              {tablero?.acciones?.map((accion, index) => (
                <div key={`${accion.tipo}-${index}`} className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase font-semibold text-blue-700">{accion.tipo}</p>
                    <p className="font-bold text-slate-800 mt-1">{accion.titulo}</p>
                  </div>
                  <BadgePrioridad prioridad={accion.prioridad} />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Prospectos a contactar primero</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Priorizados por indice, estado comercial y seguimiento.
                </p>
              </div>
              <Link to="/crm" className="text-sm font-bold text-blue-700 flex items-center gap-1">
                Ir al CRM <ArrowRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {tablero?.prospectosPriorizados?.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">No hay prospectos abiertos por priorizar.</p>
              ) : (
                tablero?.prospectosPriorizados?.map((prospecto) => (
                  <div key={prospecto.id} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-800">{prospecto.empresa}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {prospecto.estado} · Indice {prospecto.indiceTactika || 0} ·{" "}
                        {prospecto.comuna || "Sin comuna"}
                      </p>
                      {prospecto.fechaProximoContacto && (
                        <p
                          className={`text-xs mt-2 ${
                            prospecto.seguimientoVencido ? "text-red-700" : "text-blue-700"
                          }`}
                        >
                          Proximo contacto: {prospecto.fechaProximoContacto}
                        </p>
                      )}
                    </div>
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-bold">
                      {prospecto.puntajeDecision}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Que revisar ahora</h2>
              <p className="text-sm text-slate-500 mt-1">Atajos para corregir el sistema comercial.</p>
            </div>
            <div className="p-4 space-y-3">
              <Link
                to="/resultados"
                className="flex items-center justify-between border border-slate-200 rounded-lg p-3 hover:bg-slate-50"
              >
                <span className="text-sm font-bold text-slate-700">Resultados diarios</span>
                <ClipboardList size={16} />
              </Link>
              <Link
                to="/seguimiento-semanal"
                className="flex items-center justify-between border border-slate-200 rounded-lg p-3 hover:bg-slate-50"
              >
                <span className="text-sm font-bold text-slate-700">Semana comercial</span>
                <Target size={16} />
              </Link>
              <Link
                to="/objetivos-mensuales"
                className="flex items-center justify-between border border-slate-200 rounded-lg p-3 hover:bg-slate-50"
              >
                <span className="text-sm font-bold text-slate-700">Objetivos mensuales</span>
                <CheckCircle2 size={16} />
              </Link>
              <Link
                to="/playbook"
                className="flex items-center justify-between border border-slate-200 rounded-lg p-3 hover:bg-slate-50"
              >
                <span className="text-sm font-bold text-slate-700">Playbook comercial</span>
                <MessageCircle size={16} />
              </Link>
            </div>
          </section>

          <section className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <div className="flex gap-3">
              <AlertTriangle className="text-amber-700 mt-0.5" size={18} />
              <p className="text-sm text-amber-900">
                Esta version usa reglas comerciales internas. Mas adelante podemos conectar IA real
                para explicar decisiones con lenguaje mas consultivo.
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
