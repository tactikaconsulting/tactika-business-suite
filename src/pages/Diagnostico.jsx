import React, { useState, useEffect } from 'react';

// Preguntas base de evaluación corporativa para Táctika Consulting
const EVALUACION_PREGUNTAS = [
  { id: 'p1', area: 'Estrategia', texto: '¿La empresa cuenta con objetivos comerciales claros, medibles y comunicados a la organización?' },
  { id: 'p2', area: 'Procesos', texto: '¿Existen manuales de procedimientos y flujos operativos definidos para las tareas críticas?' },
  { id: 'p3', area: 'Personas / RRHH', texto: '¿Se implementan planes formales de inducción, capacitación continua y contratos al día?' },
  { id: 'p4', area: 'Cumplimiento Legal', texto: '¿La empresa cumple cabalmente con las normativas vigentes del sector y prevención de riesgos?' },
  { id: 'p5', area: 'Tecnología', texto: '¿Cuentan con herramientas digitales, softwares o automatizaciones para optimizar la gestión?' }
];

export default function Diagnostico() {
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionadaId, setEmpresaSeleccionadaId] = useState('');
  
  // Estado para capturar las respuestas del diagnóstico (Puntajes del 1 al 5)
  const [respuestas, setRespuestas] = useState({ p1: 3, p2: 3, p3: 3, p4: 3, p5: 3 });
  const [observaciones, setObservaciones] = useState('');
  const [diagnosticoGuardado, setDiagnosticoGuardado] = useState(false);

  useEffect(() => {
    const guardadas = localStorage.getItem('tactika_empresas_clientes');
    if (guardadas) setEmpresas(JSON.parse(guardadas));
  }, []);

  const handleCambiarPuntaje = (preguntaId, valor) => {
    setRespuestas({ ...respuestas, [preguntaId]: parseInt(valor) });
  };

  const handleFinalizarDiagnostico = (e) => {
    e.preventDefault();
    if (!empresaSeleccionadaId) return alert('Por favor, selecciona una empresa cliente para diagnosticar.');

    // 1. Calcular el promedio general obtenido
    const puntajes = Object.values(respuestas);
    const suma = puntajes.reduce((a, b) => a + b, 0);
    const promedio = (suma / puntajes.length).toFixed(1);

    // 2. Actualizar el contador y estado en la lista de empresas de localStorage
    const empresasActualizadas = empresas.map(emp => {
      if (emp.id === empresaSeleccionadaId) {
        return {
          ...emp,
          diagnosticosRealizados: (emp.diagnosticosRealizados || 0) + 1,
          estado: 'En Diagnóstico', // Sube de nivel el estado de consultoría
          ultimoPuntaje: promedio,
          observacionesDiagnostico: observaciones
        };
      }
      return emp;
    });

    // 3. Guardar en memoria local
    setEmpresas(empresasActualizadas);
    localStorage.setItem('tactika_empresas_clientes', JSON.stringify(empresasActualizadas));

    // Mostrar feedback visual de éxito
    setDiagnosticoGuardado(true);
    setObservaciones('');
    setTimeout(() => setDiagnosticoGuardado(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ENCABEZADO */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Módulo de Diagnóstico</h2>
        <p className="text-sm text-slate-500 mt-1">
          Levantamiento de información, auditoría interna y matriz de madurez corporativa para clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL IZQUIERDO: SELECCIÓN DE EMPRESA */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 text-base">1. Control de Auditoría</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Seleccionar Empresa Cliente</label>
            <select
              value={empresaSeleccionadaId}
              onChange={(e) => setEmpresaSeleccionadaId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Elegir Cliente Registrado --</option>
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.razonSocial} ({emp.rutEmpresa})</option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-blue-700 leading-relaxed">
            <strong>Criterio de Evaluación:</strong><br />
            Asigna una puntuación de 1 a 5 donde:<br />
            • 1 = Crítico (Inexistente)<br />
            • 3 = En desarrollo (Incompleto)<br />
            • 5 = Excelente (Maduro u Optimizado)
          </div>

          {diagnosticoGuardado && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium text-center animate-pulse">
              ✓ ¡Diagnóstico guardado y vinculado con éxito a la empresa! Revisa el Dashboard o Clientes para ver reflejados los cambios.
            </div>
          )}
        </div>

        {/* PANEL DERECHO: FORMULARIO TÉCNICO DE EVALUACIÓN */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-base mb-5">2. Matriz de Madurez Corporativa</h3>
          
          <form onSubmit={handleFinalizarDiagnostico} className="space-y-6">
            <div className="space-y-5 divide-y divide-slate-100">
              {EVALUACION_PREGUNTAS.map((p, index) => (
                <div key={p.id} className={`pt-4 ${index === 0 ? 'pt-0' : ''} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                  <div className="max-w-md">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                      Área: {p.area}
                    </span>
                    <p className="text-sm font-medium text-slate-700 mt-1.5">{p.texto}</p>
                  </div>
                  
                  {/* Selector de nivel 1 al 5 */}
                  <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200 w-fit self-end md:self-center">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleCambiarPuntaje(p.id, num)}
                        className={`w-9 h-8 text-xs font-bold rounded-md transition-all ${
                          respuestas[p.id] === num
                            ? 'bg-blue-600 text-white shadow-sm scale-105'
                            : 'text-slate-400 hover:bg-slate-200/50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* NOTAS ADICIONALES */}
            <div className="border-t pt-5 border-slate-100">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Conclusiones / Notas del Consultor Táctika</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows="3"
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
                placeholder="Ingresa aquí las principales debilidades encontradas o hallazgos clave de la auditoría corporativa..."
              ></textarea>
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                Finalizar y Registrar Diagnóstico
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}