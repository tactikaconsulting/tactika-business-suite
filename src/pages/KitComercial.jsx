import { useState } from "react";
import { Copy, Download, Mail, MessageCircle, Send } from "lucide-react";
import Swal from "sweetalert2";

import {
  crearLinkCorreoKit,
  crearLinkWhatsAppKit,
  crearMensajeKitComercial,
  descargarKitComercialPDF,
} from "../services/KitComercialService";

function copiar(texto) {
  navigator.clipboard.writeText(texto);
  Swal.fire({
    icon: "success",
    title: "Copiado",
    text: "Mensaje listo para enviar.",
    timer: 1400,
    showConfirmButton: false,
  });
}

export default function KitComercial() {
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const mensaje = crearMensajeKitComercial();

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-blue-600">Tactika Suite</p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
          Kit Comercial
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Presentacion breve para enviar a prospectos por WhatsApp, correo o como PDF despues
          del primer contacto.
        </p>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 h-fit space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Enviar a prospecto</h2>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Telefono WhatsApp</span>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 936440981"
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Correo</span>
            <input
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="contacto@empresa.cl"
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
            />
          </label>

          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={descargarKitComercialPDF}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Descargar PDF
            </button>
            <button
              type="button"
              onClick={() => copiar(mensaje)}
              className="border border-slate-200 hover:bg-slate-50 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 flex items-center justify-center gap-2"
            >
              <Copy size={16} />
              Copiar mensaje
            </button>
            <button
              type="button"
              onClick={() => window.open(crearLinkWhatsAppKit(telefono), "_blank", "noopener,noreferrer")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              Abrir WhatsApp
            </button>
            <button
              type="button"
              onClick={() => window.open(crearLinkCorreoKit(correo), "_blank", "noopener,noreferrer")}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              <Mail size={16} />
              Preparar correo
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase font-semibold text-slate-400">Documento comercial</p>
            <h2 className="text-2xl font-bold mt-2">Que recibe el prospecto</h2>
            <p className="text-sm text-slate-300 mt-3 max-w-4xl">
              Una presentacion clara de Tactika Consulting: que hacemos, como trabajamos, que
              modulos tiene Tactika Suite, valores iniciales y siguiente paso recomendado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ["01", "Quienes somos", "Consultoria, diagnostico y sistema para pymes."],
              ["02", "Metodo Tactika", "Descubrir, disenar, implementar y evolucionar."],
              ["03", "Oferta inicial", "Diagnostico, implementacion y acompanamiento."],
            ].map(([numero, titulo, texto]) => (
              <div key={numero} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <p className="text-2xl font-bold text-blue-700">{numero}</p>
                <h3 className="font-bold text-slate-800 mt-2">{titulo}</h3>
                <p className="text-sm text-slate-500 mt-2">{texto}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2">
              <Send size={18} className="text-blue-700" />
              <h2 className="text-lg font-bold text-slate-800">Mensaje sugerido</h2>
            </div>
            <p className="text-sm text-slate-600 mt-4 whitespace-pre-line">{mensaje}</p>
          </div>
        </section>
      </section>
    </div>
  );
}
