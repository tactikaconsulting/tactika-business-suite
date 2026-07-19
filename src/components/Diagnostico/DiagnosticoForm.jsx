import { useState } from "react";

const preguntas = [
  {
    categoria: "Estrategia",
    items: [
      "La empresa tiene misión definida",
      "La empresa tiene visión definida",
      "Existen objetivos estratégicos"
    ]
  },
  {
    categoria: "Marketing",
    items: [
      "Existe un plan de marketing",
      "Se realizan campañas digitales",
      "Se mide la satisfacción del cliente"
    ]
  }
];

export default function DiagnosticoForm({ onGuardar, clientes = [] }) {
  const [clienteId, setClienteId] = useState("");

  const [respuestas, setRespuestas] = useState(
    preguntas.flatMap((categoria) =>
      categoria.items.map((pregunta) => ({
        categoria: categoria.categoria,
        pregunta,
        valor: 3,
      }))
    )
  );

  function cambiarValor(index, valor) {
    const copia = [...respuestas];
    copia[index].valor = Number(valor);
    setRespuestas(copia);
  }

  function guardar(e) {
    e.preventDefault();

    const cliente = clientes.find((c) => c.id === clienteId);

    onGuardar({
      clienteId,
      empresa: cliente ? cliente.nombre : "",
      preguntas: respuestas,
    });

    setClienteId("");

    setRespuestas(
      preguntas.flatMap((categoria) =>
        categoria.items.map((pregunta) => ({
          categoria: categoria.categoria,
          pregunta,
          valor: 3,
        }))
      )
    );
  }

  let indice = 0;

  return (
    <form
      onSubmit={guardar}
      className="bg-white rounded-xl shadow-lg p-8 space-y-8"
    >
      <div>
        <label className="block font-semibold mb-2">
          Empresa
        </label>

        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          required
          className="w-full border rounded-lg p-3"
        >
          <option value="">-- Seleccionar Cliente --</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </option>
          ))}
        </select>

        {clientes.length === 0 && (
          <p className="text-xs text-red-500 mt-2">
            No hay clientes registrados todavía. Ve a "Clientes" y registra al menos una empresa antes de crear un diagnóstico.
          </p>
        )}
      </div>

      {preguntas.map((categoria) => (
        <div key={categoria.categoria}>
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            {categoria.categoria}
          </h2>

          <div className="space-y-4">
            {categoria.items.map((pregunta) => {
              const actual = indice++;

              return (
                <div key={pregunta} className="border rounded-lg p-4">
                  <p className="font-medium mb-3">{pregunta}</p>

                  <select
                    value={respuestas[actual].valor}
                    onChange={(e) => cambiarValor(actual, e.target.value)}
                    className="border rounded-lg p-2"
                  >
                    <option value="1">1 - Muy Deficiente</option>
                    <option value="2">2 - Deficiente</option>
                    <option value="3">3 - Aceptable</option>
                    <option value="4">4 - Bueno</option>
                    <option value="5">5 - Excelente</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
        Guardar Diagnóstico
      </button>
    </form>
  );
}