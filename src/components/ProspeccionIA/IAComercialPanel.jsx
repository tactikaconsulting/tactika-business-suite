import { Bot, SendHorizontal, Sparkles } from "lucide-react";

const preguntasRapidas = [
  "¿A quien contacto hoy?",
  "¿Que empresas parecen tener mayor potencial?",
  "Genera un WhatsApp",
  "Genera un correo",
  "Genera un guion de llamada",
  "Genera una propuesta comercial",
];

export default function IAComercialPanel({
  pregunta,
  respuesta,
  onPreguntaChange,
  onConsultar,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Bot size={19} className="text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">IA Comercial</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Asistente inicial para priorizar contactos, preparar mensajes y ordenar el siguiente
            paso comercial. En esta version responde con reglas del negocio.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {preguntasRapidas.map((texto) => (
          <button
            key={texto}
            type="button"
            onClick={() => {
              onPreguntaChange(texto);
              onConsultar(texto);
            }}
            className="px-3 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-700 transition"
          >
            {texto}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={pregunta}
          onChange={(e) => onPreguntaChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onConsultar(pregunta);
          }}
          placeholder="Preguntale a la IA comercial..."
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
        />
        <button
          type="button"
          onClick={() => onConsultar(pregunta)}
          className="min-h-10 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
          <SendHorizontal size={16} />
          Consultar
        </button>
      </div>

      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-32">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Sparkles size={16} className="text-blue-600" />
          Respuesta sugerida
        </div>
        <p className="text-sm text-slate-600 mt-3 whitespace-pre-line leading-relaxed">
          {respuesta || "Haz una pregunta para recibir una recomendacion comercial."}
        </p>
      </div>
    </section>
  );
}
