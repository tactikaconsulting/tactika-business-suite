export default function ClienteSearch({ buscar, setBuscar }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <label className="block text-sm font-semibold text-gray-600 mb-2">
        Buscar empresa
      </label>

      <input
        type="text"
        placeholder="Buscar por empresa, RUT, contacto o correo..."
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
}