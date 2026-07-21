import { supabase } from "../lib/supabase";

// Traduce del formulario (JS) hacia las columnas reales de Supabase
function aColumnasDB(cliente) {
  return {
    empresa: cliente.nombre,
    rut: cliente.rut,
    rubro: cliente.giro,
    contacto: cliente.contacto,
    correo: cliente.email,
    telefono: cliente.telefono,
    estado: cliente.estado,
  };
}

// Traduce de las columnas reales de Supabase hacia el formulario (JS)
function aCliente(fila) {
  return {
    id: fila.id,
    nombre: fila.empresa,
    rut: fila.rut,
    giro: fila.rubro,
    contacto: fila.contacto,
    email: fila.correo,
    telefono: fila.telefono,
    estado: fila.estado,
    createdAt: fila.created_at,
  };
}

export async function obtenerClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(aCliente);
}

export async function guardarCliente(cliente) {
  const { error } = await supabase
    .from("clientes")
    .insert([aColumnasDB(cliente)]);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function actualizarCliente(id, cliente) {
  const { error } = await supabase
    .from("clientes")
    .update(aColumnasDB(cliente))
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function eliminarCliente(id) {
  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}