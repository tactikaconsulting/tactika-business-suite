export default function Dashboard() {
  const cumplimientoGlobal = 100;
  
  return (
    <div className="space-y-6">
      {/* Encabezado Corporativo */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Táctika Consulting</h2>
          <p className="text-xs text-slate-400 mt-0.5">RUT: 78.224.832-4 | Auditoría Activa por Táctika Consulting</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Índice de Cumplimiento Legal</span>
          <span className={`text-3xl font-black ${cumplimientoGlobal < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {cumplimientoGlobal}%
          </span>
        </div>
      </div>

      {/* Grilla de Pilares */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-base mb-4">Recursos Humanos</h3>
        </div>
      </div>
    </div>
  );
}