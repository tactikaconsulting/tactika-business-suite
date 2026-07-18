const KEY = "diagnosticos";

export function obtenerDiagnosticos() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function guardarDiagnostico(diagnostico) {
  const diagnosticos = obtenerDiagnosticos();

  diagnosticos.push({
    id: crypto.randomUUID(),
    fecha: new Date().toLocaleDateString("es-CL"),
    ...diagnostico,
  });

  localStorage.setItem(KEY, JSON.stringify(diagnosticos));
}

export function eliminarDiagnostico(id) {
  const diagnosticos = obtenerDiagnosticos().filter(
    (d) => d.id !== id
  );

  localStorage.setItem(KEY, JSON.stringify(diagnosticos));
}

export function obtenerResultado(preguntas) {
  const total = preguntas.reduce(
    (acumulado, pregunta) => acumulado + Number(pregunta.valor),
    0
  );

  const promedio = total / preguntas.length;

  return Math.round(promedio * 20);
}