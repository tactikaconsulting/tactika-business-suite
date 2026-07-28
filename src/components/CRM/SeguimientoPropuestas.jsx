import { CheckCircle2, Download, FileText, MessageSquareText, Send, XCircle } from "lucide-react";

function formatoCLP(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CL");
}

function fechaBase(propuesta) {
  return propuesta.fechaEnvio || propuesta.createdAt?.slice(0, 10) || null;
}

function diasDesde(fecha) {
  if (!fecha) return 0;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const base = new Date(`${fecha}T00:00:00`);
  return Math.floor((hoy - base) / (1000 * 60 * 60 * 24));
}

function resumenPorEstado(propuestas, estado) {
  const filtradas = propuestas.filter((p) => p.estado === estado);
  return {
    cantidad: filtradas.length,
    monto: filtradas.reduce((acc, p) => acc + Number(p.valorImplementacion || 0), 0),
  };
}

function EstadoBadge({ estado }) {
  const estilos = {
    Borrador: "bg-slate-100 text-slate-600",
    Enviada: "bg-blue-100 text-blue-700",
    Aceptada: "bg-green-100 text-green-700",
    Rechazada: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${estilos[estado] || estilos.Borrador}`}>
      {estado}
    </span>
  );
}

export default function SeguimientoPropuestas({
  propuestas,
  prospectos,
  onActualizarEstado,
  onDescargarPDF,
  onRegistrarSeguimiento,
  onAbrirProspecto,
}) {
  const propuestasActivas = propuestas.filter((p) => p.estado !== "Rechazada");
  const enviadasPendientes = propuestas.filter(
    (p) => p.estado === "Enviada" && diasDesde(fechaBase(p)) >= 3
  );

  const resumen = [
    { estado: "Borrador", label: "Borradores", ...resumenPorEstado(propuestas, "Borrador") },
    { estado: "Enviada", label: "Enviadas", ...resumenPorEstado(propuestas, "Enviada") },
    { estado: "Aceptada", label: "Aceptadas", ...resumenPorEstado(propuestas, "Aceptada") },
    { estado: "Rechazada", label: "Rechazadas", ...resumenPorEstado(propuestas, "Rechazada") },
  ];

  if (propuestas.length === 0) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-slate-700" />
          <h3 className="text-sm font-bold text-slate-700">Seguimiento de propuestas</h3>
        </div>
        <p className="text-sm text-slate-400 mt-2">
          Aun no hay propuestas comerciales registradas.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-slate-700" />
          <h3 className="text-sm font-bold text-slate-700">Seguimiento de propuestas</h3>
        </div>
        <span className="text-xs font-medium text-slate-400">
          {propuestasActivas.length} activas · {enviadasPendientes.length} requieren seguimiento
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {resumen.map((item) => (
          <div key={item.estado} className="border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{item.cantidad}</p>
            <p className="text-xs font-mono text-slate-500 mt-1">{formatoCLP(item.monto)}</p>
          </div>
        ))}
      </div>

      {enviadasPendientes.length > 0 && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-900">
            Hay {enviadasPendientes.length} propuesta(s) enviada(s) hace 3 dias o mas sin respuesta.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {propuestas.slice(0, 8).map((propuesta) => {
          const prospecto = prospectos.find((p) => p.id === propuesta.prospectoId);
          const dias = diasDesde(fechaBase(propuesta));

          return (
            <div key={propuesta.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{propuesta.titulo}</p>
                    <EstadoBadge estado={propuesta.estado} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {prospecto?.empresa || "Prospecto no encontrado"} · {propuesta.plan}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    {formatoCLP(propuesta.valorImplementacion)} implementacion ·{" "}
                    {formatoCLP(propuesta.valorMensual)} mensual
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {propuesta.estado === "Enviada"
                      ? `Enviada hace ${dias} dia${dias === 1 ? "" : "s"}`
                      : `Creada el ${propuesta.createdAt?.slice(0, 10) || "-"}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  {prospecto && (
                    <button
                      type="button"
                      onClick={() => onAbrirProspecto(prospecto)}
                      className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Ver ficha
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDescargarPDF(prospecto, propuesta)}
                    disabled={!prospecto}
                    className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Download size={14} />
                    PDF
                  </button>
                  {prospecto && (
                    <button
                      type="button"
                      onClick={() => onRegistrarSeguimiento(prospecto)}
                      className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <MessageSquareText size={14} />
                      Seguimiento
                    </button>
                  )}
                  {propuesta.estado === "Borrador" && (
                    <button
                      type="button"
                      onClick={() => onActualizarEstado(propuesta, "Enviada")}
                      className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 flex items-center gap-1"
                    >
                      <Send size={14} />
                      Enviada
                    </button>
                  )}
                  {propuesta.estado !== "Aceptada" && (
                    <button
                      type="button"
                      onClick={() => onActualizarEstado(propuesta, "Aceptada")}
                      className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-xs font-semibold text-green-700 hover:bg-green-100 flex items-center gap-1"
                    >
                      <CheckCircle2 size={14} />
                      Aceptada
                    </button>
                  )}
                  {propuesta.estado !== "Rechazada" && (
                    <button
                      type="button"
                      onClick={() => onActualizarEstado(propuesta, "Rechazada")}
                      className="px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-xs font-semibold text-red-700 hover:bg-red-100 flex items-center gap-1"
                    >
                      <XCircle size={14} />
                      Rechazada
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
