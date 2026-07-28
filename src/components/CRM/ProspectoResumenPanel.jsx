import {
  CalendarClock,
  Edit3,
  FileText,
  History,
  Mail,
  MessageSquareText,
  Phone,
  X,
} from "lucide-react";
import IndiceTactikaBadge from "./IndiceTactikaBadge";

function formatoCLP(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CL");
}

function dato(valor, fallback = "Sin registrar") {
  return valor || fallback;
}

export default function ProspectoResumenPanel({
  prospecto,
  interacciones = [],
  onCerrar,
  onEditar,
  onVerHistorial,
  onRegistrarInteraccion,
  onPlantillas,
  onReprogramar,
}) {
  const ultimasInteracciones = interacciones
    .filter((i) => i.prospectoId === prospecto.id)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <aside className="bg-white w-full max-w-xl h-full shadow-xl overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">Ficha del prospecto</p>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">{prospecto.empresa}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                {prospecto.estado}
              </span>
              <IndiceTactikaBadge puntaje={prospecto.indiceTactika} />
            </div>
          </div>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500">Valor estimado</p>
              <p className="text-lg font-bold font-mono text-slate-800 mt-1">
                {formatoCLP(prospecto.valorEstimado)}
              </p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500">Probabilidad</p>
              <p className="text-lg font-bold font-mono text-slate-800 mt-1">
                {Number(prospecto.probabilidadCierre || 0)}%
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Contacto</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <Phone size={15} className="text-slate-400" />
                {dato(prospecto.telefono)}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="text-slate-400" />
                {dato(prospecto.correo)}
              </p>
              <p>{dato(prospecto.contactoNombre, "Sin contacto principal")}</p>
              <p className="text-slate-400">{dato(prospecto.comuna, "Sin comuna")} · {dato(prospecto.giro, "Sin rubro")}</p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Proximo paso</h3>
            <p className="text-sm text-slate-600">
              {prospecto.fechaProximoContacto
                ? `Seguimiento programado para ${prospecto.fechaProximoContacto}`
                : "Sin seguimiento programado."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => onReprogramar(prospecto, new Date(Date.now() + 86400000).toISOString().slice(0, 10))}
                className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Manana
              </button>
              <button
                onClick={() => onReprogramar(prospecto, new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10))}
                className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                +7 dias
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onRegistrarInteraccion(prospecto)}
              className="border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <MessageSquareText size={16} />
              Interaccion
            </button>
            <button
              onClick={() => onPlantillas(prospecto)}
              className="border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <FileText size={16} />
              Plantillas
            </button>
            <button
              onClick={() => onVerHistorial(prospecto)}
              className="border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <History size={16} />
              Historial
            </button>
            <button
              onClick={() => onEditar(prospecto)}
              className="border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Edit3 size={16} />
              Editar
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock size={16} className="text-slate-500" />
              <h3 className="text-sm font-bold text-slate-700">Ultimas interacciones</h3>
            </div>
            {ultimasInteracciones.length === 0 ? (
              <p className="text-sm text-slate-400">Sin interacciones registradas.</p>
            ) : (
              <div className="space-y-3">
                {ultimasInteracciones.map((i) => (
                  <div key={i.id} className="border-b last:border-0 pb-3 last:pb-0">
                    <p className="text-sm font-semibold text-slate-800">{i.titulo}</p>
                    <p className="text-xs text-slate-400 mt-1">{i.tipo} · {new Date(i.fechaInteraccion).toLocaleDateString("es-CL")}</p>
                    {i.resultado && <p className="text-sm text-slate-500 mt-1">{i.resultado}</p>}
                  </div>
                ))}
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
