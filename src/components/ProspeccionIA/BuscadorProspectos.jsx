import { ExternalLink, Search, Sparkles } from "lucide-react";
import { generarEnlacesBusquedaProspectos } from "../../services/ProspeccionIAService";

const cantidades = ["10", "25", "50", "100"];

export default function BuscadorProspectos({ filtros, onChange, onBuscar, buscando = false }) {
  const enlacesBusqueda = generarEnlacesBusquedaProspectos(filtros);

  function actualizar(campo, valor) {
    onChange({ ...filtros, [campo]: valor });
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase text-blue-600">Motor de prospeccion</p>
          <h2 className="text-xl font-bold text-slate-800 mt-1">Buscador de Prospectos</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Busca empresas reales por rubro y comuna usando Google Places. Tambien puedes abrir
            fuentes publicas para revisar datos antes de guardar en CRM.
          </p>
        </div>

        <button
          type="button"
          onClick={onBuscar}
          disabled={buscando}
          className="min-h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
          <Search size={16} />
          {buscando ? "Buscando" : "Buscar empresas"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mt-5">
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Rubro</span>
          <input
            value={filtros.rubro}
            onChange={(e) => actualizar("rubro", e.target.value)}
            placeholder="Ej: Constructora"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </label>

        <label className="space-y-1.5 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Comunas</span>
          <input
            value={filtros.comunas}
            onChange={(e) => actualizar("comunas", e.target.value)}
            placeholder="Buin, Paine, San Bernardo"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Region</span>
          <input
            value={filtros.region}
            onChange={(e) => actualizar("region", e.target.value)}
            placeholder="Region Metropolitana"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Trabajadores max.</span>
          <input
            type="number"
            value={filtros.maxTrabajadores}
            onChange={(e) => actualizar("maxTrabajadores", e.target.value)}
            placeholder="50"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Cantidad</span>
          <select
            value={filtros.cantidad || "10"}
            onChange={(e) => actualizar("cantidad", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          >
            {cantidades.map((cantidad) => (
              <option key={cantidad} value={cantidad}>
                {cantidad} prospectos
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 md:col-span-2 xl:col-span-5">
          <span className="text-sm font-semibold text-slate-700">Palabras clave</span>
          <input
            value={filtros.palabrasClave}
            onChange={(e) => actualizar("palabrasClave", e.target.value)}
            placeholder="inventario, obras, propuestas, agenda, ventas"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </label>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2 text-sm text-blue-900">
        <Sparkles size={16} className="mt-0.5 shrink-0" />
        <p>
          Modo interno: busca negocios reales, elimina duplicados y guarda el historial en
          Supabase antes de convertirlos en prospectos del CRM. No envia mensajes automaticamente.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {enlacesBusqueda.map((enlace) => (
          <a
            key={enlace.label}
            href={enlace.url}
            target="_blank"
            rel="noreferrer"
            className="border border-slate-200 rounded-xl p-3 bg-slate-50 hover:bg-white hover:border-blue-200 transition group"
          >
            <span className="flex items-center justify-between gap-2 text-sm font-bold text-slate-800">
              {enlace.label}
              <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600" />
            </span>
            <span className="block text-xs text-slate-500 mt-1 leading-relaxed">
              {enlace.descripcion}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
