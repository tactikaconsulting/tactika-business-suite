import { supabase } from "../lib/supabase";

function aColumnasDB(venta) {
  return {
    cliente_id: venta.clienteId,
    servicio: venta.servicio,
    descripcion: venta.descripcion,
    modalidad: venta.modalidad || "Pago unico",
    valor: Number(venta.valor || 0),
    moneda: venta.moneda || "CLP",
    estado: venta.estado || "Pendiente",
    fecha_contratacion: venta.fechaContratacion || new Date().toISOString().slice(0, 10),
    fecha_pago: venta.fechaPago || null,
    fecha_proximo_cobro: venta.fechaProximoCobro || null,
    observaciones: venta.observaciones,
    updated_at: new Date().toISOString(),
  };
}

function aVenta(fila) {
  return {
    id: fila.id,
    clienteId: fila.cliente_id,
    clienteNombre: fila.clientes?.empresa,
    clienteRut: fila.clientes?.rut,
    servicio: fila.servicio,
    descripcion: fila.descripcion,
    modalidad: fila.modalidad,
    valor: Number(fila.valor || 0),
    moneda: fila.moneda,
    estado: fila.estado,
    fechaContratacion: fila.fecha_contratacion,
    fechaPago: fila.fecha_pago,
    fechaProximoCobro: fila.fecha_proximo_cobro,
    observaciones: fila.observaciones,
    createdAt: fila.created_at,
  };
}

export async function obtenerVentasServicios() {
  const { data, error } = await supabase
    .from("ventas_servicios")
    .select("*, clientes(empresa, rut)")
    .order("fecha_contratacion", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(aVenta);
}

export async function crearVentaServicio(venta) {
  const { error } = await supabase
    .from("ventas_servicios")
    .insert([aColumnasDB(venta)]);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function actualizarVentaServicio(id, venta) {
  const { error } = await supabase
    .from("ventas_servicios")
    .update(aColumnasDB(venta))
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function eliminarVentaServicio(id) {
  const { error } = await supabase
    .from("ventas_servicios")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}
