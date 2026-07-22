import { supabase } from "../lib/supabase";
import { calcularIndiceTactika } from "./IndiceTactika";

function aColumnasDB(p) {
  return {
    empresa: p.empresa,
    rut: p.rut,
    giro: p.giro,
    comuna: p.comuna,
    region: p.region,
    num_trabajadores: p.numTrabajadores || null,
    contacto_nombre: p.contactoNombre,
    contacto_cargo: p.contactoCargo,
    correo: p.correo,
    telefono: p.telefono,
    sitio_web: p.sitioWeb,
    facebook: p.facebook,
    instagram: p.instagram,
    linkedin: p.linkedin,
    usa_software: !!p.usaSoftware,
    software_actual: p.softwareActual,
    problema_detectado: p.problemaDetectado,
    dolor_principal: p.dolorPrincipal,
    necesidad: p.necesidad,
    observaciones: p.observaciones,
    origen: p.origen,
    estado: p.estado || "Prospecto",
    fecha_proximo_contacto: p.fechaProximoContacto || null,
    valor_estimado: p.valorEstimado || null,
    probabilidad_cierre: p.probabilidadCierre || null,
    trabajo_administrativo: !!p.muchoTrabajoAdministrativo,
    interes_alto: !!p.interesAlto,
    necesidad_urgente: !!p.necesidadUrgente,
    indice_tactika: calcularIndiceTactika(p),
    updated_at: new Date().toISOString(),
  };
}

function aProspecto(fila) {
  return {
    id: fila.id,
    empresa: fila.empresa,
    rut: fila.rut,
    giro: fila.giro,
    comuna: fila.comuna,
    region: fila.region,
    numTrabajadores: fila.num_trabajadores,
    contactoNombre: fila.contacto_nombre,
    contactoCargo: fila.contacto_cargo,
    correo: fila.correo,
    telefono: fila.telefono,
    sitioWeb: fila.sitio_web,
    facebook: fila.facebook,
    instagram: fila.instagram,
    linkedin: fila.linkedin,
    usaSoftware: fila.usa_software,
    softwareActual: fila.software_actual,
    problemaDetectado: fila.problema_detectado,
    dolorPrincipal: fila.dolor_principal,
    necesidad: fila.necesidad,
    observaciones: fila.observaciones,
    origen: fila.origen,
    estado: fila.estado,
    fechaProximoContacto: fila.fecha_proximo_contacto,
    valorEstimado: fila.valor_estimado,
    probabilidadCierre: fila.probabilidad_cierre,
    muchoTrabajoAdministrativo: fila.trabajo_administrativo,
    interesAlto: fila.interes_alto,
    necesidadUrgente: fila.necesidad_urgente,
    indiceTactika: fila.indice_tactika,
    clienteId: fila.cliente_id,
    createdAt: fila.created_at,
  };
}

export async function obtenerProspectos() {
  const { data, error } = await supabase
    .from("prospectos")
    .select("*")
    .order("indice_tactika", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(aProspecto);
}

export async function crearProspecto(prospecto) {
  const { error } = await supabase
    .from("prospectos")
    .insert([aColumnasDB(prospecto)]);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function actualizarProspecto(id, prospecto) {
  const { error } = await supabase
    .from("prospectos")
    .update(aColumnasDB(prospecto))
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function cambiarEstadoProspecto(id, estadoAnterior, estadoNuevo) {
  const { error: errorUpdate } = await supabase
    .from("prospectos")
    .update({ estado: estadoNuevo, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (errorUpdate) {
    console.error(errorUpdate);
    throw errorUpdate;
  }

  const { error: errorHistorial } = await supabase
    .from("prospecto_historial")
    .insert([
      {
        prospecto_id: id,
        estado_anterior: estadoAnterior,
        estado_nuevo: estadoNuevo,
      },
    ]);

  if (errorHistorial) {
    console.error(errorHistorial);
  }
}

export async function eliminarProspecto(id) {
  const { error } = await supabase
    .from("prospectos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function obtenerHistorial() {
  const { data, error } = await supabase
    .from("prospecto_historial")
    .select("*")
    .order("fecha", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((h) => ({
    prospectoId: h.prospecto_id,
    estadoAnterior: h.estado_anterior,
    estadoNuevo: h.estado_nuevo,
    fecha: h.fecha,
  }));
}
/**
 * Crea el registro real en la tabla `clientes` a partir de un prospecto,
 * y vincula al prospecto con ese cliente (cliente_id). Es idempotente:
 * si el prospecto ya tiene un cliente vinculado, no crea uno duplicado.
 */
export async function convertirProspectoACliente(prospecto) {
  if (prospecto.clienteId) return prospecto.clienteId;

  const { data, error } = await supabase
    .from("clientes")
    .insert([
      {
        empresa: prospecto.empresa,
        rut: prospecto.rut,
        contacto: prospecto.contactoNombre,
        correo: prospecto.correo,
        telefono: prospecto.telefono,
        rubro: prospecto.giro,
        estado: "Activo",
      },
    ])
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  const nuevoClienteId = data[0].id;

  const { error: errorLink } = await supabase
    .from("prospectos")
    .update({ cliente_id: nuevoClienteId })
    .eq("id", prospecto.id);

  if (errorLink) {
    console.error(errorLink);
  }

  return nuevoClienteId;
  clienteId: fila.cliente_id,
    recomendacionIA: fila.recomendacion_ia,
    createdAt: fila.created_at,,
}