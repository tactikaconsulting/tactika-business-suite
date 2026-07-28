import { useMemo, useState } from "react";
import { Copy, Mail, MessageSquareText, Phone, Send, X } from "lucide-react";
import Swal from "sweetalert2";

const plantillas = [
  {
    id: "primer-contacto",
    nombre: "Primer contacto",
    descripcion: "Mensaje breve para iniciar una conversacion sin vender de inmediato.",
    generar: (p) =>
      `Hola${p.contactoNombre ? ` ${p.contactoNombre}` : ""}, soy Claudio Urra de Tactika Consulting. Estamos conversando con empresas${p.giro ? ` del rubro ${p.giro}` : ""} para conocer como estan gestionando sus clientes, procesos y seguimiento comercial. Me gustaria coordinar una conversacion breve de 15 minutos para entender como trabajan hoy y ver si podemos aportar valor mediante un diagnostico empresarial.`,
  },
  {
    id: "seguimiento-llamada",
    nombre: "Seguimiento despues de llamada",
    descripcion: "Para agradecer una conversacion y dejar un siguiente paso claro.",
    generar: (p) =>
      `Hola${p.contactoNombre ? ` ${p.contactoNombre}` : ""}, muchas gracias por la conversacion. Segun lo que revisamos, creo que en ${p.empresa} podriamos aportar valor ordenando el seguimiento comercial, los procesos internos y la informacion clave para tomar decisiones. Te propongo coordinar el diagnostico empresarial Tactika para levantar prioridades y definir un plan de accion concreto.`,
  },
  {
    id: "envio-propuesta",
    nombre: "Envio de propuesta",
    descripcion: "Para acompanar una propuesta comercial ya enviada.",
    generar: (p) =>
      `Hola${p.contactoNombre ? ` ${p.contactoNombre}` : ""}, te envio la propuesta de Tactika Consulting para ${p.empresa}. La idea es partir con un diagnostico empresarial y luego, si hace sentido para ustedes, implementar una solucion de gestion adaptada a su forma de trabajar. Quedo atento a tus comentarios para revisar dudas o ajustar el alcance.`,
  },
  {
    id: "recordatorio-propuesta",
    nombre: "Recordatorio de propuesta",
    descripcion: "Para hacer seguimiento sin presionar al prospecto.",
    generar: (p) =>
      `Hola${p.contactoNombre ? ` ${p.contactoNombre}` : ""}, espero que estes bien. Queria saber si pudieron revisar la propuesta de Tactika para ${p.empresa}. Si te parece, podemos agendar una llamada breve para resolver dudas y definir si avanzamos con el diagnostico o ajustamos el alcance segun sus prioridades.`,
  },
  {
    id: "reactivacion",
    nombre: "Reactivacion de prospecto frio",
    descripcion: "Para retomar contacto despues de varios dias sin respuesta.",
    generar: (p) =>
      `Hola${p.contactoNombre ? ` ${p.contactoNombre}` : ""}, retomo contacto porque hace unos dias conversamos sobre la posibilidad de mejorar la gestion de ${p.empresa}. Si sigue siendo tema para ustedes, puedo mostrarte una forma simple de partir: diagnostico, plan de accion y luego una plataforma adaptada a sus necesidades reales.`,
  },
];

function limpiarTelefono(telefono) {
  return String(telefono || "").replace(/[^\d]/g, "");
}

