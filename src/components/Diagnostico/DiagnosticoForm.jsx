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

export default function DiagnosticoForm({ onGuardar }) {
  const [empresa, setEmpresa] = useState("");

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

    onGuardar({
      empresa,
      preguntas: respuestas,
    });

    setEmpresa("");

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

        <input
          type="text"
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          required
          className="w-full border rounded-lg p-3"
          placeholder="Nombre de la empresa"
        />
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
                <div
                  key={pregunta}
                  className="border rounded-lg p-4"
                >
                  <p className="font-medium mb-3">
                    {pregunta}
                  </p>

                  <select
                    value={respuestas[actual].valor}
                    onChange={(e) =>
                      cambiarValor(actual, e.target.value)
                    }
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

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
      >
        Guardar Diagnóstico
      </button>
    </form>
  );
}