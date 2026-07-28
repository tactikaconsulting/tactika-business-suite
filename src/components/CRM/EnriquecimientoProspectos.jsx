import { useMemo, useState } from "react";
import { ExternalLink, Mail, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import Swal from "sweetalert2";

const dominiosCorreo = ["contacto", "ventas", "comercial", "administracion", "info"];

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

function normalizarDominio(url) {
  const valor = limpiarTexto(url);
  if (!valor) return "";

  try {
    const conProtocolo = valor.startsWith("http") ? valor : `https://${valor}`;
    return new URL(conProtocolo).hostname.replace(/^www\./, "");
  } catch {
    return valor
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .trim();
  }
}

function crearBusqueda(prospecto, extra = "") {
  const partes = [prospecto.empresa, prospecto.comuna, prospecto.giro, extra].filter(Boolean);
  return `https://www.google.com/search?q=${encodeURIComponent(partes.join(" "))}`;
}

function crearLinkedIn(prospecto) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${prospecto.empresa} ${prospecto.comuna || ""} LinkedIn empresa`)}`;
}

function crearFacebook(prospecto) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${prospecto.empresa} ${prospecto.comuna || ""} Facebook`)}`;
}

function crearInstagram(prospecto) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${prospecto.empresa} ${prospecto.comuna || ""} Instagram`)}`;
}

function crearMensaje(prospecto) {
  const rubro = prospecto.giro ? ` del rubro ${prospecto.giro}` : "";
  return `Hola, soy Claudio Urra de Tactika Consulting. Estamos conversando con pymes${rubro} para conocer como estan gestionando clientes, procesos y seguimiento comercial. Me gustaria coordinar una conversacion breve de 15 minutos para entender como trabajan hoy y ver si podemos aportar valor mediante un diagnostico empresarial.`;
}

