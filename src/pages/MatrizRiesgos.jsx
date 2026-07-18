import React, { useState, useEffect } from 'react';

export default function MatrizRiesgos() {
  const [riesgos, setRiesgos] = useState([]);
  const [area, setArea] = useState('Operaciones');
  const [peligro, setPeligro] = useState('');
  const [criticidad, setCriticidad] = useState('Media');

  useEffect(() => {
    const guardados = localStorage.getItem('tactika_matriz_riesgos');
    if (guardados) setRiesgos(JSON.parse(guardados));
  }, []);

  const handleAgregar = (e) => {
    e.preventDefault();
    if (!peligro) return alert('Describe el peligro.');

    const nuevoRiesgo = {
      id: crypto.randomUUID(),
      area,
      peligro,
      criticidad
    };

    const nuevos = [...riesgos, nuevoRiesgo];
    setRiesgos(nuevos);
    localStorage.setItem('tactika_matriz_riesgos', JSON.stringify(nuevos));
    setPeligro('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Matriz de Riesgos (PCC)</h2>
        <p className="text-sm text-slate-500">Identificación técnica de peligros operacionales y niveles críticos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Levantar Peligro</h3>
          <form onSubmit={handleAgregar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Área afectada</label>
              <select value={area} onChange={e => setArea(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white">
                <option value="Operaciones">Operaciones / Faena</option>
                <option value="Bodega">Bodega / Logística</option>
                <option value="Administración">Administración</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Descripción del Peligro</label>
              <textarea value={peligro} onChange={e => setPeligro(e.target.value)} rows="3" className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Ej: Falta de señalización en zona de tránsito de grúas..."></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Criticidad Evaluada</label>
              <select value={criticidad} onChange={e => setCriticidad(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white">
                <option value="Baja">🟢 Baja</option>
                <option value="Media">🟡 Media</option>
                <option value="Alta / Crítica">🔴 Alta / Crítica</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-slate-800 text-white text-sm font-medium py-2.5 rounded-lg">Registrar en Matriz</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Registro de Hallazgos Técnicos</h3>
          <div className="space-y-3">
            {riesgos.map(r => (
              <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded uppercase">{r.area}</span>
                  <p className="text-sm text-slate-700 mt-2 font-medium">{r.peligro}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-black shrink-0 ${
                  r.criticidad === 'Baja' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  r.criticidad === 'Media' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>{r.criticidad}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}