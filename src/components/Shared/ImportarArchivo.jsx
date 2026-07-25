import { useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import Swal from "sweetalert2";

/**
 * Componente reutilizable para importar Excel/CSV en cualquier módulo.
 *
 * Props:
 * - columnas: [{ clave: "empresa", etiqueta: "Empresa", requerido: true }, ...]
 *   Define qué campos espera el módulo (coinciden con las claves que usa tu servicio).
 * - onImportar: async (filas) => {}  — recibe un array de objetos ya mapeados
 * - nombreEntidad: "prospectos" (solo para textos de la interfaz)
 */
export default function ImportarArchivo({ columnas, onImportar, nombreEntidad = "registros" }) {
  const [abierto, setAbierto] = useState(false);
  const [filasArchivo, setFilasArchivo] = useState([]);
  const [encabezados, setEncabezados] = useState([]);
  const [mapeo, setMapeo] = useState({});
  const [paso, setPaso] = useState(1); // 1: subir archivo, 2: mapear columnas, 3: confirmar
  const [importando, setImportando] = useState(false);

  function resetear() {
    setFilasArchivo([]);
    setEncabezados([]);
    setMapeo({});
    setPaso(1);
  }

  function cerrar() {
    setAbierto(false);
    resetear();
  }

  function procesarDatos(encabezadosArchivo, filas) {
    setEncabezados(encabezadosArchivo);
    setFilasArchivo(filas);

    // Intenta pre-mapear automáticamente por coincidencia de nombre
    const mapeoInicial = {};
    columnas.forEach((col) => {
      const coincidencia = encabezadosArchivo.find(
        (h) => h.toLowerCase().trim() === col.etiqueta.toLowerCase().trim() ||
               h.toLowerCase().trim() === col.clave.toLowerCase().trim()
      );
      if (coincidencia) mapeoInicial[col.clave] = coincidencia;
    });
    setMapeo(mapeoInicial);
    setPaso(2);
  }

  function manejarArchivo(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const esCSV = archivo.name.toLowerCase().endsWith(".csv");

    if (esCSV) {
      Papa.parse(archivo, {
        header: true,
        skipEmptyLines: true,
        complete: (resultado) => {
          procesarDatos(resultado.meta.fields, resultado.data);
        },
      });
    } else {
      const lector = new FileReader();
      lector.onload = (evt) => {
        const libro = XLSX.read(evt.target.result, { type: "binary" });
        const hoja = libro.Sheets[libro.SheetNames[0]];
        const filas = XLSX.utils.sheet_to_json(hoja, { defval: "" });
        const encabezadosArchivo = filas.length > 0 ? Object.keys(filas[0]) : [];
        procesarDatos(encabezadosArchivo, filas);
      };
      lector.readAsBinaryString(archivo);
    }
  }

  async function confirmarImportacion() {
    const faltantes = columnas.filter((c) => c.requerido && !mapeo[c.clave]);
    if (faltantes.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Faltan columnas obligatorias",
        text: `Debes mapear: ${faltantes.map((f) => f.etiqueta).join(", ")}`,
      });
      return;
    }

    const registros = filasArchivo.map((fila) => {
      const registro = {};
      columnas.forEach((col) => {
        const columnaArchivo = mapeo[col.clave];
        registro[col.clave] = columnaArchivo ? String(fila[columnaArchivo] ?? "").trim() : "";
      });
      return registro;
    });

    setImportando(true);
    try {
      await onImportar(registros);
      Swal.fire({
        icon: "success",
        title: "Importación completa",
        text: `Se importaron ${registros.length} ${nombreEntidad}.`,
        timer: 2000,
        showConfirmButton: false,
      });
      cerrar();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error al importar", text: error.message });
    } finally {
      setImportando(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
      >
        Importar Excel/CSV
      </button>

      {abierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Importar {nombreEntidad}
              </h2>
              <button onClick={cerrar} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-6">
              {paso === 1 && (
                <div>
                  <p className="text-sm text-slate-500 mb-4">
                    Sube un archivo Excel (.xlsx) o CSV. La primera fila debe tener los nombres de las columnas.
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={manejarArchivo}
                    className="block w-full text-sm border rounded-lg p-2.5"
                  />
                </div>
              )}

              {paso === 2 && (
                <div>
                  <p className="text-sm text-slate-500 mb-4">
                    Indica qué columna de tu archivo corresponde a cada campo. Se detectaron {filasArchivo.length} filas.
                  </p>
                  <div className="space-y-3">
                    {columnas.map((col) => (
                      <div key={col.clave} className="grid grid-cols-2 gap-3 items-center">
                        <label className="text-sm font-medium text-slate-700">
                          {col.etiqueta} {col.requerido && <span className="text-red-500">*</span>}
                        </label>
                        <select
                          value={mapeo[col.clave] || ""}
                          onChange={(e) => setMapeo({ ...mapeo, [col.clave]: e.target.value })}
                          className="border rounded-lg p-2 text-sm"
                        >
                          <option value="">-- No importar --</option>
                          {encabezados.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <button onClick={resetear} className="text-sm text-slate-500 hover:underline">
                      ← Elegir otro archivo
                    </button>
                    <button
                      onClick={() => setPaso(3)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {paso === 3 && (
                <div>
                  <p className="text-sm text-slate-500 mb-4">
                    Vista previa de las primeras 5 filas. Revisa que los datos se vean correctos antes de importar.
                  </p>
                  <div className="overflow-x-auto border rounded-lg mb-4">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100">
                        <tr>
                          {columnas.map((col) => (
                            <th key={col.clave} className="p-2 text-left font-semibold">{col.etiqueta}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filasArchivo.slice(0, 5).map((fila, i) => (
                          <tr key={i} className="border-t">
                            {columnas.map((col) => (
                              <td key={col.clave} className="p-2">
                                {mapeo[col.clave] ? String(fila[mapeo[col.clave]] ?? "") : "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Se importarán {filasArchivo.length} filas en total.
                  </p>

                  <div className="flex justify-between">
                    <button onClick={() => setPaso(2)} className="text-sm text-slate-500 hover:underline">
                      ← Volver a mapear
                    </button>
                    <button
                      onClick={confirmarImportacion}
                      disabled={importando}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                      {importando ? "Importando..." : `Importar ${filasArchivo.length} filas`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}