import { useState } from "react";
import { FileText, X } from "lucide-react";

const planes = [
  "Diagnostico Empresarial",
  "Sistema Tactika Base",
  "Sistema Tactika Profesional",
  "Sistema Tactika Enterprise",
  "Proyecto a medida",
];

function numero(valor) {
  const limpio = String(valor || "").replace(/\D/g, "");
  return limpio ? Number(limpio) : 0;
}

export default function CrearPropuestaComercial({
  prospectos,
  prospectoInicialId,
  onGuardar,
  onCerrar,
}) {
  const [prospectoId, setProspectoId] = useState(prospectoInicialId || prospectos[0]?.id || "");
  const [titulo, setTitulo] = useState("Propuesta comercial Tactika");
  const [plan, setPlan] = useState("Sistema Tactika Profesional");
  const [valorImplementacion, setValorImplementacion] = useState("490000");
  const [valorMensual, setValorMensual] = useState("89900");
  const [alcance, setAlcance] = useState(
    "Diagnostico inicial, configuracion del sistema, carga base de informacion, capacitacion y puesta en marcha."
  );
  const [condiciones, setCondiciones] = useState(
    "Valores referenciales sujetos al alcance final validado con el cliente."
  );
  const [estado, setEstado] = useState("Borrador");
  const [fechaEnvio, setFechaEnvio] = useState(new Date().toISOString().slice(0, 10));

  const prospecto = prospectos.find((p) => p.id === prospectoId) || prospectos[0];

  function guardar(e) {
    e.preventDefault();
    if (!prospecto) return;

    onGuardar({
      prospectoId: prospecto.id,
      titulo,
      plan,
      valorImplementacion: numero(valorImplementacion),
      valorMensual: numero(valorMensual),
      alcance,
      condiciones,
      estado,
      fechaEnvio: estado === "Enviada" ? fechaEnvio : null,
    });
  }

  if (!prospecto) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Crear propuesta</h2>
              <p className="text-sm text-slate-500 mt-1">No hay prospectos disponibles.</p>
            </div>
            <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <form onSubmit={guardar} className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">CRM Comercial</p>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">Crear propuesta comercial</h2>
            <p className="text-sm text-slate-500 mt-1">
              Registra la oferta que se presentara al prospecto y deja trazabilidad comercial.
            </p>
          </div>
          <button type="button" onClick={onCerrar} className="text-slate-400 hover:text-slate-600">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Prospecto</span>
            <select
              value={prospecto.id}
              onChange={(e) => setProspectoId(e.target.value)}
              className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
            >
              {prospectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.empresa}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Titulo</span>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Plan sugerido</span>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
              >
                {planes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Implementacion</span>
              <input
                inputMode="numeric"
                value={valorImplementacion}
                onChange={(e) => setValorImplementacion(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Mensualidad</span>
              <input
                inputMode="numeric"
                value={valorMensual}
                onChange={(e) => setValorMensual(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Estado</span>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
              >
                <option value="Borrador">Borrador</option>
                <option value="Enviada">Enviada</option>
                <option value="Aceptada">Aceptada</option>
                <option value="Rechazada">Rechazada</option>
              </select>
            </label>
          </div>

          {estado === "Enviada" && (
            <label className="block max-w-xs">
              <span className="text-sm font-semibold text-slate-700">Fecha de envio</span>
              <input
                type="date"
                value={fechaEnvio}
                onChange={(e) => setFechaEnvio(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Alcance</span>
            <textarea
              value={alcance}
              onChange={(e) => setAlcance(e.target.value)}
              rows={5}
              required
              className="mt-2 w-full border border-slate-200 rounded-lg p-3 text-sm leading-relaxed"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Condiciones</span>
            <textarea
              value={condiciones}
              onChange={(e) => setCondiciones(e.target.value)}
              rows={3}
              className="mt-2 w-full border border-slate-200 rounded-lg p-3 text-sm leading-relaxed"
            />
          </label>

          <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <FileText size={18} className="text-blue-700 mt-0.5" />
            <p className="text-sm text-blue-900">
              Esta version guarda la propuesta en el CRM. La generacion de PDF formal puede quedar
              como el siguiente paso.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900"
            >
              Guardar propuesta
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
