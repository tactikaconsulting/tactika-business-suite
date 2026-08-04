import { useEffect, useState } from "react";
import { ClipboardCheck, FileText, Sparkles, X } from "lucide-react";
import Swal from "sweetalert2";
import {
  crearBorradorPropuestaDesdeDiagnostico,
  prospectoTieneDiagnosticoComercial,
} from "../../services/PropuestaDesdeDiagnosticoService";

const planes = [
  "Diagnostico Empresarial",
  "Sistema Tactika Base",
  "Sistema Tactika Profesional",
  "Sistema Tactika Enterprise",
  "Proyecto a medida",
];

const plantillasPorPlan = {
  "Diagnostico Empresarial": {
    titulo: "Diagnostico Empresarial Tactika",
    implementacion: "29990",
    mensualidad: "0",
    alcance:
      "Reunion de levantamiento, revision de procesos principales, identificacion de problemas de gestion, analisis de oportunidades de mejora e informe ejecutivo con plan de accion inicial.",
    condiciones:
      "Servicio de diagnostico de pago unico. No incluye implementacion de plataforma ni acompanamiento mensual. Si el cliente decide avanzar con Tactika Suite, este valor puede descontarse del proyecto de implementacion.",
  },
  "Sistema Tactika Base": {
    titulo: "Implementacion Sistema Tactika Base",
    implementacion: "199990",
    mensualidad: "49900",
    alcance:
      "Configuracion inicial de Tactika Suite para una empresa pequena, modulo CRM basico, carga inicial de informacion, capacitacion de uso y una reunion de puesta en marcha.",
    condiciones:
      "Incluye configuracion base y soporte mensual esencial. Ajustes mayores, nuevos modulos o integraciones se cotizan por separado.",
  },
  "Sistema Tactika Profesional": {
    titulo: "Implementacion Sistema Tactika Profesional",
    implementacion: "490000",
    mensualidad: "89900",
    alcance:
      "Diagnostico inicial, configuracion del sistema, adaptacion de modulos comerciales, carga base de informacion, capacitacion, reportes iniciales, seguimiento de puesta en marcha y acompanamiento mensual.",
    condiciones:
      "Incluye mejoras menores, soporte y reuniones de seguimiento segun plan. Nuevos desarrollos a medida se evaluan y cotizan segun alcance.",
  },
  "Sistema Tactika Enterprise": {
    titulo: "Implementacion Sistema Tactika Enterprise",
    implementacion: "990000",
    mensualidad: "149900",
    alcance:
      "Implementacion avanzada de Tactika Suite con diagnostico, configuracion de multiples modulos, reportería gerencial, flujos de seguimiento, capacitacion por areas, soporte prioritario y preparacion para automatizaciones e inteligencia artificial.",
    condiciones:
      "Valor desde el monto indicado. Integraciones, desarrollos especiales, IA avanzada o requerimientos fuera del alcance inicial se cotizan como proyecto adicional.",
  },
  "Proyecto a medida": {
    titulo: "Proyecto Tactika a medida",
    implementacion: "0",
    mensualidad: "0",
    alcance:
      "Diseno de una solucion personalizada segun los procesos, necesidades, usuarios, modulos, reportes e integraciones requeridas por la empresa.",
    condiciones:
      "El valor final se define despues del levantamiento tecnico y comercial. La propuesta definitiva queda sujeta a validacion de alcance, tiempos y recursos necesarios.",
  },
};

function numero(valor) {
  const limpio = String(valor || "").replace(/\D/g, "");
  return limpio ? Number(limpio) : 0;
}

function formatoCLP(valor) {
  return "$" + Number(numero(valor)).toLocaleString("es-CL");
}

