import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Briefcase,
  CalendarDays,
  CalendarPlus,
  Clock3,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import Swal from "sweetalert2";

import { descargarRecordatorioICS } from "../services/CalendarioService";
import { obtenerAgendaOperativa } from "../services/AgendaService";

function hoyClave() {
  return new Date().toISOString().slice(0, 10);
}

function fechaVisible(valor) {
  if (!valor) return "Sin fecha";
  return new Date(valor).toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function colorTipo(tipo) {
  if (tipo === "Cobro") return "bg-green-50 text-green-700 border-green-200";
  if (tipo === "Prospecto") return "bg-blue-50 text-blue-700 border-blue-200";
  if (tipo === "Implementacion") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function colorGrupo(grupo) {
  if (grupo === "vencido") return "bg-red-50 text-red-700 border-red-200";
  if (grupo === "hoy") return "bg-blue-50 text-blue-700 border-blue-200";
  if (grupo === "semana") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function textoGrupo(grupo) {
  const textos = {
    vencido: "Vencido",
    hoy: "Hoy",
    semana: "7 dias",
    futuro: "Futuro",
    sin_fecha: "Sin fecha",
  };
  return textos[grupo] || grupo;
}

function KpiAgenda({ icon: Icon, titulo, valor, detalle, alerta, destacado }) {
  return (
    <div
      className={`border rounded-xl p-5 shadow-sm ${
        destacado
          ? "bg-slate-900 border-slate-900 text-white"
          : alerta
            ? "bg-red-50 border-red-100"
            : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm font-semibold ${destacado ? "text-slate-300" : "text-slate-500"}`}>
          {titulo}
        </p>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            destacado
              ? "bg-white/10"
              : alerta
                ? "bg-red-100 text-red-700"
                : "bg-blue-50 text-blue-700"
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

function EventoAgenda({ evento }) {
  return (
    <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`border rounded-full px-2.5 py-1 text-xs font-bold ${colorTipo(evento.tipo)}`}>
              {evento.tipo}
            </span>
            <span className={`border rounded-full px-2.5 py-1 text-xs font-bold ${colorGrupo(evento.grupo)}`}>
              {textoGrupo(evento.grupo)}
            </span>
            <span className="text-xs text-slate-400">{fechaVisible(evento.fecha)}</span>
          </div>
          <h3 className="font-bold text-slate-800 mt-3">{evento.titulo}</h3>
          <p className="text-sm text-slate-500 mt-1">{evento.clienteNombre || "Sin cliente"}</p>
          {evento.descripcion && (
            <p className="text-xs text-slate-500 mt-2">{evento.descripcion}</p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Responsable: {evento.responsable || "Sin responsable"} · Prioridad: {evento.prioridad}
          </p>
        </div>
        <div className="shrink-0 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => descargarRecordatorioICS(evento)}
            className="border border-blue-100 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 text-xs font-bold text-blue-700 flex items-center gap-1"
          >
            Calendario
            <CalendarPlus size={13} />
          </button>
          <Link
            to={evento.ruta}
            className="border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 flex items-center gap-1"
          >
            Abrir
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Agenda() {
  const [agenda, setAgenda] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("prioridad");
  const [fecha, setFecha] = useState(hoyClave());

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerAgendaOperativa();
      setAgenda(data);
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar la agenda", text: error.message });
    } finally {
      setCargando(false);
    }
  }

  const eventosFiltrados = useMemo(() => {
    const eventos = agenda?.eventos || [];
    if (filtro === "hoy") return eventos.filter((evento) => evento.grupo === "hoy");
    if (filtro === "vencidos") return eventos.filter((evento) => evento.grupo === "vencido");
    if (filtro === "semana") {
      return eventos.filter((evento) => ["hoy", "semana", "vencido"].includes(evento.grupo));
    }
    if (filtro === "fecha") return eventos.filter((evento) => evento.fechaClave === fecha);
    return eventos.filter((evento) => ["vencido", "hoy", "semana"].includes(evento.grupo));
  }, [agenda, fecha, filtro]);

  if (cargando && !agenda) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-8 text-sm text-slate-500">
        Cargando agenda operativa...
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">Tactika Suite</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
              Agenda Comercial y Operativa
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Reune contactos comerciales, tareas de implementacion, proximos cobros y acuerdos.
            </p>
          </div>

          <button
            type="button"
            onClick={cargar}
            className="min-h-10 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Actualizar agenda
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiAgenda
          icon={AlertTriangle}
          titulo="Vencidos"
          valor={agenda?.metricas.vencidos || 0}
          detalle="Requieren accion inmediata"
          alerta={(agenda?.metricas.vencidos || 0) > 0}
        />
        <KpiAgenda
          icon={CalendarDays}
          titulo="Hoy"
          valor={agenda?.metricas.hoy || 0}
          detalle="Compromisos del dia"
          destacado
        />
        <KpiAgenda
          icon={Clock3}
          titulo="Proximos 7 dias"
          valor={agenda?.metricas.semana || 0}
          detalle="Planificables esta semana"
        />
        <KpiAgenda
          icon={DollarSign}
          titulo="Cobros"
          valor={agenda?.metricas.cobros || 0}
          detalle="Pagos con fecha programada"
        />
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {[
            ["prioridad", "Prioridad"],
            ["hoy", "Hoy"],
            ["vencidos", "Vencidos"],
            ["semana", "Semana"],
            ["fecha", "Por fecha"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFiltro(id)}
              className={`min-h-10 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filtro === id
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}

          {filtro === "fecha" && (
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="min-h-10 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-3">
          {eventosFiltrados.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
              <Briefcase className="mx-auto text-slate-300" size={32} />
              <h2 className="text-lg font-bold text-slate-700 mt-3">Sin eventos en esta vista</h2>
              <p className="text-sm text-slate-500 mt-1">
                Cambia el filtro o registra proximos pasos desde CRM, ventas o Ficha 360.
              </p>
            </div>
          ) : (
            eventosFiltrados.map((evento) => <EventoAgenda key={evento.id} evento={evento} />)
          )}
        </div>

        <aside className="bg-slate-900 text-white rounded-xl p-5 h-fit shadow-sm">
          <p className="text-xs uppercase font-semibold text-slate-400">Uso recomendado</p>
          <h2 className="text-xl font-bold mt-2">Rutina diaria Tactika</h2>
          <div className="space-y-4 mt-5 text-sm text-slate-300">
            <p>
              1. Parte por <span className="font-bold text-white">Vencidos</span>. Eso evita perder
              clientes o compromisos.
            </p>
            <p>
              2. Luego revisa <span className="font-bold text-white">Hoy</span> para llamadas,
              reuniones y cobros.
            </p>
            <p>
              3. Cierra mirando <span className="font-bold text-white">Semana</span> para preparar
              propuestas, implementaciones y seguimientos.
            </p>
            <p>
              4. Usa <span className="font-bold text-white">Calendario</span> para descargar un
              recordatorio e importarlo a Google Calendar, Apple Calendar u Outlook.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
