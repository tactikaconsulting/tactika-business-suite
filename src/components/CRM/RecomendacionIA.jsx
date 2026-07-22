import { Sparkles } from "lucide-react";

/**
 * Espacio reservado en la UI para la futura recomendación de IA.
 * Por ahora solo muestra un estado "próximamente" — no llama a ningún servicio.
 */
export default function RecomendacionIA({ prospecto }) {
  const tieneRecomendacion = !!prospecto?.recomendacionIA?.disponible;

  if (!tieneRecomendacion) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Recomendación IA</p>
          <p className="text-xs text-slate-400">Próximamente: sugerencias automáticas de módulo, asesoría y probabilidad de cierre.</p>
        </div>
      </div>
    );
  }

  // Cuando la IA esté implementada, aquí se muestra la recomendación real.
  const r = prospecto.recomendacionIA;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-blue-600" />
        <p className="text-sm font-bold text-blue-700">Recomendación IA</p>
      </div>
      <p className="text-sm text-slate-700 mb-1"><strong>Módulo sugerido:</strong> {r.moduloRecomendado}</p>
      <p className="text-sm text-slate-700 mb-1"><strong>Tipo de asesoría:</strong> {r.tipoAsesoria}</p>
      <p className="text-sm text-slate-700"><strong>Probabilidad de cierre estimada:</strong> {r.probabilidadCierreIA}%</p>
    </div>
  );
}