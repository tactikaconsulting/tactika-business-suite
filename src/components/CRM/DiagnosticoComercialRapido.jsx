import { useMemo, useState } from "react";
import { ClipboardCheck, Copy, Save, Sparkles, X } from "lucide-react";
import Swal from "sweetalert2";
import {
  areasDiagnostico,
  generarDiagnosticoComercial,
} from "../../services/DiagnosticoComercialService";

const opcionesUrgencia = ["Baja", "Media", "Alta"];
const opcionesInteres = ["Bajo", "Medio", "Alto"];
const opcionesTrabajo = ["Bajo", "Medio", "Alto"];

function formatoCLP(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CL");
}

function copiar(texto) {
  navigator.clipboard?.writeText(texto);
  Swal.fire({
    icon: "success",
    title: "Copiado",
    timer: 1000,
    showConfirmButton: false,
  });
}

export default function DiagnosticoComercialRapido({
  prospectos,
  prospectoInicialId,
  onGuardar,
  onCerrar,
}) {
  const [prospectoId, setProspectoId] = useState(prospectoInicialId || prospectos[0]?.id || "");
  const [formulario, setFormulario] = useState({
    area: "ventas",
    problema: "",
    dolor: "",
    necesidad: "",
    urgencia: "Media",
    interes: "Medio",
    trabajoAdministrativo: "Medio",
    usaSoftware: "No",
    softwareActual: "",
    trabajadores: "",
    valorEstimado: "",
    proximoPaso: "Agendar reunion de diagnostico",
    fechaProximoContacto: "",
  });

  const prospecto = prospectos.find((p) => p.id === prospectoId) || prospectos[0];

  const diagnostico = useMemo(() => {
    if (!prospecto) return null;
    return generarDiagnosticoComercial(prospecto, formulario);
  }, [prospecto, formulario]);

  function actualizar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function guardarDiagnostico(e) {
    e.preventDefault();
    if (!prospecto || !diagnostico) return;
    await onGuardar(prospecto.id, diagnostico.datosCRM);
  }

  if (!prospecto) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Diagnostico comercial</h2>
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
      <form
        onSubmit={guardarDiagnostico}
        className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600 flex items-center gap-2">
              <ClipboardCheck size={16} /> Fase 22
            </p>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">Diagnostico comercial del prospecto</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Registra dolor, urgencia e interes. Tactika sugiere modulo, plan, valor estimado y siguiente paso.
            </p>
          </div>
          <button type="button" onClick={onCerrar} className="text-slate-400 hover:text-slate-600">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="space-y-4">
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
                <span className="text-sm font-semibold text-slate-700">Area prioritaria</span>
                <select
                  value={formulario.area}
                  onChange={(e) => actualizar("area", e.target.value)}
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                >
                  {Object.entries(areasDiagnostico).map(([id, area]) => (
                    <option key={id} value={id}>
                      {area.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Trabajadores aprox.</span>
                <input
                  type="number"
                  min="0"
                  value={formulario.trabajadores}
                  onChange={(e) => actualizar("trabajadores", e.target.value)}
                  placeholder="Ej: 12"
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Problema observado</span>
              <input
                value={formulario.problema}
                onChange={(e) => actualizar("problema", e.target.value)}
                placeholder="Ej: seguimiento de clientes en WhatsApp sin control"
                className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Dolor principal</span>
              <textarea
                value={formulario.dolor}
                onChange={(e) => actualizar("dolor", e.target.value)}
                rows={3}
                placeholder="Ej: pierden oportunidades porque nadie sabe a quien llamar primero"
                className="mt-2 w-full border border-slate-200 rounded-lg p-3 text-sm leading-relaxed"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Necesidad detectada</span>
              <textarea
                value={formulario.necesidad}
                onChange={(e) => actualizar("necesidad", e.target.value)}
                rows={3}
                placeholder="Ej: ordenar prospectos, tareas, propuestas y recordatorios"
                className="mt-2 w-full border border-slate-200 rounded-lg p-3 text-sm leading-relaxed"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Urgencia</span>
                <select
                  value={formulario.urgencia}
                  onChange={(e) => actualizar("urgencia", e.target.value)}
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                >
                  {opcionesUrgencia.map((opcion) => (
                    <option key={opcion}>{opcion}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Interes</span>
                <select
                  value={formulario.interes}
                  onChange={(e) => actualizar("interes", e.target.value)}
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                >
                  {opcionesInteres.map((opcion) => (
                    <option key={opcion}>{opcion}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Trabajo administrativo</span>
                <select
                  value={formulario.trabajoAdministrativo}
                  onChange={(e) => actualizar("trabajoAdministrativo", e.target.value)}
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                >
                  {opcionesTrabajo.map((opcion) => (
                    <option key={opcion}>{opcion}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Usa software actualmente</span>
                <select
                  value={formulario.usaSoftware}
                  onChange={(e) => actualizar("usaSoftware", e.target.value)}
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                >
                  <option>Si</option>
                  <option>No</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Software actual</span>
                <input
                  value={formulario.softwareActual}
                  onChange={(e) => actualizar("softwareActual", e.target.value)}
                  placeholder="Ej: Excel, Defontana, Talana..."
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Valor estimado</span>
                <input
                  type="number"
                  min="0"
                  value={formulario.valorEstimado}
                  onChange={(e) => actualizar("valorEstimado", e.target.value)}
                  placeholder="Opcional. Ej: 199990"
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Fecha proximo contacto</span>
                <input
                  type="date"
                  value={formulario.fechaProximoContacto}
                  onChange={(e) => actualizar("fechaProximoContacto", e.target.value)}
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Proximo paso</span>
              <input
                value={formulario.proximoPaso}
                onChange={(e) => actualizar("proximoPaso", e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-blue-200 text-sm font-semibold uppercase">
                <Sparkles size={16} /> Recomendacion Tactika
              </div>
              <h3 className="text-xl font-bold mt-3">{diagnostico.recomendacion.modulo}</h3>
              <p className="text-sm text-slate-300 mt-2">{diagnostico.recomendacion.plan}</p>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-slate-300">Valor estimado</p>
                  <p className="text-lg font-bold mt-1">{formatoCLP(diagnostico.recomendacion.valorEstimado)}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-slate-300">Probabilidad</p>
                  <p className="text-lg font-bold mt-1">{diagnostico.recomendacion.probabilidad}%</p>
                </div>
              </div>
              <p className="text-sm text-slate-200 mt-4 leading-relaxed">
                {diagnostico.recomendacion.propuestaValor}
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-700">Mensaje sugerido</h3>
                <button
                  type="button"
                  onClick={() => copiar(diagnostico.recomendacion.mensajeSugerido)}
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                >
                  <Copy size={14} /> Copiar
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {diagnostico.recomendacion.mensajeSugerido}
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-700">Guion de llamada</h3>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {diagnostico.recomendacion.guionLlamada}
              </p>
            </div>

            <div className="border border-blue-100 bg-blue-50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-blue-900">Que se guardara en el CRM</h3>
              <ul className="mt-3 space-y-2 text-sm text-blue-900">
                <li>Estado: {diagnostico.datosCRM.estado}</li>
                <li>Problema: {diagnostico.datosCRM.problemaDetectado}</li>
                <li>Necesidad: {diagnostico.datosCRM.necesidad}</li>
                <li>Proximo contacto: {diagnostico.datosCRM.fechaProximoContacto || "Sin fecha"}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2"
          >
            <Save size={16} /> Guardar diagnostico
          </button>
        </div>
      </form>
    </div>
  );
}
