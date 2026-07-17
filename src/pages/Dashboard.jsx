export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">
        Dashboard
      </h1>

      <p className="text-slate-500 mt-2">
        Bienvenido a Táctika Business Suite
      </p>

      <div className="grid grid-cols-4 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Clientes</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Planes activos</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Diagnósticos</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Reportes</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  );
}