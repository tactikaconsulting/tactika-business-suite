import React, { useState } from 'react';

export default function Configuracion() {
  const [nombreConsultora, setNombreConsultora] = useState('Táctika Consulting');
  const [rutConsultora, setRutConsultora] = useState('77.654.321-5');
  const [region, setRegion] = useState('Región Metropolitana');
  const [exito, setExito] = useState(false);

  const handleGuardarConfig = (e) => {
    e.preventDefault();
    setExito(true);
    setTimeout(() => setExito(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Configuración del Sistema</h2>
        <p className="text-sm text-slate-500 mt-1">
          Administra las variables globales de la suite, datos de tu firma de consultoría y parámetros técnicos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PERFIL DE LA CONSULTORA */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-base mb-4">Datos Corporativos de la Firma</h3>
          
          <form onSubmit={handleGuardarConfig} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre Comercial de la Suite</label>
                <input 
                  type="text" 
                  value={nombreConsultora} 
                  onChange={e => setNombreConsultora(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">RUT Empresa Emisora</label>
                <input 
                  type="text" 
                  value={rutConsultora} 
                  onChange={e => setRutConsultora(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ubicación Casa Matriz</label>
              <input 
                type="text" 
                value={region} 
                onChange={e => setRegion(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              {exito ? (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                  ✓ Cambios del sistema actualizados con éxito
                </span>
              ) : <div />}
              <button type="submit" className="bg-slate-800 hover:bg-slate-950 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors">
                Guardar Ajustes
              </button>
            </div>
          </form>
        </div>

        {/* VISTA PREVIA FUTUROS ASESORES */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-base">Control de Equipo</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Próximamente, cuando conectemos la base de datos en la nube, desde aquí podrás invitar a tus asesores adjuntando su correo electrónico y definiendo sus permisos de edición.
            </p>
            
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">Claudio (Tú)</p>
                  <p className="text-slate-400">Administrador Global</p>
                </div>
                <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-sm scale-90">Root</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
                <span>Espacio disponible para Asesor...</span>
                <span className="border border-dashed px-2 py-0.5 rounded-sm scale-90">Bloqueado</span>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-[11px] text-amber-800 leading-relaxed mt-4">
            <strong>Fase de Diseño Completa:</strong> Toda la interfaz interactiva de la Suite está lista para pasar a la integración con servidores.
          </div>
        </div>
      </div>
    </div>
  );
}