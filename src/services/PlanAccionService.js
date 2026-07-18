const KEY = "planesAccion";

export function obtenerPlanes() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function guardarPlan(plan) {
  const planes = obtenerPlanes();

  planes.push({
    id: crypto.randomUUID(),
    fecha: new Date().toLocaleDateString("es-CL"),
    estado: "Pendiente",
    ...plan,
  });

  localStorage.setItem(KEY, JSON.stringify(planes));
}

export function eliminarPlan(id) {
  const planes = obtenerPlanes().filter(
    (plan) => plan.id !== id
  );

  localStorage.setItem(KEY, JSON.stringify(planes));
}

export function actualizarEstado(id, estado) {
  const planes = obtenerPlanes().map((plan) =>
    plan.id === id
      ? { ...plan, estado }
      : plan
  );

  localStorage.setItem(KEY, JSON.stringify(planes));
}