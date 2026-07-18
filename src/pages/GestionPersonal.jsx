import React, { useState, useEffect } from 'react';

export default function GestionPersonal() {
  const [personal, setPersonal] = useState([]);
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [contrato, setContrato] = useState('Escriturado y Vigente');
  const [epp, setEpp] = useState('Firmado por Trabajador');
  const [odi, setOdi] = useState('Acreditada en Carpeta');

  useEffect(() => {
    // Al cargar, solo buscamos lo que ya exista, SIN cargar ejemplos por defecto
    const guardados = localStorage.getItem('tactika_personal_captacion');
    if (guardados) {
      setPersonal(JSON.parse(guardados));
    }
  }, []);

  const handleAgregar = (e) => {
    e.preventDefault();
    if (!nombre || !cargo) return alert('Ingresa nombre y cargo.');

    let multa = 0;
    if (contrato !== 'Escriturado y Vigente') multa += 1400000;
    if (epp !== 'Firmado por Trabajador') multa += 1400000;
    if (odi !== 'Acreditada en Carpeta') multa += 1400000;

    const nuevoTrabajador = {
      id: crypto.randomUUID(),
      nombre,
      cargo,
      contrato,
      epp,
      odi,
      multaEstimada: multa,
      fechaRegistro: new Date().toLocaleDateString('es-CL')
    };

    const nuevos = [...personal, nuevoTrabajador];
    setPersonal(nuevos);
    localStorage.setItem('tactika_personal_captacion', JSON.stringify(nuevos));
    
    // Limpiar formulario
    setNombre('');
    setCargo('');
  };

  const totalRiesgo = personal.reduce((acc, cur) => acc + cur.multaEstimada, 0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-blue-400">Auditoría de Riesgo Laboral</h2>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Riesgo Económico Total</span>
          <span className="text-3xl font-black text-rose-400">${totalRiesgo.toLocaleString('es-CL')} CLP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleAgregar} className="space-y-4">
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Nombre" />
            <input type="text" value={cargo} onChange={e => setCargo(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Cargo" />
            <select value={contrato} onChange={e => setContrato(e.target.value)} className="w-full p-2 border rounded-lg">
              <option>Escriturado y Vigente</option>
              <option>Vencido</option>
              <option>Sin Contrato</option>
            </select>
            <select value={epp} onChange={e => setEpp(e.target.value)} className="w-full p-2 border rounded-lg">
              <option>Firmado por Trabajador</option>
              <option>Pendiente</option>
            </select>
            <select value={odi} onChange={e => setOdi(e.target.value)} className="w-full p-2 border rounded-lg">
              <option>Acreditada en Carpeta</option>
              <option>Pendiente</option>
            </select>
            <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg">Calcular</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-slate-400 text-xs uppercase">
                <th className="pb-3 text-left">Nombre</th>
                <th className="pb-3">Contrato</th>
                <th className="pb-3">EPP</th>
                <th className="pb-3">ODI</th>
                <th className="pb-3 text-right">Multa</th>
              </tr>
            </thead>
            <tbody>
              {personal.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="py-3 font-semibold">{p.nombre}</td>
                  <td className="text-center">{p.contrato === 'Escriturado y Vigente' ? '✅' : '❌'}</td>
                  <td className="text-center">{p.epp === 'Firmado por Trabajador' ? '✅' : '❌'}</td>
                  <td className="text-center">{p.odi === 'Acreditada en Carpeta' ? '✅' : '❌'}</td>
                  <td className="text-right font-bold text-rose-600">${p.multaEstimada.toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}