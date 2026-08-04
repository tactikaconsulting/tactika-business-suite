import { ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProspectosGuardadosPanel({ prospectos }) {
  const desdeProspeccion = prospectos.filter((p) => p.origen === "Prospeccion IA");

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-slate-500" />
            <h2 className="text-lg font-bold text-slate-800">Prospectos Guardados</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Empresas que ya fueron enviadas desde Prospeccion IA al CRM.
          </p>
        </div>

        <Link
          to="/crm"
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition inline-flex items-center gap-2"
        >
          Ver CRM
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
        {desdeProspeccion.length === 0 ? (
          <div className="text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg p-4">
            Aun no hay prospectos guardados desde este modulo.
          </div>
        ) : (
          desdeProspeccion.slice(0, 8).map((prospecto) => (
            <div
              key={prospecto.id}
              className="border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-800 truncate">{prospecto.empresa}</p>
                <p className="text-xs text-slate-500 truncate">
                  {prospecto.giro || "Sin rubro"} · {prospecto.comuna || "Sin comuna"}
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold bg-blue-50 text-blue-700 rounded-full px-2.5 py-1">
                Indice {prospecto.indiceTactika || 0}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