export default function CrearPropuestaComercial({
  prospectos,
  prospectoInicialId,
  onGuardar,
  onCerrar,
}) {
  const [prospectoId, setProspectoId] = useState(prospectoInicialId || prospectos[0]?.id || "");
  const [plan, setPlan] = useState("Sistema Tactika Profesional");
  const plantillaInicial = plantillasPorPlan["Sistema Tactika Profesional"];
  const [titulo, setTitulo] = useState(plantillaInicial.titulo);
  const [valorImplementacion, setValorImplementacion] = useState(plantillaInicial.implementacion);
  const [valorMensual, setValorMensual] = useState(plantillaInicial.mensualidad);
  const [alcance, setAlcance] = useState(plantillaInicial.alcance);
  const [condiciones, setCondiciones] = useState(plantillaInicial.condiciones);
  const [estado, setEstado] = useState("Borrador");
  const [fechaEnvio, setFechaEnvio] = useState(new Date().toISOString().slice(0, 10));

  const prospecto = prospectos.find((p) => p.id === prospectoId) || prospectos[0];
  const tieneDiagnostico = prospectoTieneDiagnosticoComercial(prospecto);

  useEffect(() => {
    if (!prospectoInicialId || !prospecto || !tieneDiagnostico) return;
    aplicarDiagnostico(prospecto, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function aplicarPlantilla(nuevoPlan) {
    const plantilla = plantillasPorPlan[nuevoPlan];
    setPlan(nuevoPlan);
    setTitulo(plantilla.titulo);
    setValorImplementacion(plantilla.implementacion);
    setValorMensual(plantilla.mensualidad);
    setAlcance(plantilla.alcance);
    setCondiciones(plantilla.condiciones);
  }

  function aplicarDiagnostico(prospectoObjetivo = prospecto, mostrarAviso = true) {
    if (!prospectoObjetivo) return;
    const borrador = crearBorradorPropuestaDesdeDiagnostico(prospectoObjetivo);
    setTitulo(borrador.titulo);
    setPlan(borrador.plan);
    setValorImplementacion(String(borrador.valorImplementacion));
    setValorMensual(String(borrador.valorMensual));
    setAlcance(borrador.alcance);
    setCondiciones(borrador.condiciones);

    if (mostrarAviso) {
      Swal.fire({
        icon: "success",
        title: "Propuesta preparada",
        text: "Se uso el diagnostico comercial del prospecto como base.",
        timer: 1400,
        showConfirmButton: false,
      });
    }
  }

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

          {tieneDiagnostico ? (
            <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
              <div className="flex items-start gap-3">
                <ClipboardCheck size={20} className="text-blue-700 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-950">Diagnostico comercial disponible</p>
                  <p className="text-sm text-blue-900 mt-1 leading-relaxed">
                    Este prospecto ya tiene problema, dolor, necesidad o valor estimado registrado.
                    Puedes convertir esos datos en una propuesta lista para ajustar y enviar.
                  </p>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-blue-900">
                    <span className="rounded-lg bg-white/70 border border-blue-100 p-2">
                      Problema: {prospecto.problemaDetectado || "Sin detalle"}
                    </span>
                    <span className="rounded-lg bg-white/70 border border-blue-100 p-2">
                      Valor: {formatoCLP(prospecto.valorEstimado || 0)}
                    </span>
                    <span className="rounded-lg bg-white/70 border border-blue-100 p-2">
                      Cierre: {Number(prospecto.probabilidadCierre || 0)}%
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => aplicarDiagnostico()}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                Usar diagnostico
              </button>
            </div>
          ) : (
            <div className="border border-amber-100 bg-amber-50 rounded-xl p-4 flex items-start gap-3">
              <ClipboardCheck size={18} className="text-amber-700 mt-0.5" />
              <p className="text-sm text-amber-900">
                Este prospecto aun no tiene diagnostico comercial. Puedes guardar la propuesta manualmente
                o volver a la ficha y usar el boton Diagnostico para preparar una propuesta mas precisa.
              </p>
            </div>
          )}

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
                onChange={(e) => aplicarPlantilla(e.target.value)}
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

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <p className="text-sm font-bold text-slate-700">Vista previa comercial</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs uppercase font-semibold text-blue-600">Tactika Consulting</p>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{titulo}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Preparada para {prospecto.empresa} · {plan}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Implementacion</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">
                    {formatoCLP(valorImplementacion)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Mensualidad</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">
                    {formatoCLP(valorMensual)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Alcance resumido</p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{alcance}</p>
              </div>
            </div>
          </div>

          <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <FileText size={18} className="text-blue-700 mt-0.5" />
            <p className="text-sm text-blue-900">
              Puedes ajustar el texto antes de guardar. Luego la propuesta quedara disponible para
              descargar en PDF desde la ficha del prospecto.
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
