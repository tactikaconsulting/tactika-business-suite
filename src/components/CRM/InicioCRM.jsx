import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  FileText,
  Megaphone,
  MessageSquareText,
  Target,
} from "lucide-react";

function formatoCLP(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CL");
}

function inicioDia(fecha) {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

function diasDiferencia(fecha) {
  const hoy = inicioDia(new Date());
  const objetivo = inicioDia(`${fecha}T00:00:00`);
  return Math.round((objetivo - hoy) / (1000 * 60 * 60 * 24));
}

function diasDesde(fecha) {
  if (!fecha) return 0;
  const hoy = inicioDia(new Date());
  const base = inicioDia(`${fecha}T00:00:00`);
  return Math.floor((hoy - base) / (1000 * 60 * 60 * 24));
}

function esHoyOVencido(fecha) {
  if (!fecha) return false;
  return inicioDia(fecha).getTime() <= inicioDia(new Date()).getTime();
}

function MiniCard({ icon: Icon, label, valor, detalle, variante = "default" }) {
  const oscuro = variante === "dark";

  return (
    <div className={`rounded-lg border p-4 min-h-[124px] ${oscuro ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-800"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${oscuro ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"}`}>
          <Icon size={18} />
        </div>
        <span className={`text-xs font-medium ${oscuro ? "text-slate-300" : "text-slate-400"}`}>
          {detalle}
        </span>
      </div>
      <p className={`mt-4 text-xs font-medium ${oscuro ? "text-slate-300" : "text-slate-500"}`}>
        {label}
      </p>
      <p className="mt-1 text-xl md:text-2xl font-bold font-mono break-words">{valor}</p>
    </div>
  );
}

function ListaSimple({ titulo, vacio, items, renderItem, accion }) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 min-h-[240px]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-slate-700">{titulo}</h3>
        {accion}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">{vacio}</p>
      ) : (
        <div className="space-y-3">{items.map(renderItem)}</div>
      )}
    </section>
  );
}

