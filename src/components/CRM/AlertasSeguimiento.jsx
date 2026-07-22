import { AlertTriangle } from "lucide-react";

export default function AlertasSeguimiento({ prospectos, onEditar }) {
  const atrasados = prospectos.filter((p) => {
    if (!p.fechaProximoContacto) return false;
    if (p.estado === "Cliente" || p.estado === "Perdido") return false;
    return new Date(p.fechaProximoContacto) < new Date();
  });

  if (atrasados.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="text-red-600" size={18} />
        <h3 className="text-sm font-bold text-red-700">
          {atrasados.length} prospecto{atrasados.length > 1 ? "s" : ""} con seguimiento atrasado
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {atrasados.map((p) => {
          const dias = Math.floor((new Date() - new Date(p.fechaProximoContacto)) / (1000 * 60 * 60 * 24));
          return (
            <button
              key={p.id}
              onClick={() => onEditar(p)}
              className="flex items-center gap-2 bg-white border border-red-200 rounded-lg px-3 py-2 text-xs hover:bg-red-100 transition"
            >
              <span className="font-semibold text-slate-800">{p.empresa}</span>
              <span className="text-red-600 font-mono">{dias}d atrasado</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}