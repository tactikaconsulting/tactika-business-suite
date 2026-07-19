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