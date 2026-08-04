import { supabase } from "../lib/supabase";
import { obtenerClientes } from "./ClienteService";
import { obtenerImplementacionesCliente } from "./ImplementacionService";
import { obtenerProspectos } from "./ProspectoService";
import { obtenerResultadosDiarios } from "./ResultadosDiariosService";
import { obtenerVentasServicios } from "./VentaServicioService";

function inicioDia() {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

function fechaMasDias(dias) {
  const fecha = inicioDia();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

function estaVencida(fecha, estado) {
  if (!fecha || estado === "Completado") return false;
  return new Date(fecha) < inicioDia();
}

function vencePronto(fecha, estado) {
  if (!fecha || estado === "Completado") return false;
  const limite = fechaMasDias(7);
  const actual = new Date(fecha);
  return actual >= inicioDia() && actual <= limite;
}

function aBitacora(fila) {
  return {
    id: fila.id,
    clienteId: fila.cliente_id,
    clienteNombre: fila.clientes?.empresa,
    tipo: fila.tipo,
    titulo: fila.titulo,
    proximoPaso: fila.proximo_paso,
    responsable: fila.responsable,
    fechaEvento: fila.fecha_evento,
    visibleCliente: fila.visible_cliente,
  };
}

async function obtenerBitacoraReciente() {
  const { data, error } = await supabase
    .from("bitacora_cliente")
    .select("*, clientes(empresa)")
    .order("fecha_evento", { ascending: false })
    .limit(8);

  if (error) {
    console.error(error);
    return [];
  }

  return (data || []).map(aBitacora);
}

export async function obtenerPanelDireccion() {
  const [clientes, prospectos, implementaciones, ventas, bitacora, resultados] = await Promise.all([
    obtenerClientes(),
    obtenerProspectos(),
    obtenerImplementacionesCliente(),
    obtenerVentasServicios(),
    obtenerBitacoraReciente(),
    obtenerResultadosDiarios(),
  ]);

  const tareas = implementaciones.flatMap((proyecto) =>
    (proyecto.tareas || []).map((tarea) => ({
      ...tarea,
      clienteId: proyecto.clienteId,
      clienteNombre: proyecto.clienteNombre,
      proyectoNombre: proyecto.nombre,
    }))
  );

  const implementacionesActivas = implementaciones.filter(
    (item) => item.implementacion && item.implementacion.estado !== "Completado"
  );

  const ventasPagadas = ventas.filter((venta) => ["Pagado", "Activo"].includes(venta.estado));
  const ventasPendientes = ventas.filter((venta) => venta.estado === "Pendiente");
  const mensualidadActiva = ventas
    .filter((venta) => venta.modalidad === "Mensual" && ["Pagado", "Activo"].includes(venta.estado))
    .reduce((sum, venta) => sum + Number(venta.valor || 0), 0);
  const resultadosSemana = resultados.slice(0, 7);
  const totalContactadosSemana = resultadosSemana.reduce(
    (sum, item) => sum + Number(item.prospectosContactados || 0),
    0
  );
  const totalReunionesSemana = resultadosSemana.reduce(
    (sum, item) => sum + Number(item.reunionesAgendadas || 0),
    0
  );
  const ultimoResultado = resultados[0] || null;

  return {
    clientes,
    prospectos,
    implementaciones,
    ventas,
    bitacora,
    resultados,
    metricas: {
      clientesActivos: clientes.filter((cliente) => cliente.estado === "Activo").length,
      prospectosAbiertos: prospectos.filter((prospecto) => prospecto.estado !== "Cliente").length,
      implementacionesActivas: implementacionesActivas.length,
      tareasVencidas: tareas.filter((tarea) => estaVencida(tarea.fechaLimite, tarea.estado)).length,
      tareasProximas: tareas.filter((tarea) => vencePronto(tarea.fechaLimite, tarea.estado)).length,
      ventasPendientes: ventasPendientes.reduce((sum, venta) => sum + Number(venta.valor || 0), 0),
      totalVendido: ventasPagadas.reduce((sum, venta) => sum + Number(venta.valor || 0), 0),
      mensualidadActiva,
      contactadosSemana: totalContactadosSemana,
      reunionesSemana: totalReunionesSemana,
    },
    prioridades: {
      tareasVencidas: tareas
        .filter((tarea) => estaVencida(tarea.fechaLimite, tarea.estado))
        .slice(0, 6),
      tareasProximas: tareas
        .filter((tarea) => vencePronto(tarea.fechaLimite, tarea.estado))
        .slice(0, 6),
      ventasPendientes: ventasPendientes.slice(0, 6),
      implementacionesActivas: implementacionesActivas.slice(0, 6),
      bitacora: bitacora.slice(0, 6),
      ultimoResultado,
    },
  };
}