function crearWhatsAppUrl(prospecto, mensaje) {
  const telefono = limpiarTelefono(prospecto.telefono);
  const numero = telefono.startsWith("56") ? telefono : `56${telefono}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export default function PlantillasMensajes({ prospectos, onCerrar }) {
  const [prospectoId, setProspectoId] = useState(prospectos[0]?.id || "");
  const [plantillaId, setPlantillaId] = useState("primer-contacto");
  const [canal, setCanal] = useState("whatsapp");

  const prospecto = prospectos.find((p) => p.id === prospectoId) || prospectos[0];
  const plantilla = plantillas.find((p) => p.id === plantillaId) || plantillas[0];
  const mensajeBase = useMemo(
    () => (prospecto ? plantilla.generar(prospecto) : ""),
    [prospecto, plantilla]
  );
  const [mensajeEditado, setMensajeEditado] = useState("");

  const mensaje = mensajeEditado || mensajeBase;
  const tieneTelefono = !!limpiarTelefono(prospecto?.telefono);
  const tieneCorreo = !!prospecto?.correo;

  function cambiarPlantilla(id) {
    setPlantillaId(id);
    setMensajeEditado("");
  }

  function cambiarProspecto(id) {
    setProspectoId(id);
    setMensajeEditado("");
  }

  async function copiarMensaje() {
    await navigator.clipboard.writeText(mensaje);
    Swal.fire({
      icon: "success",
      title: "Mensaje copiado",
      text: "Revisalo antes de enviarlo al prospecto.",
      timer: 1500,
      showConfirmButton: false,
    });
  }

  if (!prospecto) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Plantillas de mensajes</h2>
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
              <MessageSquareText size={18} />
              Plantillas comerciales
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">Mensajes para prospectos</h2>
            <p className="text-sm text-slate-500 mt-1">
              Genera mensajes personalizados, revisalos y copialos antes de enviarlos.
            </p>
          </div>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600">
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
          <aside className="border-r border-slate-200 p-5 bg-slate-50 space-y-5">
            <label className="block">
              <span className="text-xs font-semibold text-slate-500 uppercase">Prospecto</span>
              <select
                value={prospecto.id}
                onChange={(e) => cambiarProspecto(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
              >
                {prospectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.empresa}
                  </option>
                ))}
              </select>
            </label>

            <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm space-y-2">
              <p className="font-semibold text-slate-800">{prospecto.empresa}</p>
              <p className="text-slate-500">{prospecto.contactoNombre || "Sin contacto registrado"}</p>
              <p className="text-slate-500">{prospecto.telefono || "Sin telefono"}</p>
              <p className="text-slate-500">{prospecto.correo || "Sin correo"}</p>
              <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                {prospecto.estado}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Tipo de mensaje</span>
              <div className="mt-2 space-y-2">
                {plantillas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => cambiarPlantilla(p.id)}
                    className={`w-full text-left border rounded-lg p-3 transition ${
                      plantillaId === p.id
                        ? "border-blue-300 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold">{p.nombre}</p>
                    <p className="text-xs mt-1 opacity-75">{p.descripcion}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="bg-white border border-slate-200 rounded-lg p-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => setCanal("whatsapp")}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                    canal === "whatsapp" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Phone size={16} />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setCanal("correo")}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                    canal === "correo" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Mail size={16} />
                  Correo
                </button>
              </div>

              <span className="text-xs text-slate-400">
                No se envia automaticamente. Solo prepara el mensaje.
              </span>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Mensaje editable</span>
              <textarea
                value={mensaje}
                onChange={(e) => setMensajeEditado(e.target.value)}
                rows={10}
                className="mt-2 w-full border border-slate-200 rounded-lg p-4 text-sm leading-relaxed text-slate-700"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-slate-700 mb-2">Uso recomendado</h3>
                <p className="text-sm text-slate-500">
                  Usa esta plantilla como punto de partida. Ajusta el mensaje segun lo que sepas del
                  prospecto antes de enviarlo.
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-slate-700 mb-2">Datos disponibles</h3>
                <p className="text-sm text-slate-500">
                  {canal === "whatsapp"
                    ? tieneTelefono
                      ? "El prospecto tiene telefono registrado."
                      : "Falta telefono para abrir WhatsApp directo."
                    : tieneCorreo
                      ? "El prospecto tiene correo registrado."
                      : "Falta correo para preparar envio por email."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMensajeEditado("")}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
              >
                Restaurar plantilla
              </button>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copiarMensaje}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-2"
                >
                  <Copy size={16} />
                  Copiar mensaje
                </button>

                {canal === "whatsapp" && tieneTelefono && (
                  <a
                    href={crearWhatsAppUrl(prospecto, mensaje)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <Send size={16} />
                    Abrir WhatsApp
                  </a>
                )}

                {canal === "correo" && tieneCorreo && (
                  <a
                    href={`mailto:${prospecto.correo}?subject=${encodeURIComponent(`Tactika Consulting - ${prospecto.empresa}`)}&body=${encodeURIComponent(mensaje)}`}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Send size={16} />
                    Preparar correo
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
