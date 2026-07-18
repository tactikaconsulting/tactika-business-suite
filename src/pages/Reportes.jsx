import React, { useState, useEffect } from 'react';

export default function Reportes() {
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionadaId, setEmpresaSeleccionadaId] = useState('');
  const [empresaData, setEmpresaData] = useState(null);

  useEffect(() => {
    const guardadas = localStorage.getItem('tactika_empresas_clientes');
    if (guardadas) setEmpresas(JSON.parse(guardadas));
  }, []);

  useEffect(() => {
    if (empresaSeleccionadaId) {
      const encontrada = empresas.find(e => e.id === empresaSeleccionadaId);
      setEmpresaData(encontrada || null);
    } else {
      setEmpresaData(null);
    }
  }, [empresaSeleccionadaId, empresas]);

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Informes y Reportes</h2>
          <p className="text-sm text-slate-500 mt-1">
            Visualización de resultados de auditorías, promedios de gestión y estatus de planes de acción.
          </p>
        </div>
        
        {/* SELECTOR DE EMPRESA PARA EL INFORME */}
        <div className="w-64">
          <select
            value={empresaSeleccionadaId}
            onChange={(e) => setEmpresaSeleccionadaId(e.target.value)}
            className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-700 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- Seleccionar Cliente --</option>
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.razonSocial}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VISTA DEL REPORTE */}
      {!empresaData ? (
        <div className="p-16 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl bg-white">
          Por favor, selecciona una empresa cliente en el menú superior derecho para desplegar su reporte de madurez corporativa.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* COLUMNA IZQUIERDA: RESUMEN EJECUTIVO */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
              <div className="border-b pb-3 border-slate-50">
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded uppercase">
                  Ficha de Cliente
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{empresaData.razonSocial}</h3>
                <p className="text-xs text-slate-400 mt-0.5">RUT: {empresaData.rutEmpresa}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Sector Industrial</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{empresaData.sector}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Segmento</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{empresaData.tamano}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Diagnósticos</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{empresaData.diagnosticosRealizados || 0} hechos</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Planes Corriendo</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{empresaData.planesAccionActivos || 0} activos</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50">
                <p className="text-xs text-slate-400 font-medium mb-1">Estado de Consultoría:</p>
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100 inline-block">
                  {empresaData.estado}
                </span>
              </div>
            </div>

            {/* CARD DE PUNTAJE GLOBAL */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-xl shadow-md text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Índice de Madurez Corporativa</p>
              <p className="text-5xl font-black text-white mt-4 mb-2">
                {empresaData.ultimoPuntaje || '0.0'}
              </p>
              <p className="text-xs text-slate-400">Escala Técnica de 1.0 a 5.0 puntos</p>
              
              <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-300">
                {empresaData.ultimoPuntaje >= 4 ? 'Nivel Avanzado / Optimizado' :
                 empresaData.ultimoPuntaje >= 3 ? 'Nivel Intermedio / En Desarrollo' :
                 empresaData.ultimoPuntaje > 0 ? 'Nivel Crítico / Requiere Intervención' : 'Sin mediciones registradas'}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: HALLAZGOS Y ESTRATEGIA */}
          <div className="lg:col-span-2 space-y-6">
            {/* NOTAS DE AUDITORÍA */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 text-base mb-3">Conclusiones del Diagnóstico</h4>
              <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600 italic leading-relaxed border border-slate-100">
                {empresaData.observacionesDiagnostico || "No se han ingresado notas adicionales en el último diagnóstico realizado."}
              </div>
            </div>

            {/* RENDIMIENTO SIMULADO POR ÁREA */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 text-base mb-4">Análisis por Pilar de Negocio</h4>
              
              <div className="space-y-4">
                {[
                  { area: 'Estrategia Comercial', valor: empresaData.ultimoPuntaje ? Math.min(5, parseFloat(empresaData.ultimoPuntaje) + 0.4).toFixed(1) : '0.0', color: 'bg-blue-600' },
                  { area: 'Procesos Operativos', valor: empresaData.ultimoPuntaje || '0.0', color: 'bg-indigo-600' },
                  { area: 'Recursos Humanos', valor: empresaData.ultimoPuntaje ? Math.max(1, parseFloat(empresaData.ultimoPuntaje) - 0.5).toFixed(1) : '0.0', color: 'bg-amber-500' },
                  { area: 'Cumplimiento Normativo / Riesgos', valor: empresaData.ultimoPuntaje || '0.0', color: 'bg-emerald-600' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>{item.area}</span>
                      <span className="text-slate-800">{item.valor} / 5.0</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all duration-500`} 
                        style={{ width: `${(parseFloat(item.valor) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}