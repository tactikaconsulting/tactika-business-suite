import { Activity, CalendarClock, CheckCircle2, DollarSign, Target, TrendingUp } from "lucide-react";
import { calcularMetricasComerciales } from "../../services/MetricasComerciales";

function formatoCLP(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CL");
}

function KpiCard({ icon: Icon, label, valor, detalle, variante = "default" }) {
  const estilos =
    variante === "dark"
      ? "bg-slate-900 text-white border-slate-900"
      : "bg-white text-slate-800 border-slate-200";

  const icono =
    variante === "dark"
      ? "bg-white/10 text-white"
      : "bg-slate-100 text-slate-600";

  return (
    <div className={`rounded-lg border p-4 min-h-[116px] ${estilos}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${icono}`}>
          <Icon size={18} />
        </div>
        {detalle && (
          <span className={`text-xs font-medium ${variante === "dark" ? "text-slate-300" : "text-slate-400"}`}>
            {detalle}
          </span>
        )}
      </div>

      <p className={`mt-4 text-xs font-medium ${variante === "dark" ? "text-slate-300" : "text-slate-500"}`}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold font-mono leading-tight">{valor}</p>
    </div>
  );
}

export default function KpisComerciales({ prospectos, historial }) {
  const metricas = calcularMetricasComerciales(prospectos, historial);
  const oportunidadesActivas = prospectos.filter(
    (p) => p.estado !== "Cliente" && p.estado !== "Perdido"
  ).length;

  const seguimientosPendientes = prospectos.filter((p) => {
    if (!p.fechaProximoContacto || p.estado === "Cliente" || p.estado === "Perdido") return false;
    return new Date(p.fechaProximoContacto) <= new Date();
  }).length;

  const kpis = [
    {
      label: "Pipeline activo",
      valor: formatoCLP(metricas.montoPotencial),
      detalle: `${oportunidadesActivas} oportunidades`,
      icon: DollarSign,
      variante: "dark",
    },
    {
      label: "Prospectos totales",
      valor: metricas.cantidadProspectos,
      detalle: "base comercial",
      icon: Target,
    },
    {
      label: "Propuestas enviadas",
      valor: metricas.propuestasEnviadas,
      detalle: "avance comercial",
      icon: Activity,
    },
    {
      label: "Clientes ganados",
      valor: metricas.clientesGanados,
      detalle: formatoCLP(metricas.montoVendido),
      icon: CheckCircle2,
    },
    {
      label: "Conversión",
      valor: `${metricas.conversion}%`,
      detalle: "ganados / total",
      icon: TrendingUp,
    },
    {
      label: "Seguimientos vencidos",
      valor: seguimientosPendientes,
      detalle: "requieren acción",
      icon: CalendarClock,
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </section>
  );
}
