import { useEffect, useState } from "react";

import {
  SeguimientoForm,
  SeguimientoStats,
  SeguimientoTable,
} from "../components/Seguimiento";

import {
  obtenerSeguimientos,
  guardarSeguimiento,
  eliminarSeguimiento,
  obtenerEstadisticasSeguimiento,
} from "../services/SeguimientoService";
import ImportarArchivo from "../components/Shared/ImportarArchivo";
import Swal from "sweetalert2";

const columnasImportacion = [
  { clave: "tarea", etiqueta: "Tarea", requerido: true },
  { clave: "responsable", etiqueta: "Responsable", requerido: false },
  { clave: "fecha", etiqueta: "Fecha límite", requerido: false },
  { clave: "estado", etiqueta: "Estado", requerido: false },
];

export default function Seguimientos() {

  const [seguimientos, setSeguimientos] = useState([]);

  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    proceso: 0,
    completados: 0,
  });


  const [seguimientoSeleccionado, setSeguimientoSeleccionado] =
    useState(null);


  const cargarDatos = async () => {
    const dataSeguimientos = await obtenerSeguimientos();
    const dataEstadisticas = await obtenerEstadisticasSeguimiento();

    setSeguimientos(dataSeguimientos);
    setEstadisticas(dataEstadisticas);
  };


  useEffect(() => {
    cargarDatos();
  }, []);


  const guardar = async (seguimiento) => {
    try {
      await guardarSeguimiento(seguimiento);
      await cargarDatos();
      setSeguimientoSeleccionado(null);
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };


  const editar = (seguimiento) => {
    setSeguimientoSeleccionado(seguimiento);
  };


  const eliminar = async (id) => {
    try {
      await eliminarSeguimiento(id);
      await cargarDatos();
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };

  async function importarSeguimientos(filas) {
    let exitosos = 0;
    let fallidos = 0;

    for (const fila of filas) {
      if (!fila.tarea) {
        fallidos++;
        continue;
      }
      try {
        await guardarSeguimiento({
          tarea: fila.tarea,
          responsable: fila.responsable || "",
          fecha: fila.fecha || "",
          estado: fila.estado || "Pendiente",
        });
        exitosos++;
      } catch (error) {
        fallidos++;
      }
    }

    await cargarDatos();

    Swal.fire({
      icon: fallidos > 0 ? "warning" : "success",
      title: "Importación completa",
      text: `${exitosos} seguimientos creados. ${fallidos > 0 ? `${fallidos} no se pudieron crear (falta la tarea).` : ""}`,
    });
  }


  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Seguimiento
          </h1>

          <p className="text-slate-500 mt-2">
            Control y seguimiento de tareas de los planes de acción.
          </p>
        </div>

        <ImportarArchivo
          columnas={columnasImportacion}
          onImportar={importarSeguimientos}
          nombreEntidad="seguimientos"
        />
      </div>


      <SeguimientoStats 
        estadisticas={estadisticas} 
      />


      <SeguimientoForm
        onGuardar={guardar}
        seguimientoSeleccionado={seguimientoSeleccionado}
      />


      <SeguimientoTable
        seguimientos={seguimientos}
        onEditar={editar}
        onEliminar={eliminar}
      />


    </div>
  );
}