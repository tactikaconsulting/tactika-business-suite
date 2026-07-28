import { CalendarDays, CheckCircle2, Clock, PhoneCall } from "lucide-react";

function inicioDia(fecha) {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sumarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

function diasDiferencia(fecha) {
  const hoy = inicioDia(new Date());
  const objetivo = inicioDia(`${fecha}T00:00:00`);
  return Math.round((objetivo - hoy) / (1000 * 60 * 60 * 24));
}

function clasificar(prospecto) {
  if (!prospecto.fechaProximoContacto) return null;
  if (prospecto.estado === "Cliente" || prospecto.estado === "Perdido") return null;

  const dias = diasDiferencia(prospecto.fechaProximoContacto);

  if (dias < 0) return "atrasadas";
  if (dias === 0) return "hoy";
  if (dias <= 7) return "semana";
  return null;
}

function etiquetaFecha(fecha) {
  const dias = diasDiferencia(fecha);
  if (dias < 0) return `${Math.abs(dias)} dia${Math.abs(dias) === 1 ? "" : "s"} atrasado`;
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Manana";
  return `En ${dias} dias`;
}

function TareaCard({ prospecto, onEditar, onReprogramar }) {
  const tipo = clasificar(prospecto);
  const estilos = {
    atrasadas: "border-red-200 bg-red-50",
    hoy: "border-amber-200 bg-amber-50",
    semana: "border-blue-200 bg-blue-50",
  };

  return (
    <div className={`border rounded-lg p-3 ${estilos[tipo] || "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{prospecto.empresa}</p>
          <p className="text-xs text-slate-500 mt-1">
            {prospecto.contactoNombre || "Sin contacto"} · {prospecto.estado}
          </p>
        </div>
        <span className="text-xs font-mono text-slate-600 whitespace-nowrap">
          {etiquetaFecha(prospecto.fechaProximoContacto)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEditar(prospecto)}
          className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onReprogramar(prospecto, sumarDias(new Date(), 1))}
          className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Manana
        </button>
        <button
          type="button"
          onClick={() => onReprogramar(prospecto, sumarDias(new Date(), 7))}
          className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          +7 dias
        </button>
      </div>
    </div>
  );
}

export default function TareasRecordatorios({ prospectos, onEditar, onReprogramar }) {
  const grupos = {
    atrasadas: prospectos.filter((p) => clasificar(p) === "atrasadas"),
    hoy: prospectos.filter((p) => clasificar(p) === "hoy"),
    semana: prospectos.filter((p) => clasificar(p) === "semana"),
  };

  const total = grupos.atrasadas.length + grupos.hoy.length + grupos.semana.length;

  if (total === 0) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-green-600" />
          <h3 className="text-sm font-bold text-slate-700">Tareas y recordatorios</h3>
        </div>
        <p className="text-sm text-slate-400 mt-2">
          No hay seguimientos vencidos ni programados para esta semana.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-slate-700" />
          <h3 className="text-sm font-bold text-slate-700">Tareas y recordatorios</h3>
        </div>
        <span className="text-xs font-medium text-slate-400">{total} pendientes</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-red-600" />
            <h4 className="text-xs font-bold uppercase text-red-700">
              Atrasadas ({grupos.atrasadas.length})
            </h4>
          </div>
          <div className="space-y-3">
            {grupos.atrasadas.length === 0 ? (
              <p className="text-xs text-slate-300">Sin atrasos.</p>
            ) : (
              grupos.atrasadas.map((p) => (
                <TareaCard key={p.id} prospecto={p} onEditar={onEditar} onReprogramar={onReprogramar} />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <PhoneCall size={15} className="text-amber-600" />
            <h4 className="text-xs font-bold uppercase text-amber-700">
              Hoy ({grupos.hoy.length})
            </h4>
          </div>
          <div className="space-y-3">
            {grupos.hoy.length === 0 ? (
              <p className="text-xs text-slate-300">Nada para hoy.</p>
            ) : (
              grupos.hoy.map((p) => (
                <TareaCard key={p.id} prospecto={p} onEditar={onEditar} onReprogramar={onReprogramar} />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={15} className="text-blue-600" />
            <h4 className="text-xs font-bold uppercase text-blue-700">
              Esta semana ({grupos.semana.length})
            </h4>
          </div>
          <div className="space-y-3">
            {grupos.semana.length === 0 ? (
              <p className="text-xs text-slate-300">Sin tareas proximas.</p>
            ) : (
              grupos.semana.map((p) => (
                <TareaCard key={p.id} prospecto={p} onEditar={onEditar} onReprogramar={onReprogramar} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
