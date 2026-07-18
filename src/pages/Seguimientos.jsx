import React, { useState, useEffect } from 'react';

export default function Seguimientos() {
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionadaId, setEmpresaSeleccionadaId] = useState('');
  
  // Campos para la nueva bitácora de seguimiento
  const [tipoActividad, setTipoActividad] = useState('Reunión de Avance');
  const [detalle, setDetalle] = useState('');
  const [compromisos, setCompromisos] = useState('');

  // Lista local para mostrar el historial de actividades de la empresa seleccionada
  const [historialSeguimientos, setHistorialSeguimientos] = useState([]);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    const guardadas = localStorage.getItem('tactika_empresas_clientes');
    if (guardadas) setEmpresas(JSON.parse(guardadas));

    const segs = localStorage.getItem('tactika_historial_seguimientos');
    if (segs) setHistorialSeguimientos(JSON.parse(segs));
  }, []);

  const handleGuardarSeguimiento = (e) => {
    e.preventDefault();
    if (!empresaSeleccionadaId) return alert('Por favor selecciona una empresa.');
    if (!detalle) return alert('Por favor detalla lo conversado en la actividad.');

    const empresa = empresas.find(e => e.id === empresaSeleccionadaId);

    const nuevoHito = {
      id: crypto.randomUUID(),
      empresaId: empresaSeleccionadaId,
      empresaNombre: empresa.razonSocial,
      tipoActividad,
      detalle,
      compromisos,
      fecha: new Date().toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const nuevoHistorial = [nuevoHito, ...historialSeguimientos];
    setHistorialSeguimientos(nuevoHistorial);
    localStorage.setItem('tactika_historial_seguimientos', JSON.stringify(nuevoHistorial));

    // Cambiar dinámicamente el estado en la lista de empresas si corresponde
    const empresasActualizadas = empresas.map(emp => {
      if (emp.id === empresaSeleccionadaId && emp.estado === 'Diagnóstico Pendiente') {
        return { ...emp, estado: 'En Diagnóstico' };
      }
      return emp;
    });
    setEmpresas(empresasActualizadas);
    localStorage.setItem('tactika_empresas_clientes', JSON.stringify(empresasActualizadas));

    // Resetear campos del formulario
    setDetalle('');
    setCompromisos('');
    setExito(true);
    setTimeout(() => setExito(false), 3000);
  };

  // Filtrar el historial según la empresa seleccionada para la línea de tiempo
  const hitosFiltrados = historialSeguimientos.filter(h => h.empresaId === empresaSeleccionadaId);

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Bitácora de Seguimiento</h2>
        <p className="text-sm text-slate-500 mt-1">
          Registro histórico de reuniones, acuerdos, minutas de consultoría y compromisos adquiridos con las contrapartes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL IZQUIERDO: REGISTRO DE REUNIÓN / LLAMADA */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="font-bold text-slate-800 text-base mb-4">Registrar Nueva Actividad</h3>
          
          <form onSubmit={handleGuardarSeguimiento} className="space-y-4">
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
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipo de Contacto</label>
              <select 
                value={tipoActividad} 
                onChange={e => setTipoActividad(e.target.value)} 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Reunión de Avance">Reunión de Avance (Presencial/Online)</option>
                <option value="Llamada Telefónica">Llamada Telefónica</option>
                <option value="Envío de Avance">Envío de Informes / Correo</option>
                <option value="Auditoría en Terreno">Auditoría / Visita en Terreno</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Minuta / Detalle de lo conversado</label>
              <textarea 
                value={detalle}
                onChange={e => setDetalle(e.target.value)}
                rows="4"
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400" 
                placeholder="Escribe los puntos clave tratados con el cliente..."
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Compromisos / Próximos pasos</label>
              <input 
                type="text" 
                value={compromisos}
                onChange={e => setCompromisos(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                placeholder="Ej: Cliente enviará balances antes del viernes"
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-sm">
              Registrar en Historial
            </button>

            {exito && (
              <p className="text-xs text-center font-medium text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 animate-fadeIn">
                ✓ Actividad registrada en la línea de tiempo.
              </p>
            )}
          </form>
        </div>

        {/* PANEL DERECHO: LÍNEA DE TIEMPO (TIMELINE) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-base mb-4">Línea de Tiempo del Cliente</h3>
          
          {!empresaSeleccionadaId ? (
            <div className="p-12 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              Selecciona una empresa en el panel izquierdo para ver toda su bitácora cronológica de consultoría.
            </div>
          ) : hitosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              No hay actividades registradas aún para este cliente. Agrega la primera minuta usando el formulario.
            </div>
          ) : (
            <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6">
              {hitosFiltrados.map((hito) => (
                <div key={hito.id} className="relative">
                  {/* Punto del Timeline */}
                  <span className="absolute -left-[31px] top-1.5 bg-blue-600 w-4 h-4 rounded-full border-4 border-white shadow-xs"></span>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded">
                          {hito.tipoActividad}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">{hito.fecha}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                      {hito.detalle}
                    </p>

                    {hito.compromisos && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-start space-x-1.5 text-xs">
                        <span className="font-bold text-amber-600">🎯 Compromiso:</span>
                        <span className="text-slate-600 italic">{hito.compromisos}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}