import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatoCLP(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CL");
}

function limpiarNombre(nombre) {
  return String(nombre || "Prospecto").replace(/[^\w-]+/g, "_");
}

function texto(valor, fallback = "-") {
  return valor || fallback;
}

export function descargarPropuestaPDF(prospecto, propuesta) {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString("es-CL");

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 34, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Tactika Consulting", 14, 16);
  doc.setFontSize(11);
  doc.text("Propuesta Comercial", 14, 25);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text(propuesta.titulo || "Propuesta comercial", 14, 48);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha: ${fecha}`, 14, 56);
  doc.text(`Estado: ${texto(propuesta.estado)}`, 14, 62);

  autoTable(doc, {
    startY: 72,
    head: [["Dato", "Informacion"]],
    body: [
      ["Empresa", texto(prospecto.empresa)],
      ["Rubro", texto(prospecto.giro)],
      ["Contacto", texto(prospecto.contactoNombre)],
      ["Correo", texto(prospecto.correo)],
      ["Telefono", texto(prospecto.telefono)],
      ["Comuna", texto(prospecto.comuna)],
    ],
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: "bold" },
      1: { cellWidth: 128 },
    },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Concepto", "Detalle"]],
    body: [
      ["Plan sugerido", texto(propuesta.plan)],
      ["Implementacion", formatoCLP(propuesta.valorImplementacion)],
      ["Mensualidad", formatoCLP(propuesta.valorMensual)],
      ["Fecha de envio", texto(propuesta.fechaEnvio)],
    ],
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: "bold" },
      1: { cellWidth: 128 },
    },
  });

  let y = doc.lastAutoTable.finalY + 12;

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("Alcance de la propuesta", 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const alcance = doc.splitTextToSize(texto(propuesta.alcance), 180);
  doc.text(alcance, 14, y);
  y += alcance.length * 5 + 10;

  if (y > 245) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("Condiciones comerciales", 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const condiciones = doc.splitTextToSize(texto(propuesta.condiciones), 180);
  doc.text(condiciones, 14, y);

  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Tactika Consulting - Diagnostico, tecnologia y gestion para empresas",
      14,
      286
    );
    doc.text(`Pagina ${pagina} de ${totalPaginas}`, 178, 286);
  }

  doc.save(`Propuesta_${limpiarNombre(prospecto.empresa)}.pdf`);
}
