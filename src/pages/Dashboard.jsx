import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Briefcase,
  CalendarClock,
  ClipboardList,
  DollarSign,
  Rocket,
  Target,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";

import AlertasSeguimiento from "../components/CRM/AlertasSeguimiento";
import { obtenerPanelDireccion } from "../services/DireccionService";

const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function fechaCorta(valor) {
  if (!valor) return "Sin fecha";
  return new Date(valor).toLocaleDateString("es-CL");
}

function fechaHora(valor) {
  if (!valor) return "Sin fecha";
  return new Date(valor).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function KpiDireccion({ icon: Icon, titulo, valor, detalle, destacado, alerta }) {
  return (
    <div
      className={`border rounded-xl p-5 shadow-sm ${
        destacado
          ? "bg-slate-900 border-slate-900 text-white"
          : alerta
            ? "bg-red-50 border-red-100"
            : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-sm font-semibold ${
            destacado ? "text-slate-300" : alerta ? "text-red-700" : "text-slate-500"
          }`}
        >
          {titulo}
        </p>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            destacado
              ? "bg-white/10"
              : alerta
                ? "bg-red-100 text-red-700"
                : "bg-blue-50 text-blue-700"
          }`}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold mt-3">{valor}</p>
      <p className={`text-xs mt-1 ${destacado ? "text-slate-400" : "text-slate-500"}`}>
        {detalle}
      </p>
    </div>
  );
}

function ListaDireccion({ titulo, descripcion, accion, children }) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{titulo}</h2>
          <p className="text-sm text-slate-500 mt-1">{descripcion}</p>
        </div>
        {accion}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </section>
  );
}

function Vacio({ texto }) {
  return <p className="p-5 text-sm text-slate-500">{texto}</p>;
}

export default function Dashboard() {
  const [panel, setPanel] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerPanelDireccion();
      setPanel(data);
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar el panel", text: error.message });
    } finally {
      setCargando(false);
    }
  }

  const recomendacion = useMemo(() => {
    if (!panel) return "Cargando prioridades...";
    if (panel.metricas.tareasVencidas > 0) {
      return `Hoy partiria resolviendo ${panel.metricas.tareasVencidas} tarea(s) vencida(s) de implementacion.`;
    }
    if (panel.metricas.ventasPendientes > 0) {
      return "Luego revisaria ventas pendientes para ordenar cobros y cierres.";
    }
    if (panel.metricas.prospectosAbiertos > 0) {
      return "Despues conviene contactar prospectos abiertos y moverlos en el CRM.";
    }
    return "El sistema esta ordenado. Buen momento para buscar nuevos prospectos.";
  }, [panel]);

  if (cargando && !panel) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-8 text-sm text-slate-500">
        Cargando panel de direccion...
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">Tactika Suite</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
              Panel de Direccion
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Control diario de clientes, implementaciones, ventas, prospectos y compromisos.
            </p>
          </div>

          <div className="bg-slate-900 text-white rounded-xl px-5 py-4 max-w-xl">
            <p className="text-xs uppercase font-semibold text-slate-400">Prioridad sugerida</p>
            <p className="text-sm font-semibold mt-1">{recomendacion}</p>
          </div>
        </div>
      </section>

      <AlertasSeguimiento prospectos={panel?.prospectos || []} onEditar={() => {}} />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiDireccion
          icon={DollarSign}
          titulo="Total vendido"
          valor={formatoCLP.format(panel?.metricas.totalVendido || 0)}
          detalle="Pagado o activo"
          destacado
        />
        <KpiDireccion
          icon={Briefcase}
          titulo="Mensualidad activa"
          valor={formatoCLP.format(panel?.metricas.mensualidadActiva || 0)}
          detalle="Ingreso recurrente mensual"
        />
        <KpiDireccion
          icon={AlertTriangle}
          titulo="Tareas vencidas"
          valor={panel?.metricas.tareasVencidas || 0}
          detalle="Compromisos que requieren accion"
          alerta={(panel?.metricas.tareasVencidas || 0) > 0}
        />
        <KpiDireccion
          icon={Rocket}
          titulo="Implementaciones"
          valor={panel?.metricas.implementacionesActivas || 0}
          detalle="Clientes en proceso"
        />
        <KpiDireccion
          icon={Users}
          titulo="Clientes activos"
          valor={panel?.metricas.clientesActivos || 0}
          detalle="Empresas vigentes"
        />
        <KpiDireccion
          icon={Target}
          titulo="Prospectos abiertos"
          valor={panel?.metricas.prospectosAbiertos || 0}
          detalle="Oportunidades por trabajar"
        />
        <KpiDireccion
          icon={CalendarClock}
          titulo="Tareas próximas"
          valor={panel?.metricas.tareasProximas || 0}
          detalle="Vencen dentro de 7 dias"
        />
        <KpiDireccion
          icon={ClipboardList}
          titulo="Pendiente de pago"
          valor={formatoCLP.format(panel?.metricas.ventasPendientes || 0)}
          detalle="Ventas registradas sin pago"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ListaDireccion
          titulo="Tareas vencidas"
          descripcion="Compromisos de implementacion que debes resolver primero."
          accion={
            <Link to="/implementaciones" className="text-sm font-bold text-blue-700">
              Ver implementaciones
            </Link>
          }
        >
          {(panel?.prioridades.tareasVencidas || []).length === 0 ? (
            <Vacio texto="No hay tareas vencidas." />
          ) : (
            panel.prioridades.tareasVencidas.map((tarea) => (
              <div key={tarea.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-slate-800">{tarea.titulo}</p>
                    <p className="text-xs text-slate-500 mt-1">{tarea.clienteNombre}</p>
                  </div>
                  <span className="border border-red-100 bg-red-50 text-red-700 rounded-full px-2.5 py-1 text-xs font-bold">
                    {fechaCorta(tarea.fechaLimite)}
                  </span>
                </div>
              </div>
            ))
          )}
        </ListaDireccion>

        <ListaDireccion
          titulo="Ventas pendientes"
          descripcion="Servicios contratados que aun no figuran pagados."
          accion={
            <Link to="/ventas" className="text-sm font-bold text-blue-700">
              Ver ventas
            </Link>
          }
        >
          {(panel?.prioridades.ventasPendientes || []).length === 0 ? (
            <Vacio texto="No hay ventas pendientes." />
          ) : (
            panel.prioridades.ventasPendientes.map((venta) => (
              <div key={venta.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-slate-800">{venta.clienteNombre}</p>
                    <p className="text-xs text-slate-500 mt-1">{venta.servicio}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {formatoCLP.format(venta.valor)}
                  </span>
                </div>
              </div>
            ))
          )}
        </ListaDireccion>

        <ListaDireccion
          titulo="Implementaciones activas"
          descripcion="Clientes que estan en etapa de configuracion o acompanamiento."
          accion={
            <Link to="/portal-cliente" className="text-sm font-bold text-blue-700">
              Ver portal
            </Link>
          }
        >
          {(panel?.prioridades.implementacionesActivas || []).length === 0 ? (
            <Vacio texto="No hay implementaciones activas." />
          ) : (
            panel.prioridades.implementacionesActivas.map((proyecto) => (
              <div key={proyecto.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-slate-800">{proyecto.clienteNombre}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {proyecto.implementacion?.etapa || "Sin etapa"} ·{" "}
                      {proyecto.implementacion?.responsable || "Sin responsable"}
                    </p>
                  </div>
                  <span className="border border-blue-100 bg-blue-50 text-blue-700 rounded-full px-2.5 py-1 text-xs font-bold">
                    {proyecto.implementacion?.avance || 0}%
                  </span>
                </div>
              </div>
            ))
          )}
        </ListaDireccion>

        <ListaDireccion
          titulo="Ultimos acuerdos"
          descripcion="Registros recientes desde la bitacora operativa."
          accion={
            <Link to="/clientes" className="text-sm font-bold text-blue-700">
              Ver clientes
            </Link>
          }
        >
          {(panel?.prioridades.bitacora || []).length === 0 ? (
            <Vacio texto="Sin registros recientes de bitacora." />
          ) : (
            panel.prioridades.bitacora.map((evento) => (
              <div key={evento.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-slate-800">{evento.titulo}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {evento.clienteNombre || "Cliente"} · {evento.tipo}
                    </p>
                    {evento.proximoPaso && (
                      <p className="text-xs text-blue-700 mt-2">
                        Proximo paso: {evento.proximoPaso}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{fechaHora(evento.fechaEvento)}</span>
                </div>
              </div>
            ))
          )}
        </ListaDireccion>
      </section>
    </div>
  );
}
