import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [personal, setPersonal] = useState([]);

  useEffect(() => {
    // Lee los datos guardados en el navegador
    const guardados = localStorage.getItem('tactika_personal_captacion');
    if (guardados) {
      setPersonal(JSON.parse(guardados));
    } else {
      // Datos por defecto (si el sistema está vacío)
      setPersonal([]); 
    }
  }, []);

  // Cálculos automáticos
  const totalTrabajadores = personal.length;
  const contratosAlDia = personal.filter(p => p.contrato === 'Al Día').length;
  const contratosAlertas = totalTrabajadores - contratosAlDia;
  
  const eppFirmados = totalTrabajadores > 0 
    ? Math.round((personal.filter(p => p.epp === 'Firmado').length / totalTrabajadores) * 100) 
    : 100;
    
  const odiAlDia = totalTrabajadores > 0 
    ? Math.round((personal.filter(p => p.odi === 'Al Día').length / totalTrabajadores) * 100) 
    : 100;

  const riesgoMultasTotal = personal.reduce((acc, cur) => acc + (cur.multaEstimada || 0), 0);
  const riesgosCriticos = personal.filter(p => p.odi === 'Pendiente' && p.epp === 'Pendiente').length;

  let cumplimientoGlobal = 100;
  if (totalTrabajadores > 0) {
    const factorContratos = (contratosAlDia / totalTrabajadores) * 100;
    cumplimientoGlobal = Math.round((factorContratos + eppFirmados + odiAlDia) / 3);
  }

  return (
    <div className="space-y-6">
      {/* Encabezado Corporativo */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Panel de Control General</span>
          <h2 className="text-2xl font-black text-white">Tactika Consulting</h2>
          <p className="text-xs text-slate-400 mt-0.5">RUT: 78.224.832-4| Auditoría Activa por Táctika Consulting</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-6 py-3 rounded-lg text-center w-full md:w-auto">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Índice de Cumplimiento Legal</span>
          <span className={`text-3xl font-black ${cumplimientoGlobal < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {cumplimientoGlobal}%
          </span>
        </div>
      </div>

      {/* Grilla de Pilares */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card RRHH */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-base mb-4">⚖️ Recursos Humanos</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Total Auditados:</span> <span className="font-bold">{totalTrabajadores}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Contratos Al Día:</span> <span className="font-bold text-emerald-600">{contratosAlDia}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Alertas/Vencidos:</span> <span className="font-bold text-rose-600">{contratosAlertas}</span></div>
          </div>
        </div>

        {/* Card Prevención */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-base mb-4">🛡️ Prevención de Riesgos</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Cobertura EPP:</span> <span className="font-bold">{eppFirmados}%</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Inducciones ODI:</span> <span className="font-bold">{odiAlDia}%</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Puntos Críticos:</span> <span className="font-bold text-rose-600">{riesgosCriticos}</span></div>
          </div>
        </div>

        {/* Card Finanzas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-base mb-4">📊 Finanzas & Contingencia</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Exposición a Multas:</span> <span className="font-bold text-rose-600">${riesgoMultasTotal.toLocaleString('es-CL')}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Estado:</span> <span className={`font-bold ${riesgoMultasTotal > 2000000 ? 'text-rose-600' : 'text-emerald-600'}`}>{riesgoMultasTotal > 2000000 ? 'Crítico' : 'Controlado'}</span></div>
          </div>
        </div>
      </div>

      {/* Botón de reinicio */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={() => {
            if (window.confirm('¿Limpiar toda la base de datos para una nueva presentación?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-[10px] uppercase font-bold text-slate-400 hover:text-rose-500 transition-colors"
        >
          ⚙️ Reiniciar sistema
        </button>
      </div>
    </div>
  );
}