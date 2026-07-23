import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { obtenerClientes } from "../services/ClienteService";
import { obtenerDiagnosticos } from "../services/DiagnosticoService";
import { obtenerPlanes } from "../services/PlanAccionService";

function coincidePorNombre(nombreCliente, textoEmpresa) {
  if (!nombreCliente || !textoEmpresa) return false;
  return nombreCliente.trim().toLowerCase() === textoEmpresa.trim().toLowerCase();
}

function perteneceACliente(registro, cliente) {
  if (registro.clienteId) return registro.clienteId === cliente.id;
  return coincidePorNombre(cliente.nombre, registro.empresa);
}

export default function Reportes() {
  const [clientes, setClientes] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const [dataClientes, dataDiagnosticos, dataPlanes] = await Promise.all([
      obtenerClientes(),
      obtenerDiagnosticos(),
      obtenerPlanes(),
    ]);

    setClientes(dataClientes);
    setDiagnosticos(dataDiagnosticos);
    setPlanes(dataPlanes);
  }

  const cliente = clientes.find((c) => c.id === clienteSeleccionadoId) || null;

  const diagnosticosCliente = cliente
    ? diagnosticos.filter((d) => perteneceACliente(d, cliente))
    : [];

  const planesCliente = cliente
    ? planes.filter((p) => perteneceACliente(p, cliente))
    : [];

  const ultimoDiagnostico =
    diagnosticosCliente.length > 0
      ? diagnosticosCliente[diagnosticosCliente.length - 1]
      : null;

  const promedioResultado =
    diagnosticosCliente.length > 0
      ? Math.round(
          diagnosticosCliente.reduce((acc, d) => acc + Number(d.resultado || 0), 0) /
            diagnosticosCliente.length
        )
      : 0;

  const planesActivos = planesCliente.filter((p) => p.estado !== "Finalizado").length;

  const pilares = [];
  if (ultimoDiagnostico?.preguntas?.length) {
    const categorias = {};
    ultimoDiagnostico.preguntas.forEach((p) => {
      if (!categorias[p.categoria]) categorias[p.categoria] = [];
      categorias[p.categoria].push(Number(p.valor));
    });

    Object.entries(categorias).forEach(([nombre, valores]) => {
      const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
      pilares.push({ area: nombre, valor: promedio.toFixed(1) });
    });
  }

  function exportarExcel() {
    if (!cliente) return;

    const libro = XLSX.utils.book_new();

    const resumen = [
      ["Informe de Cliente", ""],
      ["Empresa", cliente.nombre],
      ["RUT", cliente.rut || "—"],
      ["Giro", cliente.giro || "—"],
      ["Contacto", cliente.contacto || "—"],
      ["Estado", cliente.estado || "—"],
      ["", ""],
      ["Diagnósticos realizados", diagnosticosCliente.length],
      ["Resultado promedio", diagnosticosCliente.length > 0 ? `${promedioResultado}%` : "Sin mediciones"],
      ["Planes activos", planesActivos],
    ];
    const hojaResumen = XLSX.utils.aoa_to_sheet(resumen);
    XLSX.utils.book_append_sheet(libro, hojaResumen, "Resumen");

    if (pilares.length > 0) {
      const filasPilares = [["Área", "Promedio (1-5)"], ...pilares.map((p) => [p.area, p.valor])];
      const hojaPilares = XLSX.utils.aoa_to_sheet(filasPilares);
      XLSX.utils.book_append_sheet(libro, hojaPilares, "Análisis por Pilar");
    }

    if (planesCliente.length > 0) {
      const filasPlanes = [
        ["Área", "Acción", "Responsable", "Prioridad", "Fecha límite", "Estado"],
        ...planesCliente.map((p) => [
          p.area,
          p.accion,
          p.responsable,
          p.prioridad,
          p.fechaLimite || "—",
          p.estado,
        ]),
      ];
      const hojaPlanes = XLSX.utils.aoa_to_sheet(filasPlanes);
      XLSX.utils.book_append_sheet(libro, hojaPlanes, "Planes de Acción");
    }

    XLSX.writeFile(libro, `Informe_${cliente.nombre.replace(/\s+/g, "_")}.xlsx`);
  }

  function exportarPDF() {
    if (!cliente) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Informe de Cliente — Táctika Consulting", 14, 18);

    doc.setFontSize(11);
    doc.text(`Empresa: ${cliente.nombre}`, 14, 30);
    doc.text(`RUT: ${cliente.rut || "—"}`, 14, 37);
    doc.text(`Giro: ${cliente.giro || "—"}`, 14, 44);
    doc.text(`Contacto: ${cliente.contacto || "—"}`, 14, 51);
    doc.text(`Estado: ${cliente.estado || "—"}`, 14, 58);
    doc.text(
      `Resultado promedio de diagnósticos: ${diagnosticosCliente.length > 0 ? promedioResultado + "%" : "Sin mediciones"}`,
      14,
      65
    );

    let y = 75;

    if (pilares.length > 0) {
      doc.setFontSize(13);
      doc.text("Análisis por Pilar de Negocio", 14, y);
      autoTable(doc, {
        startY: y + 4,
        head: [["Área", "Promedio (1-5)"]],
        body: pilares.map((p) => [p.area, p.valor]),
        theme: "grid",
        headStyles: { fillColor: [30, 41, 59] },
      });
      y = doc.lastAutoTable.finalY + 12;
    }

    if (planesCliente.length > 0) {
      doc.setFontSize(13);
      doc.text("Planes de Acción", 14, y);
      autoTable(doc, {
        startY: y + 4,
        head: [["Área", "Acción", "Responsable", "Prioridad", "Fecha límite", "Estado"]],
        body: planesCliente.map((p) => [
          p.area,
          p.accion,
          p.responsable,
          p.prioridad,
          p.fechaLimite || "—",
          p.estado,
        ]),
        theme: "grid",
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 8 },
      });
    }

    doc.save(`Informe_${cliente.nombre.replace(/\s+/g, "_")}.pdf`);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Informes y Reportes</h2>
          <p className="text-sm text-slate-500 mt-1">
            Visualización de resultados de diagnósticos y estatus de planes de acción por cliente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {cliente && (
            <>
              <button
                onClick={exportarExcel}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
              >
                Descargar Excel
              </button>
              <button
                onClick={exportarPDF}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition"
              >
                Descargar PDF
              </button>
            </>
          )}

          <div className="w-64">
            <select
              value={clienteSeleccionadoId}
              onChange={(e) => setClienteSeleccionadoId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-700 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Seleccionar Cliente --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!cliente ? (
        <div className="p-16 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl bg-white">
          Por favor, selecciona una empresa cliente en el menú superior derecho para desplegar su reporte.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
              <div className="border-b pb-3 border-slate-50">
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded uppercase">
                  Ficha de Cliente
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{cliente.nombre}</h3>
                <p className="text-xs text-slate-400 mt-0.5">RUT: {cliente.rut || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Giro</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{cliente.giro || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Contacto</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{cliente.contacto || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Diagnósticos</p>
                  <p className="text-slate-700 font-semibold mt-0.5">
                    {diagnosticosCliente.length} realizados
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Planes Activos</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{planesActivos} activos</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50">
                <p className="text-xs text-slate-400 font-medium mb-1">Estado del Cliente:</p>
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100 inline-block">
                  {cliente.estado}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-xl shadow-md text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resultado Promedio de Diagnósticos
              </p>
              <p className="text-5xl font-black text-white mt-4 mb-2">
                {diagnosticosCliente.length > 0 ? `${promedioResultado}%` : "—"}
              </p>
              <p className="text-xs text-slate-400">
                {diagnosticosCliente.length > 0
                  ? `Basado en ${diagnosticosCliente.length} diagnóstico(s)`
                  : "Aún no hay diagnósticos registrados"}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-300">
                {promedioResultado >= 80
                  ? "Nivel Avanzado / Optimizado"
                  : promedioResultado >= 60
                  ? "Nivel Intermedio / En Desarrollo"
                  : diagnosticosCliente.length > 0
                  ? "Nivel Crítico / Requiere Intervención"
                  : "Sin mediciones registradas"}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 text-base mb-4">
                Análisis por Pilar de Negocio
              </h4>

              {pilares.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No hay diagnósticos registrados para calcular este análisis.
                </p>
              ) : (
                <div className="space-y-4">
                  {pilares.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>{item.area}</span>
                        <span className="text-slate-800">{item.valor} / 5.0</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${(parseFloat(item.valor) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 text-base mb-4">
                Planes de Acción del Cliente
              </h4>

              {planesCliente.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No hay planes de acción registrados para este cliente.
                </p>
              ) : (
                <ul className="space-y-3">
                  {planesCliente.map((plan) => (
                    <li
                      key={plan.id}
                      className="flex justify-between items-center border-b pb-2 text-sm"
                    >
                      <div>
                        <p className="text-slate-700 font-medium">{plan.accion}</p>
                        <p className="text-slate-400 text-xs">
                          {plan.area} · {plan.responsable}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          plan.estado === "Finalizado"
                            ? "bg-green-100 text-green-700"
                            : plan.estado === "En Proceso"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {plan.estado}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}