export default function EnriquecimientoProspectos({
  prospectos,
  onGuardar,
  onCerrar,
}) {
  const pendientes = useMemo(
    () =>
      prospectos.filter(
        (p) => !limpiarTexto(p.correo) || !limpiarTexto(p.sitioWeb) || !limpiarTexto(p.linkedin)
      ),
    [prospectos]
  );

  const [seleccionadoId, setSeleccionadoId] = useState(pendientes[0]?.id || prospectos[0]?.id || "");
  const seleccionado = prospectos.find((p) => p.id === seleccionadoId) || pendientes[0] || prospectos[0];
  const [form, setForm] = useState({
    correo: seleccionado?.correo || "",
    sitioWeb: seleccionado?.sitioWeb || "",
    facebook: seleccionado?.facebook || "",
    instagram: seleccionado?.instagram || "",
    linkedin: seleccionado?.linkedin || "",
    observaciones: seleccionado?.observaciones || "",
  });

  function cambiarProspecto(id) {
    const prospecto = prospectos.find((p) => p.id === id);
    setSeleccionadoId(id);
    setForm({
      correo: prospecto?.correo || "",
      sitioWeb: prospecto?.sitioWeb || "",
      facebook: prospecto?.facebook || "",
      instagram: prospecto?.instagram || "",
      linkedin: prospecto?.linkedin || "",
      observaciones: prospecto?.observaciones || "",
    });
  }

  const dominio = normalizarDominio(form.sitioWeb || seleccionado?.sitioWeb);
  const correosSugeridos = dominio ? dominiosCorreo.map((prefijo) => `${prefijo}@${dominio}`) : [];
  const mensaje = seleccionado ? crearMensaje(seleccionado) : "";

  async function copiar(texto, titulo = "Copiado") {
    await navigator.clipboard.writeText(texto);
    Swal.fire({ icon: "success", title: titulo, timer: 1100, showConfirmButton: false });
  }

  async function guardar() {
    if (!seleccionado) return;

    const datos = {
      ...seleccionado,
      ...form,
      sitioWeb: form.sitioWeb.trim(),
      correo: form.correo.trim(),
      facebook: form.facebook.trim(),
      instagram: form.instagram.trim(),
      linkedin: form.linkedin.trim(),
      observaciones: form.observaciones.trim(),
    };

    await onGuardar(seleccionado.id, datos);
  }

  if (!seleccionado) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Enriquecimiento de prospectos</h2>
              <p className="text-sm text-slate-500 mt-1">No hay prospectos disponibles para revisar.</p>
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
              <Sparkles size={18} />
              Enriquecimiento seguro
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">Completar datos del prospecto</h2>
            <p className="text-sm text-slate-500 mt-1">
              Busca fuentes publicas, revisa la informacion y guarda solo lo confirmado.
            </p>
          </div>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600">
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
          <aside className="border-r border-slate-200 p-4 bg-slate-50">
            <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Prospectos por completar ({pendientes.length})
            </div>
            <select
              value={seleccionado.id}
              onChange={(e) => cambiarProspecto(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white mb-4"
            >
              {prospectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.empresa}
                </option>
              ))}
            </select>

            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-slate-800">{seleccionado.empresa}</p>
              <p className="text-slate-500">{seleccionado.giro || "Rubro sin completar"}</p>
              <p className="text-slate-500">{seleccionado.comuna || "Comuna sin completar"}</p>
              <p className="text-slate-500">{seleccionado.telefono || "Telefono sin completar"}</p>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-800">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <ShieldCheck size={16} />
                Regla Tactika
              </div>
              No se envia ningun correo automaticamente. Primero se valida la fuente y luego se guarda.
            </div>
          </aside>

          <section className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Fuentes de busqueda publica</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <a
                  href={crearBusqueda(seleccionado, "correo contacto")}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center justify-between"
                >
                  Google
                  <ExternalLink size={16} />
                </a>
                <a
                  href={crearLinkedIn(seleccionado)}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center justify-between"
                >
                  LinkedIn
                  <ExternalLink size={16} />
                </a>
                <a
                  href={crearFacebook(seleccionado)}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center justify-between"
                >
                  Facebook
                  <ExternalLink size={16} />
                </a>
                <a
                  href={crearInstagram(seleccionado)}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center justify-between"
                >
                  Instagram
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Sitio web confirmado</span>
                <input
                  value={form.sitioWeb}
                  onChange={(e) => setForm({ ...form, sitioWeb: e.target.value })}
                  placeholder="https://empresa.cl"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Correo confirmado</span>
                <input
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  placeholder="contacto@empresa.cl"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Facebook</span>
                <input
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  placeholder="https://facebook.com/empresa"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Instagram</span>
                <input
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="https://instagram.com/empresa"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">LinkedIn</span>
                <input
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/company/empresa"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                />
              </label>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Mail size={16} />
                Correos sugeridos por dominio
              </h3>
              {correosSugeridos.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Ingresa primero el sitio web confirmado para generar correos corporativos posibles.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {correosSugeridos.map((correo) => (
                    <button
                      key={correo}
                      onClick={() => setForm({ ...form, correo })}
                      className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700"
                    >
                      {correo}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Mensaje de primer contacto</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{mensaje}</p>
              <button
                onClick={() => copiar(mensaje, "Mensaje copiado")}
                className="mt-3 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Copiar mensaje
              </button>
            </div>

            <label className="space-y-1 block">
              <span className="text-sm font-medium text-slate-700">Observaciones de validacion</span>
              <textarea
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                rows={3}
                placeholder="Ej: correo encontrado en sitio oficial, formulario de contacto disponible, numero WhatsApp confirmado..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              />
            </label>

            <div className="flex flex-wrap justify-between gap-3 pt-2">
              <button
                onClick={() => window.open(crearBusqueda(seleccionado, "contacto sitio oficial"), "_blank")}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition flex items-center gap-2"
              >
                <Search size={16} />
                Buscar mas datos
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onCerrar}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardar}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 transition"
                >
                  Guardar datos revisados
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
