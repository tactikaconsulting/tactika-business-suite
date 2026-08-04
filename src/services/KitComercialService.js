import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const precios = [
  ["Diagnostico Empresarial Tactika", "Desde $29.990", "Entrada para entender procesos, dolores y oportunidades."],
  ["Implementacion Tactika Suite", "Desde $199.990", "Configuracion inicial, modulos, capacitacion y puesta en marcha."],
  ["Acompanamiento mensual", "Desde $49.900/mes", "Soporte, mejoras, seguimiento y evolucion del sistema."],
];

const servicios = [
  "Diagnostico empresarial",
  "Plan de accion 30-60-90",
  "Implementacion de Tactika Suite",
  "CRM comercial y seguimiento",
  "Reportes y control de gestion",
  "Acompanamiento mensual",
];

const metodo = [
  ["1. Descubrir", "Entendemos como trabaja la empresa y donde se pierde tiempo, informacion o control."],
  ["2. Disenar", "Definimos prioridades, procesos, indicadores y una hoja de ruta simple."],
  ["3. Implementar", "Configuramos Tactika Suite segun las necesidades reales de la empresa."],
  ["4. Evolucionar", "Acompanamos con seguimiento, mejoras y nuevos modulos cuando el negocio crece."],
];

export function crearMensajeKitComercial() {
  return [
    "Hola, te comparto una presentacion breve de Tactika Consulting.",
    "",
    "Ayudamos a pymes a ordenar su gestion mediante diagnostico, plan de accion y una plataforma adaptada a la forma de trabajar de cada empresa.",
    "",
    "El primer paso recomendado es un Diagnostico Empresarial Tactika para detectar oportunidades de mejora antes de implementar cualquier sistema.",
    "",
    "Si te hace sentido, podemos coordinar una conversacion breve para revisar si aplica a tu empresa.",
    "",
    "Claudio Urra",
    "Tactika Consulting",
  ].join("\n");
}

export function crearLinkWhatsAppKit(telefono = "") {
  const limpio = String(telefono || "").replace(/\D/g, "");
  const destino = limpio ? `56${limpio.replace(/^56/, "")}` : "";
  return `https://wa.me/${destino}?text=${encodeURIComponent(crearMensajeKitComercial())}`;
}

export function crearLinkCorreoKit(correo = "") {
  const asunto = "Presentacion Tactika Consulting";
  return `mailto:${correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(
    crearMensajeKitComercial()
  )}`;
}

function footer(doc) {
  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Tactika Consulting - Diagnostico, tecnologia y acompanamiento", 14, 286);
    doc.text(`Pagina ${pagina} de ${totalPaginas}`, 178, 286);
  }
}

function parrafo(doc, texto, x, y, ancho = 180, altoLinea = 5) {
  const lineas = doc.splitTextToSize(texto, ancho);
  doc.text(lineas, x, y);
  return y + lineas.length * altoLinea;
}

export function descargarKitComercialPDF() {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString("es-CL");

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 42, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("Tactika Consulting", 14, 18);
  doc.setFontSize(12);
  doc.text("Kit Comercial para Pymes", 14, 29);
  doc.setFontSize(9);
  doc.text(`Fecha: ${fecha}`, 160, 29);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.text("Ordenamos tu empresa con diagnostico, plan y sistema", 14, 58);

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  let y = parrafo(
    doc,
    "Tactika Consulting ayuda a pequenas y medianas empresas a ordenar su gestion, mejorar el seguimiento comercial y tomar mejores decisiones mediante consultoria, tecnologia y acompanamiento.",
    14,
    70
  );

  y += 8;
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Que hacemos", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Servicio", "Valor para la empresa"]],
    body: servicios.map((servicio) => [
      servicio,
      servicio === "Diagnostico empresarial"
        ? "Detectar problemas reales antes de invertir en tecnologia."
        : servicio === "Implementacion de Tactika Suite"
          ? "Centralizar clientes, tareas, ventas, reportes y seguimiento."
          : "Mejorar control, orden y continuidad operacional.",
    ]),
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 62, fontStyle: "bold" },
      1: { cellWidth: 112 },
    },
  });

  y = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Metodo Tactika", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Etapa", "Descripcion"]],
    body: metodo,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: "bold" },
      1: { cellWidth: 129 },
    },
  });

  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("Tactika Suite", 14, 24);

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  y = parrafo(
    doc,
    "La plataforma no es un ERP generico. Es la herramienta con la que Tactika Consulting capta prospectos, administra clientes, implementa soluciones y acompana la mejora continua.",
    14,
    36
  );

  y += 8;
  autoTable(doc, {
    startY: y,
    head: [["Modulo", "Para que sirve"]],
    body: [
      ["CRM Comercial", "Gestionar prospectos, mensajes, propuestas y seguimiento."],
      ["Prospeccion IA", "Buscar oportunidades y priorizar empresas con potencial."],
      ["Diagnosticos", "Evaluar la situacion actual de la empresa."],
      ["Implementaciones", "Controlar tareas, modulos y avance del proyecto."],
      ["Portal Cliente", "Mostrar avance, documentos, servicios y plan de trabajo."],
      ["Decisiones y Playbook", "Ayudar a vender mejor con datos y guiones comerciales."],
    ],
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: "bold" },
      1: { cellWidth: 124 },
    },
  });

  y = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Valores iniciales", 14, y);

  autoTable(doc, {
    startY: y + 8,
    head: [["Servicio", "Valor referencial", "Incluye"]],
    body: precios,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 52, fontStyle: "bold" },
      1: { cellWidth: 38 },
      2: { cellWidth: 84 },
    },
  });

  y = doc.lastAutoTable.finalY + 14;
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14, y, 182, 38, 3, 3, "F");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("Siguiente paso recomendado", 22, y + 12);
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  parrafo(
    doc,
    "Agendar un Diagnostico Empresarial Tactika para revisar procesos, dolores y oportunidades antes de definir una implementacion.",
    22,
    y + 22,
    162
  );

  footer(doc);
  doc.save("Kit_Comercial_Tactika_Consulting.pdf");
}
