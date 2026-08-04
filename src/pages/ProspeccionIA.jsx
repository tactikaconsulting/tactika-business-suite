import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Megaphone, Route, ShieldCheck, Sparkles } from "lucide-react";
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
              Prospección IA
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Motor comercial para encontrar empresas, revisarlas, guardarlas como prospectos y
              preparar el primer contacto desde Tactika Consulting.
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
