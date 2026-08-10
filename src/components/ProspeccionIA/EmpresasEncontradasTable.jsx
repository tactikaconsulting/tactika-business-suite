import {
  Building2,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PlusCircle,
} from "lucide-react";

function estadoClase(estado) {
  if (estado === "Agregada al CRM") return "bg-green-50 text-green-700 border-green-200";
  if (estado === "Duplicada") return "bg-amber-50 text-amber-700 border-amber-200";
  if (estado === "Contactada") return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

function normalizarTelefonoWhatsApp(telefono) {
  const digitos = String(telefono || "").replace(/\D/g, "");
  if (!digitos) return "";
  if (digitos.startsWith("56")) return digitos;
  if (digitos.startsWith("9")) return `56${digitos}`;
  return digitos;
}

function crearMensajeProspeccion(empresa) {
  return `Hola, soy Claudio de Tactika Consulting.

Vi que ${empresa.empresa} trabaja en el rubro ${empresa.giro || "pyme"}. Estoy ayudando a empresas a detectar procesos que generan perdida de tiempo o dinero por usar Excel, WhatsApp o controles manuales.

Antes de ofrecer cualquier sistema, hacemos una evaluacion gratuita para descubrir que dolor conviene resolver primero. En empresas similares suele aparecer este punto: ${(empresa.dolorPrincipal || empresa.problemaDetectado || "desorden operativo").toLowerCase()}.

Te puedo enviar la evaluacion gratuita? Es corta y entrega un puntaje de 0 a 100.

https://tactikaconsulting.com/evaluador`;
}

function crearAsuntoCorreo(empresa) {
  return `Evaluacion gratuita para ${empresa.empresa}`;
}

export default function EmpresasEncontradasTable({
  empresas,
  agregandoId,
  onAgregar,
  onMarcarContactada,
}) {
  async function copiarMensaje(empresa) {
    await navigator.clipboard.writeText(crearMensajeProspeccion(empresa));
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase text-blue-600">Prospeccion IA</p>
          <h2 className="text-xl font-bold text-slate-800 mt-1">Empresas Encontradas</h2>
          <p className="text-sm text-slate-500 mt-1">
            Revisa los datos antes de convertirlos en prospectos del CRM.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600">
          {empresas.length} empresas
        </div>
      </div>

      {empresas.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-400">
          Ejecuta una busqueda para ver empresas reales encontradas en fuentes publicas.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-left font-semibold">Nombre</th>
                <th className="p-3 text-left font-semibold">Rubro</th>
                <th className="p-3 text-left font-semibold">Comuna</th>
                <th className="p-3 text-left font-semibold">Contacto</th>
                <th className="p-3 text-left font-semibold">Potencial</th>
                <th className="p-3 text-left font-semibold">Estado</th>
                <th className="p-3 text-right font-semibold">Accion</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.idTemporal} className="border-t border-slate-100 align-top">
                  <td className="p-3">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <Building2 size={16} className="text-slate-400" />
                      {empresa.empresa}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      {empresa.problemaDetectado}
                    </p>
                    {empresa.fuente && (
                      <p className="text-[11px] font-semibold text-blue-600 mt-2">
                        Fuente: {empresa.fuente}
                      </p>
                    )}
                  </td>

                  <td className="p-3 text-slate-600">{empresa.giro}</td>

                  <td className="p-3 text-slate-600">
                    <div>{empresa.comuna}</div>
                    {empresa.direccion && (
                      <p className="text-xs text-slate-500 mt-1 flex gap-1.5 max-w-xs">
                        <MapPin size={13} className="mt-0.5 shrink-0" />
                        <span>{empresa.direccion}</span>
                      </p>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="space-y-1 text-slate-600">
                      {empresa.telefono && (
                        <p className="flex items-center gap-1.5">
                          <Phone size={13} />
                          {empresa.telefono}
                        </p>
                      )}
                      {empresa.correo && (
                        <p className="flex items-center gap-1.5">
                          <Mail size={13} />
                          {empresa.correo}
                        </p>
                      )}
                      {empresa.sitioWeb && (
                        <a
                          href={empresa.sitioWeb}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700"
                        >
                          <Globe size={13} />
                          {empresa.dominio || empresa.sitioWeb.replace("https://", "")}
                        </a>
                      )}
                      {empresa.googleMapsUrl && (
                        <a
                          href={empresa.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink size={13} />
                          Ver en Maps
                        </a>
                      )}
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="inline-flex items-center rounded-full bg-slate-900 text-white px-2.5 py-1 text-xs font-bold">
                      {empresa.potencial}/100
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${estadoClase(
                        empresa.estadoProspeccion
                      )}`}
                    >
                      {empresa.estadoProspeccion === "Agregada al CRM" && (
                        <CheckCircle2 size={13} className="mr-1" />
                      )}
                      {empresa.estadoProspeccion}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex justify-end gap-1.5 flex-wrap">
                        {normalizarTelefonoWhatsApp(empresa.telefono) && (
                          <a
                            href={`https://wa.me/${normalizarTelefonoWhatsApp(
                              empresa.telefono
                            )}?text=${encodeURIComponent(crearMensajeProspeccion(empresa))}`}
                            target="_blank"
                            rel="noreferrer"
                            className="min-h-8 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                          >
                            <MessageCircle size={13} />
                            WhatsApp
                          </a>
                        )}

                        {empresa.correo && (
                          <a
                            href={`mailto:${empresa.correo}?subject=${encodeURIComponent(
                              crearAsuntoCorreo(empresa)
                            )}&body=${encodeURIComponent(crearMensajeProspeccion(empresa))}`}
                            className="min-h-8 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                          >
                            <Mail size={13} />
                            Correo
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => copiarMensaje(empresa)}
                          className="min-h-8 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                        >
                          <Clipboard size={13} />
                          Copiar
                        </button>
                      </div>

                      <div className="flex justify-end gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onMarcarContactada?.(empresa)}
                          className="min-h-8 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={13} />
                          Contactada
                        </button>

                        <button
                          type="button"
                          onClick={() => onAgregar(empresa)}
                          disabled={
                            agregandoId === empresa.idTemporal ||
                            empresa.estadoProspeccion === "Agregada al CRM" ||
                            empresa.estadoProspeccion === "Duplicada"
                          }
                          className="min-h-8 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                        >
                          <PlusCircle size={13} />
                          {agregandoId === empresa.idTemporal ? "Guardando" : "CRM"}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
