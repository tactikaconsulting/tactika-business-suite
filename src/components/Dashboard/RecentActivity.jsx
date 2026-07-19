import { FaUserPlus, FaClipboardCheck, FaTasks, FaCalendarCheck } from "react-icons/fa";
import { useEffect, useState } from "react";

import { obtenerClientes } from "../../services/ClienteService";
import { obtenerDiagnosticos } from "../../services/DiagnosticoService";
import { obtenerPlanes } from "../../services/PlanAccionService";
import { obtenerSeguimientos } from "../../services/SeguimientoService";

// PlanAccionService guarda "fecha" como "dd-mm-aaaa" (toLocaleDateString("es-CL")),
// que new Date() no parsea de forma confiable en todos los navegadores.
function parsearFechaCL(texto) {
  if (!texto || typeof texto !== "string") return new Date(0);
  const partes = texto.split("-");
  if (partes.length !== 3) return new Date(0);
  const [dia, mes, anio] = partes.map(Number);
  return new Date(anio, mes - 1, dia);
}

// ClienteService, DiagnosticoService y SeguimientoService aún no confirmados:
// si guardan "fecha" en otro formato, ajustar aquí.
function obtenerFecha(item) {
  if (item.fecha && item.fecha.includes("-") && item.fecha.length === 10) {
    return parsearFechaCL(item.fecha);
  }
  const campo =
    item.fecha || item.fechaCreacion || item.fechaIngreso || item.createdAt;
  return campo ? new Date(campo) : new Date(0);
}

// ajusta: cambia "nombre" si ClienteService/DiagnosticoService/SeguimientoService
// usan otro campo para el nombre del cliente
function obtenerNombreCliente(item, fallback) {
  return item.nombre || item.empresa || fallback;
}

export default function RecentActivity() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const clientes = obtenerClientes();
    const diagnosticos = obtenerDiagnosticos();
    const planes = obtenerPlanes();
    const seguimientos = obtenerSeguimientos();

    const lista = [
      ...clientes.map((c) => ({
        icono: <FaUserPlus className="text-blue-600" />,
        titulo: "Cliente registrado",
        descripcion: obtenerNombreCliente(c, "Nuevo cliente en el CRM."),
        fecha: obtenerFecha(c),
      })),
      ...diagnosticos.map((d) => ({
        icono: <FaClipboardCheck className="text-green-600" />,
        titulo: "Diagnóstico completado",
        descripcion: obtenerNombreCliente(d, "Nuevo diagnóstico empresarial."),
        fecha: obtenerFecha(d),
      })),
      ...planes.map((p) => ({
        icono: <FaTasks className="text-orange-500" />,
        titulo: "Plan de acción creado",
        descripcion: `${p.accion} (${p.empresa})`,
        fecha: obtenerFecha(p),
      })),
      ...seguimientos.map((s) => ({
        icono: <FaCalendarCheck className="text-cyan-600" />,
        titulo: "Seguimiento registrado",
        descripcion: obtenerNombreCliente(s, "Nuevo seguimiento."),
        fecha: obtenerFecha(s),
      })),
    ]
      .sort((a, b) => b.fecha - a.fecha)
      .slice(0, 6);

    setEventos(lista);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Actividad Reciente</h2>

      {eventos.length === 0 ? (
        <p className="text-gray-400 text-sm">
          Aún no hay actividad registrada.
        </p>
      ) : (
        <div className="space-y-5">
          {eventos.map((item, index) => (
            <div key={index} className="flex items-start gap-4 border-b pb-4">
              <div className="text-2xl">{item.icono}</div>

              <div>
                <h3 className="font-semibold">{item.titulo}</h3>
                <p className="text-gray-500 text-sm">{item.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}