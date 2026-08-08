import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Megaphone, Plus, Route, ShieldCheck, Sparkles } from "lucide-react";
import Swal from "sweetalert2";

import BuscadorProspectos from "../components/ProspeccionIA/BuscadorProspectos";
import EmpresasEncontradasTable from "../components/ProspeccionIA/EmpresasEncontradasTable";
import IAComercialPanel from "../components/ProspeccionIA/IAComercialPanel";
import ProspectosGuardadosPanel from "../components/ProspeccionIA/ProspectosGuardadosPanel";
import { obtenerProspectos } from "../services/ProspectoService";
import {
  agregarEmpresaEncontradaAlCRM,
  buscarEmpresasSimuladas,
  generarRespuestaIAComercial,
} from "../services/ProspeccionIAService";

const filtrosIniciales = {
  rubro: "Constructora",
  comunas: "Buin, Paine, San Bernardo, Maipu, Quilicura, Lampa, Colina",
  region: "Region Metropolitana",
  maxTrabajadores: "50",
  palabrasClave: "",
};

export default function ProspeccionIA() {
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [empresas, setEmpresas] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [agregandoId, setAgregandoId] = useState(null);
  const [preguntaIA, setPreguntaIA] = useState("");
  const [respuestaIA, setRespuestaIA] = useState("");
  const [empresaManual, setEmpresaManual] = useState({
    empresa: "",
    giro: "Constructora",
    comuna: "Buin",
    region: "Region Metropolitana",
    telefono: "",
    correo: "",
    sitioWeb: "",
    numTrabajadores: "",
    problemaDetectado: "Gestion manual con Excel, WhatsApp o informacion dispersa.",
    dolorPrincipal: "Necesita identificar que proceso conviene ordenar primero.",
    necesidad: "Evaluacion gratuita y diagnostico para definir sistema a medida.",
    estadoProspeccion: "Encontrada",
  });

  useEffect(() => {
    cargarProspectos();
  }, []);

  async function cargarProspectos() {
    const data = await obtenerProspectos();
    setProspectos(data);
  }

  function buscar() {
    const resultados = buscarEmpresasSimuladas(filtros);
    setEmpresas(resultados);
    setRespuestaIA(
      resultados.length > 0
        ? `Encontramos ${resultados.length} empresas simuladas. Revisa potencial, contacto y problema probable antes de agregarlas al CRM.`
        : "No encontramos empresas con esos filtros. Prueba ampliar comunas o quitar palabras clave."
    );
  }

  async function agregarAlCRM(empresa) {
    setAgregandoId(empresa.idTemporal);

    try {
      const resultado = await agregarEmpresaEncontradaAlCRM(empresa);
      await cargarProspectos();

      setEmpresas((actuales) =>
        actuales.map((item) =>
          item.idTemporal === empresa.idTemporal
            ? {
                ...item,
                estadoProspeccion: resultado.creado ? "Agregada al CRM" : "Duplicada",
              }
            : item
        )
      );

      Swal.fire({
        icon: resultado.creado ? "success" : "info",
        title: resultado.creado ? "Prospecto agregado" : "Prospecto ya existia",
        text: resultado.creado
          ? `${empresa.empresa} fue guardada en el CRM Comercial.`
          : `${empresa.empresa} ya estaba registrada en el CRM, por eso no se duplico.`,
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo agregar al CRM",
        text: error.message,
      });
    } finally {
      setAgregandoId(null);
    }
  }

  function consultarIA(pregunta) {
    const texto = pregunta?.trim();
    if (!texto) return;
    setRespuestaIA(generarRespuestaIAComercial(texto, prospectos, empresas));
  }

  function actualizarEmpresaManual(campo, valor) {
    setEmpresaManual((actual) => ({ ...actual, [campo]: valor }));
  }

  function agregarEmpresaManual(evento) {
    evento.preventDefault();
    const nombre = empresaManual.empresa.trim();
    if (!nombre) return;

    const nuevaEmpresa = {
      ...empresaManual,
      empresa: nombre,
      numTrabajadores: Number(empresaManual.numTrabajadores || 0),
      idTemporal: `manual-${Date.now()}`,
      potencial: 68,
      estadoProspeccion: "Encontrada",
    };

    setEmpresas((actuales) => [nuevaEmpresa, ...actuales]);
    setRespuestaIA(
      `${nuevaEmpresa.empresa} fue agregada a la lista de revision. Si el contacto es publico y el dolor parece real, agregala al CRM y usa la IA Comercial para preparar el primer mensaje.`
    );
    setEmpresaManual((actual) => ({ ...actual, empresa: "", telefono: "", correo: "", sitioWeb: "" }));
  }

  const metricas = useMemo(() => {
    const guardados = prospectos.filter((p) => p.origen === "Prospeccion IA").length;
    const conCorreo = empresas.filter((e) => e.correo).length;
    const altoPotencial = empresas.filter((e) => Number(e.potencial) >= 70).length;

    return [
      { label: "Empresas encontradas", value: empresas.length, hint: "Busqueda actual" },
      { label: "Con correo publico", value: conCorreo, hint: "Listas para correo" },
      { label: "Alto potencial", value: altoPotencial, hint: "Prioridad comercial" },
      { label: "Guardadas en CRM", value: guardados, hint: "Origen Prospeccion IA" },
    ];
  }, [empresas, prospectos]);

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-5 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-blue-600">Tactika Suite</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
              Agente de ventas
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Herramienta interna para buscar empresas, revisar datos publicos, guardarlas como
              prospectos y preparar el primer contacto desde Tactika Consulting.
            </p>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-4 min-w-64">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Sparkles size={16} className="text-blue-300" />
              Flujo recomendado
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Buscar → Revisar → Agregar al CRM → Contactar → Diagnostico.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricas.map((metrica, index) => (
          <div
            key={metrica.label}
            className={`border rounded-xl p-5 shadow-sm ${
              index === 0 ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200"
            }`}
          >
            <p className={`text-sm font-semibold ${index === 0 ? "text-slate-300" : "text-slate-500"}`}>
              {metrica.label}
            </p>
            <p className="text-3xl font-bold mt-3">{metrica.value}</p>
            <p className={`text-xs mt-2 ${index === 0 ? "text-slate-400" : "text-slate-400"}`}>
              {metrica.hint}
            </p>
          </div>
        ))}
      </div>

      <BuscadorProspectos filtros={filtros} onChange={setFiltros} onBuscar={buscar} />

      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">Registro manual</p>
            <h2 className="text-xl font-bold text-slate-800 mt-1">Empresa encontrada en busqueda real</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Copia solo datos publicos de Google, Maps, Instagram o el sitio de la empresa. Luego
              revisa el dolor probable antes de agregarla al CRM.
            </p>
          </div>
        </div>

        <form onSubmit={agregarEmpresaManual} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Empresa</span>
            <input value={empresaManual.empresa} onChange={(e) => actualizarEmpresaManual("empresa", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" required />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Rubro</span>
            <input value={empresaManual.giro} onChange={(e) => actualizarEmpresaManual("giro", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Comuna</span>
            <input value={empresaManual.comuna} onChange={(e) => actualizarEmpresaManual("comuna", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Trabajadores</span>
            <input type="number" value={empresaManual.numTrabajadores} onChange={(e) => actualizarEmpresaManual("numTrabajadores", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Telefono publico</span>
            <input value={empresaManual.telefono} onChange={(e) => actualizarEmpresaManual("telefono", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Correo publico</span>
            <input value={empresaManual.correo} onChange={(e) => actualizarEmpresaManual("correo", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
          </label>
          <label className="space-y-1.5 xl:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Web / Instagram</span>
            <input value={empresaManual.sitioWeb} onChange={(e) => actualizarEmpresaManual("sitioWeb", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Dolor probable</span>
            <input value={empresaManual.dolorPrincipal} onChange={(e) => actualizarEmpresaManual("dolorPrincipal", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Necesidad posible</span>
            <input value={empresaManual.necesidad} onChange={(e) => actualizarEmpresaManual("necesidad", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
          </label>
          <div className="md:col-span-2 xl:col-span-4">
            <button type="submit" className="min-h-10 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition inline-flex items-center gap-2">
              <Plus size={16} />
              Agregar a revision
            </button>
          </div>
        </form>
      </section>

      <EmpresasEncontradasTable
        empresas={empresas}
        agregandoId={agregandoId}
        onAgregar={agregarAlCRM}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <IAComercialPanel
            pregunta={preguntaIA}
            respuesta={respuestaIA}
            onPreguntaChange={setPreguntaIA}
            onConsultar={consultarIA}
          />
        </div>

        <ProspectosGuardadosPanel prospectos={prospectos} />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <Megaphone size={20} className="text-blue-600" />
          <h3 className="text-base font-bold text-slate-800 mt-3">Campañas</h3>
          <p className="text-sm text-slate-500 mt-1">
            Usa las campañas del CRM para preparar mensajes manuales por WhatsApp o correo.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <CalendarClock size={20} className="text-amber-600" />
          <h3 className="text-base font-bold text-slate-800 mt-3">Seguimiento</h3>
          <p className="text-sm text-slate-500 mt-1">
            Cada prospecto agregado queda listo para tareas, proximo contacto e historial comercial.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <Route size={20} className="text-green-600" />
          <h3 className="text-base font-bold text-slate-800 mt-3">Implementacion</h3>
          <p className="text-sm text-slate-500 mt-1">
            La siguiente fase conectara cliente, proyecto, plan de trabajo y modulos contratados.
          </p>
        </div>
      </section>

      <section className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3 text-sm text-green-900">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        <p>
          Version segura: no envia mensajes automaticamente, no consulta datos privados y no guarda
          empresas encontradas hasta que presionas Agregar al CRM.
        </p>
      </section>
    </div>
  );
}
