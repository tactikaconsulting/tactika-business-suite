import { useEffect, useState } from "react";

import {
  SeguimientoForm,
  SeguimientoStats,
  SeguimientoTable,
} from "../components/seguimiento";

import {
  obtenerSeguimientos,
  guardarSeguimiento,
  eliminarSeguimiento,
  obtenerEstadisticasSeguimiento,
} from "../services/seguimientoService";

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

  const cargarDatos = () => {
    setSeguimientos(obtenerSeguimientos());
    setEstadisticas(obtenerEstadisticasSeguimiento());
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardar = (seguimiento) => {
    guardarSeguimiento(seguimiento);
    cargarDatos();
    setSeguimientoSeleccionado(null);
  };

  const editar = (seguimiento) => {
    setSeguimientoSeleccionado(seguimiento);
  };

  const eliminar = (id) => {
    eliminarSeguimiento(id);
    cargarDatos();
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Seguimiento
        </h1>

        <p className="text-slate-500 mt-2">
          Control y seguimiento de tareas de los planes de acción.
        </p>
      </div>

      <SeguimientoStats estadisticas={estadisticas} />

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