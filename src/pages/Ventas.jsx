import { useEffect, useMemo, useState } from "react";
import { DollarSign, FileText, Plus, Repeat, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

import { obtenerClientes } from "../services/ClienteService";
import {
  actualizarVentaServicio,
  crearVentaServicio,
  eliminarVentaServicio,
  obtenerVentasServicios,
} from "../services/VentaServicioService";

const serviciosBase = [
  "Diagnóstico Empresarial Táctika",
  "Implementación Táctika Suite",
  "Plan Base mensual",
  "Plan Profesional mensual",
  "Plan Enterprise mensual",
  "Desarrollo personalizado",
  "Capacitación",
];

const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const ventaInicial = {
  clienteId: "",
  servicio: "Diagnóstico Empresarial Táctika",
  descripcion: "",
  modalidad: "Pago unico",
  valor: "",
  estado: "Pendiente",
  fechaContratacion: new Date().toISOString().slice(0, 10),
  fechaPago: "",
  fechaProximoCobro: "",
  observaciones: "",
};

function KpiVenta({ icon: Icon, titulo, valor, detalle, destacado }) {
  return (
    <div className={`border rounded-xl p-5 ${destacado ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm font-semibold ${destacado ? "text-slate-300" : "text-slate-500"}`}>{titulo}</p>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${destacado ? "bg-white/10" : "bg-blue-50 text-blue-700"}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold mt-3">{valor}</p>
      <p className={`text-xs mt-1 ${destacado ? "text-slate-400" : "text-slate-400"}`}>{detalle}</p>
    </div>
  );
}

export default function Ventas() {
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [form, setForm] = useState(ventaInicial);
  const [ventaEditar, setVentaEditar] = useState(null);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    const [dataClientes, dataVentas] = await Promise.all([
      obtenerClientes(),
      obtenerVentasServicios(),
    ]);
    setClientes(dataClientes);
    setVentas(dataVentas);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  const metricas = useMemo(() => {
    const totalVendido = ventas
      .filter((v) => ["Pagado", "Activo"].includes(v.estado))
      .reduce((sum, v) => sum + v.valor, 0);

    const mensualidadActiva = ventas
      .filter((v) => v.modalidad === "Mensual" && v.estado === "Activo")
      .reduce((sum, v) => sum + v.valor, 0);

    const pendientes = ventas
      .filter((v) => v.estado === "Pendiente")
      .reduce((sum, v) => sum + v.valor, 0);

    const serviciosActivos = ventas.filter((v) => v.estado === "Activo").length;

    return { totalVendido, mensualidadActiva, pendientes, serviciosActivos };
  }, [ventas]);

  function cambiar(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }

  function editar(venta) {
    setVentaEditar(venta);
    setForm({
      clienteId: venta.clienteId,
      servicio: venta.servicio,
      descripcion: venta.descripcion || "",
      modalidad: venta.modalidad,
      valor: venta.valor,
      estado: venta.estado,
      fechaContratacion: venta.fechaContratacion || new Date().toISOString().slice(0, 10),
      fechaPago: venta.fechaPago || "",
      fechaProximoCobro: venta.fechaProximoCobro || "",
      observaciones: venta.observaciones || "",
    });
  }

  function limpiarFormulario() {
    setVentaEditar(null);
    setForm(ventaInicial);
  }

  async function guardar(e) {
    e.preventDefault();

    if (!form.clienteId) {
      Swal.fire({ icon: "warning", title: "Selecciona un cliente" });
      return;
    }

    if (!form.servicio || Number(form.valor || 0) <= 0) {
      Swal.fire({ icon: "warning", title: "Completa servicio y valor" });
      return;
    }

    try {
      if (ventaEditar) {
        await actualizarVentaServicio(ventaEditar.id, form);
      } else {
        await crearVentaServicio(form);
      }

      await cargar();
      limpiarFormulario();
      Swal.fire({
        icon: "success",
        title: ventaEditar ? "Venta actualizada" : "Venta registrada",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.message });
    }
  }

  async function eliminar(id) {
    const respuesta = await Swal.fire({
      title: "¿Eliminar venta?",
      text: "Esto quitará el servicio contratado del control comercial.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!respuesta.isConfirmed) return;

    try {
      await eliminarVentaServicio(id);
      await cargar();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo eliminar", text: error.message });
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-blue-600">Tactika Suite</p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">Ventas y Servicios</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Controla qué servicio contrató cada cliente, el valor vendido, pagos pendientes y suscripciones activas.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiVenta
          icon={DollarSign}
          titulo="Total vendido"
          valor={formatoCLP.format(metricas.totalVendido)}
          detalle="Pagado o activo"
          destacado
        />
        <KpiVenta
          icon={Repeat}
          titulo="Mensualidad activa"
          valor={formatoCLP.format(metricas.mensualidadActiva)}
          detalle="Ingreso recurrente mensual"
        />
        <KpiVenta
          icon={FileText}
          titulo="Pendiente de pago"
          valor={formatoCLP.format(metricas.pendientes)}
          detalle="Ventas registradas sin pago"
        />
        <KpiVenta
          icon={Plus}
          titulo="Servicios activos"
          valor={metricas.serviciosActivos}
          detalle="Clientes con servicio vigente"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">
        <form onSubmit={guardar} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {ventaEditar ? "Editar venta" : "Registrar venta"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Usa esto cuando un cliente contrate diagnóstico, implementación o plan mensual.
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Cliente</label>
            <select
              value={form.clienteId}
              onChange={(e) => cambiar("clienteId", e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Servicio contratado</label>
            <select
              value={form.servicio}
              onChange={(e) => cambiar("servicio", e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
            >
              {serviciosBase.map((servicio) => (
                <option key={servicio} value={servicio}>
                  {servicio}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">Modalidad</label>
              <select
                value={form.modalidad}
                onChange={(e) => cambiar("modalidad", e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              >
                <option>Pago unico</option>
                <option>Mensual</option>
                <option>Anual</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Estado</label>
              <select
                value={form.estado}
                onChange={(e) => cambiar("estado", e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              >
                <option>Pendiente</option>
                <option>Pagado</option>
                <option>Activo</option>
                <option>Vencido</option>
                <option>Cancelado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Valor</label>
            <input
              type="number"
              min="0"
              value={form.valor}
              onChange={(e) => cambiar("valor", e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              placeholder="Ej: 29990"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">Contratación</label>
              <input
                type="date"
                value={form.fechaContratacion}
                onChange={(e) => cambiar("fechaContratacion", e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Próximo cobro</label>
              <input
                type="date"
                value={form.fechaProximoCobro}
                onChange={(e) => cambiar("fechaProximoCobro", e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Observaciones</label>
            <textarea
              value={form.observaciones}
              onChange={(e) => cambiar("observaciones", e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-sm min-h-20"
              placeholder="Ej: diagnóstico descontable si avanza a implementación."
            />
          </div>

          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
              {ventaEditar ? "Actualizar" : "Registrar"}
            </button>
            {ventaEditar && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg text-sm font-semibold"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Servicios contratados</h2>
            <p className="text-sm text-slate-500 mt-1">
              Vista comercial de clientes con diagnóstico, implementación o plan mensual.
            </p>
          </div>

          {cargando ? (
            <p className="p-5 text-sm text-slate-500">Cargando ventas...</p>
          ) : ventas.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">Aún no hay ventas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-3 text-left">Cliente</th>
                    <th className="p-3 text-left">Servicio</th>
                    <th className="p-3 text-left">Modalidad</th>
                    <th className="p-3 text-right">Valor</th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 text-left">Próximo cobro</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta.id} className="border-t border-slate-100">
                      <td className="p-3 font-semibold text-slate-800">{venta.clienteNombre}</td>
                      <td className="p-3 text-slate-600">{venta.servicio}</td>
                      <td className="p-3 text-slate-600">{venta.modalidad}</td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {formatoCLP.format(venta.valor)}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          {venta.estado}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{venta.fechaProximoCobro || "Sin fecha"}</td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editar(venta)}
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminar(venta.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
