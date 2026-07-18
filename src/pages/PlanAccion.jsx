import React, { useState, useEffect } from 'react';

export default function PlanAccion() {
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionadaId, setEmpresaSeleccionadaId] = useState('');
  
  // Campos para la nueva iniciativa estratégica
  const [tituloAccion, setTituloAccion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  const [plazo, setPlazo] = useState('');

  // Estado para simular feedback
  const [exito, setExito] = useState(false);

  useEffect(() => {
    const guardadas = localStorage.getItem('tactika_empresas_clientes');
    if (guardadas) setEmpresas(JSON.parse(guardadas));
  }, []);

  const handleCrearPlan = (e) => {
    e.preventDefault();
    if (!empresaSeleccionadaId) return alert('Por favor selecciona una empresa cliente.');
    if (!tituloAccion) return alert('Por favor ingresa el título de la acción.');

    // Actualizar la empresa sumándole un plan activo y cambiando su estado global a "Activo"
    const empresasActualizadas = empresas.map(emp => {
      if (emp.id === empresaSeleccionadaId) {
        return {
          ...emp,
          planesAccionActivos: (emp.planesAccionActivos || 0) + 1,
          estado: 'Activo', // Sube el estado comercial a Activo (con estrategia corriendo)
          ultimoPlanTitulo: tituloAccion,
          ultimoPlanPlazo: plazo
        };
      }
      return emp;
    });

    // Guardar en el almacenamiento local
    setEmpresas(empresasActualizadas);
    localStorage.setItem('tactika_empresas_clientes', JSON.stringify(empresasActualizadas));

    // Feedback visual y limpiar formulario
    setExito(true);
    setTituloAccion('');
    setDescripcion('');
    setPlazo('');
    setTimeout(() => setExito(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Planes de Acción</h2>
        <p className="text-sm text-slate-500 mt-1">
          Diseño de estrategias de mitigación, asignación de objetivos corporativos y plazos de ejecución técnica.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORMULARIO DE CREACIÓN */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="font-bold text-slate-800 text-base mb-4">Nueva Acción Correctiva</h3>
          
          <form onSubmit={handleCrearPlan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Empresa Cliente</label>
              <select
                value={empresaSeleccionadaId}
                onChange={(e) => setEmpresaSeleccionadaId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Seleccionar Empresa --</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.razonSocial}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Título de la Medida</label>
              <input 
                type="text" 
                value={tituloAccion}
                onChange={e => setTituloAccion(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                placeholder="Ej: Implementar Software ERP o Comité Paritario"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Detalle / Objetivo</label>
              <textarea 
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows="3"
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400" 
                placeholder="Describe los pasos clave para concretar esta meta..."
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Prioridad</label>
                <select value={prioridad} onChange={e => setPrioridad(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha Límite</label>
                <input 
                  type="date" 
                  value={plazo}
                  onChange={e => setPlazo(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-sm mt-2">
              Lanzar Plan Estratégico
            </button>

            {exito && (
              <p className="text-xs text-center font-medium text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 animate-fadeIn">
                ✓ Plan vinculado y activado correctamente.
              </p>
            )}
          </form>
        </div>

        {/* MONITOR DE PLANES ASIGNADOS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-base mb-4">Estrategias en Ejecución</h3>
          
          <div className="space-y-4">
            {empresas.filter(e => e.planesAccionActivos > 0).length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                No hay planes de acción activos ejecutándose en este momento. Diseña uno usando el panel izquierdo.
              </div>
            ) : (
              empresas.filter(e => e.planesAccionActivos > 0).map(emp => (
                <div key={emp.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl flex justify-between items-start hover:border-slate-200 transition-all shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      {emp.razonSocial}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800 pt-1">{emp.ultimoPlanTitulo}</h4>
                    <p className="text-xs text-slate-500">
                      Esta empresa tiene un total de <span className="font-semibold text-slate-700">{emp.planesAccionActivos}</span> iniciativa(s) en desarrollo.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] bg-amber-50 text-amber-700 font-medium px-2 py-1 rounded border border-amber-200">
                      Plazo: {emp.ultimoPlanPlazo || 'Por definir'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}