export default function InicioCRM({
  prospectos,
  propuestas,
  mensajesProgramados = [],
  onAbrirProspecto,
  onRegistrarInteraccion,
  onCrearPropuesta,
  onIrA,
}) {
  const activos = prospectos.filter((p) => p.estado !== "Cliente" && p.estado !== "Perdido");
  const prospectosPrioritarios = [...activos]
    .sort((a, b) => Number(b.indiceTactika || 0) - Number(a.indiceTactika || 0))
    .slice(0, 5);

  const seguimientosVencidos = activos
    .filter((p) => p.fechaProximoContacto && diasDiferencia(p.fechaProximoContacto) <= 0)
    .sort((a, b) => diasDiferencia(a.fechaProximoContacto) - diasDiferencia(b.fechaProximoContacto))
    .slice(0, 5);

  const propuestasPendientes = propuestas
    .filter((p) => p.estado === "Enviada" && diasDesde(p.fechaEnvio || p.createdAt?.slice(0, 10)) >= 3)
    .slice(0, 5);

  const mensajesParaHoy = mensajesProgramados
    .filter((m) => ["Programado", "Preparado", "Sin respuesta"].includes(m.estado))
    .filter((m) => esHoyOVencido(m.fechaProgramada))
    .sort((a, b) => new Date(a.fechaProgramada) - new Date(b.fechaProgramada))
    .slice(0, 6);

  const oportunidadesMayorValor = [...activos]
    .sort((a, b) => Number(b.valorEstimado || 0) - Number(a.valorEstimado || 0))
    .slice(0, 5);

  const montoPipeline = activos.reduce((acc, p) => acc + Number(p.valorEstimado || 0), 0);
  const montoPropuestas = propuestas
    .filter((p) => p.estado === "Enviada")
    .reduce((acc, p) => acc + Number(p.valorImplementacion || 0), 0);

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">Inicio CRM</p>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">Resumen comercial del dia</h2>
            <p className="text-sm text-slate-500 mt-1">
              Prioridades, seguimientos y oportunidades para trabajar primero.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onIrA("pipeline")}
              className="min-h-10 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Ver pipeline
            </button>
            <button
              type="button"
              onClick={() => onIrA("propuestas")}
              className="min-h-10 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Ver propuestas
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MiniCard
          icon={Target}
          label="Pipeline activo"
          valor={formatoCLP(montoPipeline)}
          detalle={`${activos.length} oportunidades`}
          variante="dark"
        />
        <MiniCard
          icon={CalendarClock}
          label="Seguimientos vencidos"
          valor={seguimientosVencidos.length}
          detalle="accion hoy"
        />
        <MiniCard
          icon={Megaphone}
          label="Mensajes por preparar"
          valor={mensajesParaHoy.length}
          detalle="campanas"
        />
        <MiniCard
          icon={FileText}
          label="Propuestas enviadas"
          valor={formatoCLP(montoPropuestas)}
          detalle="pendiente decision"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ListaSimple
          titulo="Mensajes para preparar hoy"
          vacio="No hay mensajes de campana para preparar hoy."
          items={mensajesParaHoy}
          accion={
            <button
              type="button"
              onClick={() => onIrA("campanas")}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              Campanas <ArrowRight size={13} />
            </button>
          }
          renderItem={(mensaje) => {
            const prospecto = prospectos.find((p) => p.id === mensaje.prospectoId);
            return (
              <div key={mensaje.id} className="border border-blue-100 bg-blue-50 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {prospecto?.empresa || "Prospecto no encontrado"}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {mensaje.canal} · {new Date(mensaje.fechaProgramada).toLocaleString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{mensaje.mensaje}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onIrA("campanas")}
                    className="shrink-0 px-3 py-1.5 rounded-md border border-blue-200 bg-white text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Preparar
                  </button>
                </div>
              </div>
            );
          }}
        />

        <ListaSimple
          titulo="Prospectos prioritarios"
          vacio="No hay prospectos activos para priorizar."
          items={prospectosPrioritarios}
          accion={
            <button
              type="button"
              onClick={() => onIrA("pipeline")}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              Pipeline <ArrowRight size={13} />
            </button>
          }
          renderItem={(prospecto) => (
            <div key={prospecto.id} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{prospecto.empresa}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {prospecto.estado} · Indice {Number(prospecto.indiceTactika || 0)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onAbrirProspecto(prospecto)}
                  className="shrink-0 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Ver ficha
                </button>
              </div>
            </div>
          )}
        />

        <ListaSimple
          titulo="Seguimientos vencidos o para hoy"
          vacio="No hay seguimientos vencidos para hoy."
          items={seguimientosVencidos}
          accion={
            <button
              type="button"
              onClick={() => onIrA("tareas")}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              Tareas <ArrowRight size={13} />
            </button>
          }
          renderItem={(prospecto) => (
            <div key={prospecto.id} className="border border-amber-200 bg-amber-50 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{prospecto.empresa}</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Seguimiento: {prospecto.fechaProximoContacto}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRegistrarInteraccion(prospecto)}
                  className="shrink-0 px-3 py-1.5 rounded-md border border-amber-200 bg-white text-xs font-semibold text-amber-700 hover:bg-amber-100 flex items-center gap-1"
                >
                  <MessageSquareText size={14} />
                  Registrar
                </button>
              </div>
            </div>
          )}
        />

        <ListaSimple
          titulo="Propuestas pendientes"
          vacio="No hay propuestas enviadas con seguimiento pendiente."
          items={propuestasPendientes}
          accion={
            <button
              type="button"
              onClick={() => onIrA("propuestas")}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              Propuestas <ArrowRight size={13} />
            </button>
          }
          renderItem={(propuesta) => {
            const prospecto = prospectos.find((p) => p.id === propuesta.prospectoId);
            return (
              <div key={propuesta.id} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {prospecto?.empresa || "Prospecto no encontrado"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {propuesta.plan} · {formatoCLP(propuesta.valorImplementacion)}
                    </p>
                  </div>
                  {prospecto && (
                    <button
                      type="button"
                      onClick={() => onRegistrarInteraccion(prospecto)}
                      className="shrink-0 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Seguimiento
                    </button>
                  )}
                </div>
              </div>
            );
          }}
        />

        <ListaSimple
          titulo="Oportunidades de mayor valor"
          vacio="No hay oportunidades con valor estimado."
          items={oportunidadesMayorValor.filter((p) => Number(p.valorEstimado || 0) > 0)}
          renderItem={(prospecto) => (
            <div key={prospecto.id} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{prospecto.empresa}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {prospecto.estado} · {formatoCLP(prospecto.valorEstimado)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onCrearPropuesta(prospecto)}
                  className="shrink-0 px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Propuesta
                </button>
              </div>
            </div>
          )}
        />

        <ListaSimple
          titulo="Alertas comerciales"
          vacio="No hay alertas comerciales pendientes."
          items={propuestasPendientes}
          accion={
            <button
              type="button"
              onClick={() => onIrA("propuestas")}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              Revisar <ArrowRight size={13} />
            </button>
          }
          renderItem={(propuesta) => {
            const prospecto = prospectos.find((p) => p.id === propuesta.prospectoId);
            return (
              <div key={`alerta-${propuesta.id}`} className="border border-red-100 bg-red-50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      Propuesta sin respuesta
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      {prospecto?.empresa || "Prospecto no encontrado"} · 3 dias o mas
                    </p>
                  </div>
                </div>
              </div>
            );
          }}
        />
      </section>
    </div>
  );
}
