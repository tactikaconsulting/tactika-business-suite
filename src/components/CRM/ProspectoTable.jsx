import IndiceTactikaBadge from "./IndiceTactikaBadge";

const estadoColor = {
  "Prospecto": "bg-gray-100 text-gray-700",
  "Contactado": "bg-blue-100 text-blue-700",
  "Diagnóstico Agendado": "bg-cyan-100 text-cyan-700",
  "Diagnóstico Realizado": "bg-indigo-100 text-indigo-700",
  "Propuesta Enviada": "bg-amber-100 text-amber-700",
  "Negociación": "bg-orange-100 text-orange-700",
  "Cliente": "bg-green-100 text-green-700",
  "Perdido": "bg-red-100 text-red-700",
};

export default function ProspectoTable({ prospectos, onEditar, onEliminar }) {
  if (prospectos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center text-slate-400">
        No hay prospectos registrados todavía.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-800 text-white">
          <tr>
            <th className="p-3 text-left">Empresa</th>
            <th className="p-3 text-left">Contacto</th>
            <th className="p-3 text-left">Comuna</th>
            <th className="p-3 text-left">Índice Táctika</th>
            <th className="p-3 text-left">Estado</th>
            <th className="p-3 text-left">Próximo contacto</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {prospectos.map((p) => {
            const atrasado = p.fechaProximoContacto && new Date(p.fechaProximoContacto) < new Date() && p.estado !== "Cliente" && p.estado !== "Perdido";
            return (
              <tr key={p.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-medium">{p.empresa}</td>
                <td className="p-3">{p.contactoNombre || "—"}</td>
                <td className="p-3">{p.comuna || "—"}</td>
                <td className="p-3"><IndiceTactikaBadge puntaje={p.indiceTactika} /></td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${estadoColor[p.estado] || "bg-gray-100 text-gray-700"}`}>
                    {p.estado}
                  </span>
                </td>
                <td className="p-3">
                  {p.fechaProximoContacto ? (
                    <span className={atrasado ? "text-red-600 font-semibold" : ""}>
                      {p.fechaProximoContacto}{atrasado ? " · Atrasado" : ""}
                    </span>
                  ) : "—"}
                </td>
                <td className="p-3 text-center space-x-3 whitespace-nowrap">
                  <button onClick={() => onEditar(p)} className="text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => onEliminar(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}