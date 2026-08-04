function limpiarTexto(valor) {
  return String(valor || "")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function fechaBase(evento) {
  if (!evento?.fecha) return new Date();
  const fecha = new Date(evento.fecha);
  if (Number.isNaN(fecha.getTime())) return new Date();
  return fecha;
}

function fechaCalendario(fecha) {
  return fecha.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function rangoEvento(evento) {
  const inicio = fechaBase(evento);
  inicio.setHours(10, 0, 0, 0);
  const fin = new Date(inicio);
  fin.setMinutes(fin.getMinutes() + 45);
  return { inicio, fin };
}

function descripcionSegura(evento) {
  return [
    `Tipo: ${evento.tipo || "Agenda"}`,
    `Prioridad: ${evento.prioridad || "Media"}`,
    `Estado: ${evento.estado || "Pendiente"}`,
    "Revisar detalle completo dentro de Tactika Business Suite.",
  ].join("\n");
}

export function descargarRecordatorioICS(evento) {
  const { inicio, fin } = rangoEvento(evento);
  const ahora = fechaCalendario(new Date());
  const contenido = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tactika Consulting//Tactika Suite//ES",
    "BEGIN:VEVENT",
    `UID:${evento.id}@tactikaconsulting.com`,
    `DTSTAMP:${ahora}`,
    `DTSTART:${fechaCalendario(inicio)}`,
    `DTEND:${fechaCalendario(fin)}`,
    `SUMMARY:${limpiarTexto(`Tactika - ${evento.titulo}`)}`,
    `DESCRIPTION:${limpiarTexto(descripcionSegura(evento))}`,
    "LOCATION:Tactika Business Suite",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${limpiarTexto(`Recordatorio Tactika - ${evento.titulo}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([contenido], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tactika-${evento.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
