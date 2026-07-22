import { calcularMetricasComerciales } from "../../services/metricasComerciales";

function formatoCLP(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CL");
}

export default function DashboardComercial({ prospectos, historial }) {
  const m = calcularMetricasComerciales(prospectos, historial);

  const cards = [
    { label: "Prospectos", valor: m.cantidadProspectos },
    { label: "Diagnósticos agendados", valor: m.diagnosticosAgendados },
    { label: "Diagnósticos realizados", valor: m.diagnosticosRealizados },
    { label: "Propuestas enviadas", valor: m.propuestasEnviadas },
    { label: "Clientes ganados", valor: m.clientesGanados, color: "text-green-600" },
    { label: "Clientes perdidos", valor: m.clientesPerdidos, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Cards principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-2xl font-bold font-mono ${c.color || "text-slate-800"}`}>{c.valor}</p>
          </div>
        ))}
      </div>

      {/* Monto y conversión */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white rounded-xl p-5">
          <p className="text-xs text-slate-400 mb-1">Monto potencial (pipeline activo)</p>
          <p className="text-2xl font-bold font-mono">{formatoCLP(m.montoPotencial)}</p>
        </div>
        <div className="bg-slate-900 text-white rounded-xl p-5">
          <p className="text-xs text-slate-400 mb-1">Monto vendido</p>
          <p className="text-2xl font-bold font-mono text-green-400">{formatoCLP(m.montoVendido)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-xs text-slate-500 mb-1">Conversión</p>
          <p className="text-2xl font-bold font-mono text-blue-600">{m.conversion}%</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-xs text-slate-500 mb-1">Tiempo promedio de cierre</p>
          <p className="text-2xl font-bold font-mono text-slate-800">
            {m.tiempoPromedioCierre === null ? "—" : `${m.tiempoPromedioCierre} días`}
          </p>
        </div>
      </div>

      {/* Agrupaciones */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Prospectos por comuna</h3>
          {m.porComuna.length === 0 ? (
            <p className="text-sm text-slate-400">Sin datos todavía.</p>
          ) : (
            <div className="space-y-3">
              {m.porComuna.map((c) => (
                <div key={c.nombre}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{c.nombre}</span>
                    <span className="font-mono">{c.cantidad}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(c.cantidad / m.cantidadProspectos) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Prospectos por rubro</h3>
          {m.porRubro.length === 0 ? (
            <p className="text-sm text-slate-400">Sin datos todavía.</p>
          ) : (
            <div className="space-y-3">
              {m.porRubro.map((r) => (
                <div key={r.nombre}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{r.nombre}</span>
                    <span className="font-mono">{r.cantidad}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(r.cantidad / m.cantidadProspectos) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ranking de oportunidades */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Ranking de oportunidades (pipeline activo)</h3>
        {m.ranking.length === 0 ? (
          <p className="text-sm text-slate-400">Sin prospectos activos con valor estimado todavía.</p>
        ) : (
          <div className="space-y-2">
            {m.ranking.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between border-b last:border-0 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-mono flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.empresa}</p>
                    <p className="text-xs text-slate-400">{p.estado} · {p.probabilidadCierre || 0}% probabilidad</p>
                  </div>
                </div>
                <span className="font-mono text-sm text-slate-700">{formatoCLP(p.valorEstimado)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}