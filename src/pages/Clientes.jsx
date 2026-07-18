import React, { useState, useEffect } from 'react';

export default function Clientes() {
  const [empresas, setEmpresas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Campos del Formulario para Empresas Cliente
  const [razonSocial, setRazonSocial] = useState('');
  const [rutEmpresa, setRutEmpresa] = useState('');
  const [sector, setSector] = useState('Servicios');
  const [tamano, setTamano] = useState('Pequeña (10-49)');
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoEmail, setContactoEmail] = useState('');

  useEffect(() => {
    const guardadas = localStorage.getItem('tactika_empresas_clientes');
    if (guardadas) setEmpresas(JSON.parse(guardadas));
  }, []);

  const guardarEnLocalStorage = (nuevas) => {
    setEmpresas(nuevas);
    localStorage.setItem('tactika_empresas_clientes', JSON.stringify(nuevas));
  };

  const handleGuardarEmpresa = (e) => {
    e.preventDefault();
    if (!razonSocial || !rutEmpresa) return alert('Por favor rellena los datos principales');

    const nuevaEmpresa = {
      id: crypto.randomUUID(),
      razonSocial,
      rutEmpresa,
      sector,
      tamano,
      contactoNombre,
      contactoEmail,
      fechaRegistro: new Date().toLocaleDateString('es-CL'),
      estado: 'Diagnóstico Pendiente',
      diagnosticosRealizados: 0,
      planesAccionActivos: 0
    };

    const listaActualizada = [...empresas, nuevaEmpresa];
    guardarEnLocalStorage(listaActualizada);

    // Limpiar formulario
    setRazonSocial(''); setRutEmpresa(''); setContactoNombre(''); setContactoEmail('');
    setModalAbierto(false);
  };

  const getBadgeColor = (estado) => {
    if (estado === 'Activo') return 'bg-green-100 text-green-800 border border-green-200';
    if (estado === 'En Diagnóstico') return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (estado === 'Diagnóstico Pendiente') return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Cartera de Clientes</h2>
          <p className="text-sm text-slate-500 mt-1">Administración de empresas cliente, sectores comerciales y estado de consultoría corporativa.</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          + Agregar Empresa Cliente
        </button>
      </div>

      {/* TABLA DE EMPRESAS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {empresas.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No tienes empresas cliente registradas aún. Haz clic en "Agregar Empresa Cliente" para iniciar tu cartera.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4">Empresa / RUT</th>
                  <th className="p-4">Sector / Tamaño</th>
                  <th className="p-4">Contacto Principal</th>
                  <th className="p-4 text-center">Diagnósticos</th>
                  <th className="p-4 text-center">Planes Activos</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {empresas.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-900">
                      {emp.razonSocial}
                      <br />
                      <span className="text-xs text-slate-400 font-normal">RUT: {emp.rutEmpresa}</span>
                    </td>
                    <td className="p-4">
                      {emp.sector}
                      <br />
                      <span className="text-xs text-slate-400 font-normal">{emp.tamano}</span>
                    </td>
                    <td className="p-4">
                      {emp.contactoNombre || 'No asignado'}
                      <br />
                      <span className="text-xs text-slate-400 font-normal">{emp.contactoEmail}</span>
                    </td>
                    <td className="p-4 text-center font-semibold text-slate-600">{emp.diagnosticosRealizados}</td>
                    <td className="p-4 text-center font-semibold text-slate-600">{emp.planesAccionActivos}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getBadgeColor(emp.estado)}`}>
                        {emp.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: FORMULARIO DE AGREGAR EMPRESA */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Registrar Empresa Cliente</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <form onSubmit={handleGuardarEmpresa} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Razón Social / Nombre Empresa</label>
                <input type="text" required value={razonSocial} onChange={e => setRazonSocial(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ej. Táctika Consulting SpA" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">RUT Empresa</label>
                <input type="text" required value={rutEmpresa} onChange={e => setRutEmpresa(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="76.123.456-K" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sector Económico</label>
                  <select value={sector} onChange={e => setSector(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Minería">Minería</option>
                    <option value="Construcción">Construcción</option>
                    <option value="Manufactura">Manufactura</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Retail / Comercio">Retail / Comercio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tamaño Empresa</label>
                  <select value={tamano} onChange={e => setTamano(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Micro (1-9)">Micro (1-9)</option>
                    <option value="Pequeña (10-49)">Pequeña (10-49)</option>
                    <option value="Mediana (50-149)">Mediana (50-149)</option>
                    <option value="Grande (150+)">Grande (150+)</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-3 border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Contacto de la Empresa</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Nombre Contraparte</label>
                    <input type="text" value={contactoNombre} onChange={e => setContactoNombre(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ej. Carlos Mendoza" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Email de Contacto</label>
                    <input type="email" value={contactoEmail} onChange={e => setContactoEmail(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="carlos@empresa.cl" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 text-sm font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm">Registrar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}