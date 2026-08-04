import { supabase } from "../lib/supabase";
import { obtenerDocumentosCliente } from "./DocumentoClienteService";
import { obtenerModulosCliente } from "./ImplementacionService";

const rolesTactika = ["admin_tactika", "consultor_tactika"];

function aCliente(fila) {
  if (!fila) return null;
  return {
    id: fila.id,
    nombre: fila.empresa,
    rut: fila.rut,
    giro: fila.rubro,
    contacto: fila.contacto,
    email: fila.correo,
    telefono: fila.telefono,
    estado: fila.estado,
  };
}

function aProyecto(fila) {
  if (!fila) return null;
  return {
    id: fila.id,
    nombre: fila.nombre,
    tipo: fila.tipo,
    estado: fila.estado,
    fechaInicio: fila.fecha_inicio,
    fechaObjetivo: fila.fecha_objetivo,
    responsable: fila.responsable,
    observaciones: fila.observaciones,
  };
}

function aImplementacion(fila) {
  if (!fila) return null;
  return {
    id: fila.id,
    etapa: fila.etapa,
    estado: fila.estado,
    avance: Number(fila.avance || 0),
    fechaInicio: fila.fecha_inicio,
    fechaObjetivo: fila.fecha_objetivo,
    responsable: fila.responsable,
    notas: fila.notas,
  };
}

function aTarea(fila) {
  return {
    id: fila.id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    responsable: fila.responsable,
    estado: fila.estado,
    prioridad: fila.prioridad,
    fechaLimite: fila.fecha_limite,
    orden: fila.orden,
  };
}

function aVenta(fila) {
  return {
    id: fila.id,
    servicio: fila.servicio,
    descripcion: fila.descripcion,
    modalidad: fila.modalidad,
    valor: Number(fila.valor || 0),
    moneda: fila.moneda,
    estado: fila.estado,
    fechaContratacion: fila.fecha_contratacion,
    fechaProximoCobro: fila.fecha_proximo_cobro,
  };
}

function aPlan(fila) {
  return {
    id: fila.id,
    area: fila.area,
    accion: fila.accion,
    responsable: fila.responsable,
    prioridad: fila.prioridad,
    estado: fila.estado,
    fechaLimite: fila.fecha_limite,
  };
}

function documentosVisibles(documentos, perfil) {
  const esTactika = rolesTactika.includes(perfil?.tipo_usuario);
  if (esTactika) return documentos;
  return documentos.filter((documento) => documento.visibleCliente);
}

async function obtenerPerfilActual() {
  const { data: authData, error: errorAuth } = await supabase.auth.getUser();
  if (errorAuth || !authData?.user?.id) return null;

  const { data, error } = await supabase
    .from("perfiles")
    .select("id, rol, tipo_usuario, cliente_id")
    .eq("id", authData.user.id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

async function resolverClienteAutorizado(clienteIdSolicitado) {
  const perfil = await obtenerPerfilActual();
  const esTactika = rolesTactika.includes(perfil?.tipo_usuario);

  if (esTactika) return clienteIdSolicitado || perfil?.cliente_id || null;

  if (!perfil?.cliente_id) return null;

  if (clienteIdSolicitado && clienteIdSolicitado !== perfil.cliente_id) {
    throw new Error("No tienes permiso para ver la informacion de este cliente.");
  }

  return perfil.cliente_id;
}

export async function obtenerClienteIdPortalAsignado() {
  const perfil = await obtenerPerfilActual();
  return perfil?.cliente_id || null;
}

export async function obtenerResumenPortalCliente(clienteIdSolicitado) {
  const perfil = await obtenerPerfilActual();
  const clienteId = await resolverClienteAutorizado(clienteIdSolicitado);
  if (!clienteId) return null;

  const [
    { data: cliente, error: errorCliente },
    { data: proyectos, error: errorProyectos },
    { data: implementaciones, error: errorImplementaciones },
    { data: tareas, error: errorTareas },
    { data: ventas, error: errorVentas },
    { data: planes, error: errorPlanes },
    documentos,
    modulos,
  ] = await Promise.all([
    supabase.from("clientes").select("*").eq("id", clienteId).single(),
    supabase
      .from("proyectos_cliente")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("implementaciones_cliente")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("implementacion_tareas")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("orden", { ascending: true }),
    supabase
      .from("ventas_servicios")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("fecha_contratacion", { ascending: false }),
    supabase
      .from("planes_accion")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false }),
    obtenerDocumentosCliente(clienteId),
    obtenerModulosCliente(clienteId),
  ]);

  const errores = [
    errorCliente,
    errorProyectos,
    errorImplementaciones,
    errorTareas,
    errorVentas,
    errorPlanes,
  ].filter(Boolean);

  if (errores.length > 0) {
    errores.forEach((error) => console.error(error));
    throw errores[0];
  }

  return {
    cliente: aCliente(cliente),
    proyecto: aProyecto(proyectos?.[0]),
    implementacion: aImplementacion(implementaciones?.[0]),
    tareas: (tareas || []).map(aTarea),
    servicios: (ventas || []).map(aVenta),
    planTrabajo: (planes || []).map(aPlan),
    documentos: documentosVisibles(documentos || [], perfil),
    modulos,
  };
}
