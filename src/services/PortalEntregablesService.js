import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function texto(valor, fallback = "-") {
  return valor || fallback;
}

function limpiarNombreArchivo(nombre) {
  return String(nombre || "cliente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "_");
}

function fechaActual() {
  return new Date().toLocaleDateString("es-CL");
}

function fechaVisible(valor) {
  if (!valor) return "-";
  return new Date(valor).toLocaleDateString("es-CL");
}

function modulosActivos(resumen) {
  return (resumen?.modulos || []).filter((item) => item.estado === "Activo");
}

function serviciosActivos(resumen) {
  return (resumen?.servicios || []).filter((item) => ["Activo", "Pagado"].includes(item.estado));
}

function tareasPendientes(resumen) {
  return (resumen?.tareas || []).filter((item) => item.estado !== "Completado");
}

export function crearMensajePortalCliente(resumen) {
  const cliente = resumen?.cliente;
  const implementacion = resumen?.implementacion;
  const pendientes = tareasPendientes(resumen);
  const modulos = modulosActivos(resumen);
  const ultimoEvento = resumen?.bitacora?.[0];

  const proximasTareas = pendientes
    .slice(0, 3)
    .map((tarea, index) => `${index + 1}. ${tarea.titulo} (${tarea.estado})`)
    .join("\n");

  return [
    `Hola${cliente?.contacto ? ` ${cliente.contacto}` : ""}, te comparto el resumen de avance de Tactika para ${texto(cliente?.nombre, "tu empresa")}.`,
    "",
    `Avance de implementacion: ${implementacion?.avance || 0}%`,
    `Etapa actual: ${texto(implementacion?.etapa, "Diagnostico inicial")}`,
    `Modulos activos: ${modulos.length > 0 ? modulos.map((item) => item.modulo).join(", ") : "sin modulos activos aun"}`,
    `Tareas pendientes: ${pendientes.length}`,
    "",
    proximasTareas ? `Proximos pasos:\n${proximasTareas}` : "No hay tareas pendientes registradas.",
    ultimoEvento?.proximoPaso ? `\nUltimo acuerdo: ${ultimoEvento.proximoPaso}` : "",
    "",
    "Quedo atento para coordinar el siguiente avance.",
    "Claudio Urra - Tactika Consulting",
  ].join("\n");
}

export function crearLinkWhatsAppPortal(resumen) {
  const telefono = String(resumen?.cliente?.telefono || "").replace(/\D/g, "");
  const destino = telefono ? `56${telefono.replace(/^56/, "")}` : "";
  return `https://wa.me/${destino}?text=${encodeURIComponent(crearMensajePortalCliente(resumen))}`;
}

export function crearLinkCorreoPortal(resumen) {
  const correo = resumen?.cliente?.email || "";
  const asunto = `Resumen de avance Tactika - ${texto(resumen?.cliente?.nombre, "Cliente")}`;
  return `mailto:${correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(
    crearMensajePortalCliente(resumen)
  )}`;
}

export function descargarResumenPortalPDF(resumen) {
  const doc = new jsPDF();
  const cliente = resumen?.cliente;
  const implementacion = resumen?.implementacion;
  const proyecto = resumen?.proyecto;
  const pendientes = tareasPendientes(resumen);
  const servicios = serviciosActivos(resumen);
  const valorContratado = servicios.reduce((sum, item) => sum + Number(item.valor || 0), 0);

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 34, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Tactika Consulting", 14, 16);
  doc.setFontSize(11);
  doc.text("Resumen Portal Cliente", 14, 25);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text(texto(cliente?.nombre, "Cliente"), 14, 48);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha de emision: ${fechaActual()}`, 14, 56);
  doc.text(`Responsable: ${texto(implementacion?.responsable, "Tactika Consulting")}`, 14, 62);

  autoTable(doc, {
    startY: 74,
    head: [["Resumen", "Estado actual"]],
    body: [
      ["Proyecto", texto(proyecto?.nombre, "Implementacion Tactika")],
      ["Etapa", texto(implementacion?.etapa, "Diagnostico inicial")],
      ["Avance", `${implementacion?.avance || 0}%`],
      ["Estado implementacion", texto(implementacion?.estado, "Pendiente")],
      ["Modulos activos", String(modulosActivos(resumen).length)],
      ["Tareas pendientes", String(pendientes.length)],
      ["Servicios contratados", formatoCLP.format(valorContratado)],
    ],
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold" },
      1: { cellWidth: 115 },
    },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Modulo", "Plan", "Estado"]],
    body:
      modulosActivos(resumen).length > 0
        ? modulosActivos(resumen).map((modulo) => [
            modulo.modulo,
            texto(modulo.plan),
            texto(modulo.estado),
          ])
        : [["Sin modulos activos", "-", "-"]],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 9 },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Tarea", "Prioridad", "Fecha", "Estado"]],
    body:
      pendientes.length > 0
        ? pendientes.map((tarea) => [
            tarea.titulo,
            texto(tarea.prioridad),
            texto(tarea.fechaLimite),
            texto(tarea.estado),
          ])
        : [["Sin tareas pendientes", "-", "-", "-"]],
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 8 },
  });

  if (servicios.length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Servicio", "Modalidad", "Valor", "Estado"]],
      body: servicios.map((servicio) => [
        servicio.servicio,
        texto(servicio.modalidad),
        formatoCLP.format(servicio.valor),
        texto(servicio.estado),
      ]),
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
    });
  }

  if ((resumen?.documentos || []).length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Documento", "Tipo", "Fecha", "Visibilidad"]],
      body: resumen.documentos.map((documento) => [
        documento.titulo,
        texto(documento.tipo),
        texto(documento.fechaDocumento),
        documento.visibleCliente ? "Cliente" : "Interno",
      ]),
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 },
    });
  }

  if ((resumen?.bitacora || []).length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Fecha", "Tipo", "Registro", "Proximo paso"]],
      body: resumen.bitacora.slice(0, 8).map((evento) => [
        fechaVisible(evento.fechaEvento),
        texto(evento.tipo),
        texto(evento.titulo),
        texto(evento.proximoPaso),
      ]),
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
    });
  }

  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Tactika Consulting - Metodo, tecnologia y acompanamiento", 14, 286);
    doc.text(`Pagina ${pagina} de ${totalPaginas}`, 178, 286);
  }

  doc.save(`Resumen_Tactika_${limpiarNombreArchivo(cliente?.nombre)}.pdf`);
}
