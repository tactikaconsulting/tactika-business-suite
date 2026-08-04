import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clipboard,
  FileText,
  Mail,
  MessageCircle,
  PhoneCall,
  ShieldQuestion,
  Target,
} from "lucide-react";
import Swal from "sweetalert2";

import { obtenerPlaybookComercial } from "../services/PlaybookComercialService";

function copiar(texto) {
  navigator.clipboard.writeText(texto);
  Swal.fire({
    icon: "success",
    title: "Copiado",
    text: "Texto listo para pegar en WhatsApp, correo o CRM.",
    timer: 1400,
    showConfirmButton: false,
  });
}

function BotonCopiar({ texto }) {
  return (
    <button
      type="button"
      onClick={() => copiar(texto)}
      className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold text-slate-700"
    >
      <Clipboard size={14} />
      Copiar
    </button>
  );
}

function BloqueTexto({ icon: Icon, titulo, texto }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={17} className="text-blue-700" />
          <h3 className="font-bold text-slate-800">{titulo}</h3>
        </div>
        <BotonCopiar texto={Array.isArray(texto) ? texto.join("\n") : texto} />
      </div>
      {Array.isArray(texto) ? (
        <ol className="mt-3 space-y-2 text-sm text-slate-600 list-decimal list-inside">
          {texto.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-slate-600 whitespace-pre-line">{texto}</p>
      )}
    </div>
  );
}

export default function PlaybookComercial() {
  const playbook = useMemo(() => obtenerPlaybookComercial(), []);
  const [etapaId, setEtapaId] = useState(playbook.etapas[0].id);
  const etapa = playbook.etapas.find((item) => item.id === etapaId) || playbook.etapas[0];

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">Tactika Suite</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
              Playbook Comercial
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Guiones, mensajes, objeciones y cierres para vender diagnosticos e implementaciones
              sin improvisar.
            </p>
          </div>
          <Link
            to="/crm"
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-2 text-sm font-bold"
          >
            Ir al CRM
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
        <aside className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 h-fit">
          <p className="text-xs uppercase font-semibold text-slate-500">Etapas comerciales</p>
          <div className="mt-3 space-y-2">
            {playbook.etapas.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setEtapaId(item.id)}
                className={`w-full text-left border rounded-lg p-3 transition ${
                  etapaId === item.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-bold">{item.nombre}</p>
                <p className={`text-xs mt-1 ${etapaId === item.id ? "text-slate-300" : "text-slate-500"}`}>
                  {item.objetivo}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <section className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase font-semibold text-slate-400">Etapa seleccionada</p>
            <h2 className="text-2xl font-bold mt-2">{etapa.nombre}</h2>
            <p className="text-sm text-slate-300 mt-3">{etapa.objetivo}</p>
            <p className="text-sm text-white mt-3 font-semibold">{etapa.cuandoUsar}</p>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <BloqueTexto icon={MessageCircle} titulo="WhatsApp" texto={etapa.mensajeWhatsApp} />
            <BloqueTexto icon={Mail} titulo="Correo" texto={etapa.correo} />
            <BloqueTexto icon={PhoneCall} titulo="Guion de llamada" texto={etapa.guionLlamada} />
            <BloqueTexto icon={Target} titulo="Cierre recomendado" texto={etapa.cierre} />
          </section>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <ShieldQuestion className="text-blue-700" size={19} />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Objeciones frecuentes</h2>
              <p className="text-sm text-slate-500 mt-1">
                Respuestas cortas para no quedar bloqueado en la conversacion.
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {playbook.objeciones.map((item) => (
              <div key={item.objecion} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800">{item.objecion}</p>
                  <p className="text-sm text-slate-600 mt-2">{item.respuesta}</p>
                </div>
                <BotonCopiar texto={item.respuesta} />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 h-fit">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-700" size={19} />
            <h2 className="text-lg font-bold text-slate-800">Cierres rapidos</h2>
          </div>
          <div className="mt-4 space-y-3">
            {playbook.cierres.map((cierre) => (
              <div key={cierre} className="border border-slate-200 rounded-lg p-3">
                <p className="text-sm text-slate-700">{cierre}</p>
                <div className="mt-3">
                  <BotonCopiar texto={cierre} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
