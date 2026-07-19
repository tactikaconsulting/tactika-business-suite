const STORAGE_KEY = "seguimientos";

/**
 * Obtiene todos los seguimientos
 */
export function obtenerSeguimientos() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Guarda un nuevo seguimiento o actualiza uno existente
 */
export function guardarSeguimiento(seguimiento) {
  const seguimientos = obtenerSeguimientos();

  if (seguimiento.id) {
    const index = seguimientos.findIndex((s) => s.id === seguimiento.id);

    if (index !== -1) {
      seguimientos[index] = seguimiento;
    }
  } else {
    seguimiento.id = Date.now();
    seguimiento.fechaCreacion = new Date().toLocaleDateString("es-CL");
    seguimientos.push(seguimiento);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seguimientos));
}

/**
 * Elimina un seguimiento
 */
export function eliminarSeguimiento(id) {
  const seguimientos = obtenerSeguimientos().filter(
    (s) => s.id !== id
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seguimientos));
}

/**
 * Obtiene un seguimiento por ID
 */
export function obtenerSeguimiento(id) {
  return obtenerSeguimientos().find(
    (s) => s.id === id
  );
}

/**
 * Estadísticas
 */
export function obtenerEstadisticasSeguimiento() {
  const seguimientos = obtenerSeguimientos();

  return {
    total: seguimientos.length,

    pendientes: seguimientos.filter(
      (s) => s.estado === "Pendiente"
    ).length,

    proceso: seguimientos.filter(
      (s) => s.estado === "En proceso"
    ).length,

    completados: seguimientos.filter(
      (s) => s.estado === "Completado"
    ).length,
  };
}

/**
 * Calcula el porcentaje de avance
 */
export function calcularAvance() {
  const seguimientos = obtenerSeguimientos();

  if (seguimientos.length === 0) return 0;

  const completados = seguimientos.filter(
    (s) => s.estado === "Completado"
  ).length;

  return Math.round(
    (completados / seguimientos.length) * 100
  );
}