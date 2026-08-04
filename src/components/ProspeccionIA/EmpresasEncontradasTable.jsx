import { Building2, CheckCircle2, Globe, Mail, Phone, PlusCircle } from "lucide-react";

function estadoClase(estado) {
  if (estado === "Agregada al CRM") return "bg-green-50 text-green-700 border-green-200";
  if (estado === "Duplicada") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

export default function EmpresasEncontradasTable({ empresas, agregandoId, onAgregar }) {
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
          Ejecuta una busqueda para ver empresas simuladas.
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
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">{empresa.problemaDetectado}</p>
                  </td>
                  <td className="p-3 text-slate-600">{empresa.giro}</td>
                  <td className="p-3 text-slate-600">{empresa.comuna}</td>
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
                        <p className="flex items-center gap-1.5">
                          <Globe size={13} />
                          {empresa.sitioWeb.replace("https://", "")}
                        </p>
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
                    <button
                      type="button"
                      onClick={() => onAgregar(empresa)}
                      disabled={
                        agregandoId === empresa.idTemporal ||
                        empresa.estadoProspeccion === "Agregada al CRM" ||
                        empresa.estadoProspeccion === "Duplicada"
                      }
                      className="min-h-9 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                    >
                      <PlusCircle size={14} />
                      {agregandoId === empresa.idTemporal ? "Guardando" : "Agregar al CRM"}
                    </button>
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
