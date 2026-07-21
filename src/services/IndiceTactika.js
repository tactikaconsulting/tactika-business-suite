/**
 * Calcula el Índice Táctika de un prospecto (0-100).
 * Recibe el objeto del formulario/prospecto y retorna el puntaje.
 */
export function calcularIndiceTactika(prospecto) {
  let puntaje = 0;

  if (!prospecto.usaSoftware) puntaje += 20;
  if (prospecto.softwareActual?.toLowerCase().includes("excel")) puntaje += 15;
  if (Number(prospecto.numTrabajadores) > 10) puntaje += 10;
  if (!prospecto.sitioWeb) puntaje += 10;
  if (prospecto.muchoTrabajoAdministrativo) puntaje += 15;
  if (prospecto.problemaDetectado?.trim()) puntaje += 15;
  if (prospecto.interesAlto) puntaje += 15;
  if (prospecto.necesidadUrgente) puntaje += 10;

  return Math.min(puntaje, 100);
}

/**
 * Traduce el puntaje a una categoría con color, para mostrar en badges.
 */
export function categoriaIndiceTactika(puntaje) {
  if (puntaje >= 81) return { label: "Prioridad Máxima", color: "red" };
  if (puntaje >= 61) return { label: "Alto", color: "amber" };
  if (puntaje >= 31) return { label: "Medio", color: "blue" };
  return { label: "Bajo", color: "gray" };
}