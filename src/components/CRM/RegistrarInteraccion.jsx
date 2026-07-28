import { useState } from "react";
import { Mail, MessageCircle, NotebookPen, PhoneCall, Users, X } from "lucide-react";

const tipos = [
  { id: "llamada", label: "Llamada", icon: PhoneCall },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "correo", label: "Correo", icon: Mail },
  { id: "reunion", label: "Reunion", icon: Users },
  { id: "nota", label: "Nota interna", icon: NotebookPen },
];

const titulosPorTipo = {
  llamada: "Llamada comercial",
  whatsapp: "Mensaje por WhatsApp",
  correo: "Correo enviado",
  reunion: "Reunion comercial",
  nota: "Nota interna",
};

const sugerenciasPorTipo = {
  llamada: { dias: 1, accion: "Realizar seguimiento telefonico" },
  whatsapp: { dias: 2, accion: "Revisar respuesta por WhatsApp" },
  correo: { dias: 3, accion: "Hacer seguimiento del correo enviado" },
  reunion: { dias: 2, accion: "Enviar resumen y siguiente paso" },
  nota: { dias: 7, accion: "Revisar avance del prospecto" },
};

function sumarDias(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

export default function RegistrarInteraccion({ prospectos, onGuardar, onCerrar }) {
  const [prospectoId, setProspectoId] = useState(prospectos[0]?.id || "");
  const [tipo, setTipo] = useState("llamada");
  const [titulo, setTitulo] = useState(titulosPorTipo.llamada);
  const [resultado, setResultado] = useState("");
  const [detalle, setDetalle] = useState("");
  const [fechaInteraccion, setFechaInteraccion] = useState(new Date().toISOString().slice(0, 16));
  const [actualizarSeguimiento, setActualizarSeguimiento] = useState(true);
  const [proximoPaso, setProximoPaso] = useState(sugerenciasPorTipo.llamada.accion);
  const [fechaProximoContacto, setFechaProximoContacto] = useState(
    sumarDias(sugerenciasPorTipo.llamada.dias)
  );

  const prospecto = prospectos.find((p) => p.id === prospectoId) || prospectos[0];

  function cambiarTipo(nuevoTipo) {
    setTipo(nuevoTipo);
    setTitulo(titulosPorTipo[nuevoTipo]);
    setProximoPaso(sugerenciasPorTipo[nuevoTipo].accion);
    setFechaProximoContacto(sumarDias(sugerenciasPorTipo[nuevoTipo].dias));
  }

  function guardar(e) {
    e.preventDefault();
    if (!prospecto) return;

    onGuardar({
      prospectoId: prospecto.id,
      tipo,
      titulo,
      resultado,
      detalle,
      fechaInteraccion: new Date(fechaInteraccion).toISOString(),
      proximoSeguimiento: actualizarSeguimiento
        ? {
            fechaProximoContacto,
            proximoPaso,
          }
        : null,
    });
  }

  if (!prospecto) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Registrar interaccion</h2>
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
      <form onSubmit={guardar} className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">CRM Comercial</p>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">Registrar interaccion</h2>
            <p className="text-sm text-slate-500 mt-1">
              Guarda llamadas, correos, reuniones, WhatsApp o notas internas del prospecto.
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

          <div>
            <span className="text-sm font-semibold text-slate-700">Tipo de interaccion</span>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
              {tipos.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => cambiarTipo(item.id)}
                    className={`border rounded-lg p-3 text-sm font-medium flex flex-col items-center gap-2 ${
                      tipo === item.id
                        ? "border-blue-300 bg-blue-50 text-blue-800"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

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
              <span className="text-sm font-semibold text-slate-700">Fecha y hora</span>
              <input
                type="datetime-local"
                value={fechaInteraccion}
                onChange={(e) => setFechaInteraccion(e.target.value)}
                required
                className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Resultado</span>
            <input
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
              placeholder="Ej: interesado, no contesto, pidio propuesta, agendar reunion..."
              className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Detalle</span>
            <textarea
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              rows={5}
              placeholder="Registra el contexto de la conversacion, acuerdos, objeciones o proximo paso."
              className="mt-2 w-full border border-slate-200 rounded-lg p-3 text-sm leading-relaxed"
            />
          </label>

          <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <input
                type="checkbox"
                checked={actualizarSeguimiento}
                onChange={(e) => setActualizarSeguimiento(e.target.checked)}
              />
              Actualizar proximo seguimiento del prospecto
            </label>

            {actualizarSeguimiento && (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Proximo paso sugerido</span>
                  <input
                    value={proximoPaso}
                    onChange={(e) => setProximoPaso(e.target.value)}
                    className="mt-2 w-full border border-blue-200 rounded-lg p-2.5 text-sm bg-white"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Fecha seguimiento</span>
                  <input
                    type="date"
                    value={fechaProximoContacto}
                    onChange={(e) => setFechaProximoContacto(e.target.value)}
                    className="mt-2 w-full border border-blue-200 rounded-lg p-2.5 text-sm bg-white"
                  />
                </label>
              </div>
            )}
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
              Guardar interaccion
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
