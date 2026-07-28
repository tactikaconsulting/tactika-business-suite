import { CalendarClock, CheckCircle2, Circle, Clock, X } from "lucide-react";

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(fecha));
}

function estadoLabel(valor) {
  return valor || "Sin estado";
}

export default function ProspectoHistorialPanel({ prospecto, historial, onCerrar }) {
  const eventosEstado = historial
    .filter((h) => h.prospectoId === prospecto.id)
    .map((h) => ({
      id: `${h.fecha}-${h.estadoNuevo}`,
      tipo: "Cambio de estado",
      titulo: `${estadoLabel(h.estadoAnterior)} -> ${estadoLabel(h.estadoNuevo)}`,
      detalle: "Movimiento registrado en el pipeline comercial.",
      fecha: h.fecha,
    }));

  const eventos = [
    {
      id: "created",
      tipo: "Creacion",
      titulo: "Prospecto creado",
      detalle: "Ingreso inicial al CRM Comercial.",
      fecha: prospecto.createdAt,
    },
    ...eventosEstado,
  ].sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <aside className="bg-white w-full max-w-xl h-full shadow-xl overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">Historial comercial</p>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">{prospecto.empresa}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {prospecto.contactoNombre || "Sin contacto"} · {prospecto.estado || "Sin estado"}
            </p>
          </div>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500">Proximo contacto</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                {prospecto.fechaProximoContacto || "Sin programar"}
              </p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500">Valor estimado</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                ${Number(prospecto.valorEstimado || 0).toLocaleString("es-CL")}
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock size={18} className="text-slate-600" />
              <h3 className="text-sm font-bold text-slate-700">Linea de tiempo</h3>
            </div>

            {eventos.length === 0 ? (
              <p className="text-sm text-slate-400">Este prospecto todavia no tiene historial.</p>
            ) : (
              <div className="space-y-4">
                {eventos.map((evento, index) => {
                  const esPrimero = index === 0;
                  const Icon = esPrimero ? CheckCircle2 : Circle;

                  return (
                    <div key={evento.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            esPrimero ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        {index < eventos.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-2" />}
                      </div>

                      <div className="pb-4 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800">{evento.titulo}</p>
                          <span className="text-xs text-slate-400 whitespace-nowrap">{evento.tipo}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{evento.detalle}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                          <Clock size={13} />
                          {formatearFecha(evento.fecha)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-slate-700 mb-2">Observaciones</h3>
            <p className="text-sm text-slate-500 whitespace-pre-wrap">
              {prospecto.observaciones || "Sin observaciones registradas."}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
