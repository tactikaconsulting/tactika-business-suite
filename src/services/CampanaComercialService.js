import { supabase } from "../lib/supabase";

function aCampana(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    canal: fila.canal,
    plantilla: fila.plantilla,
    estado: fila.estado,
    fechaProgramada: fila.fecha_programada,
    createdAt: fila.created_at,
    updatedAt: fila.updated_at,
  };
}

function aMensaje(fila) {
  return {
    id: fila.id,
    campanaId: fila.campana_id,
    prospectoId: fila.prospecto_id,
    canal: fila.canal,
    asunto: fila.asunto,
    mensaje: fila.mensaje,
    estado: fila.estado,
    fechaProgramada: fila.fecha_programada,
    fechaEnvio: fila.fecha_envio,
    error: fila.error,
    createdAt: fila.created_at,
    updatedAt: fila.updated_at,
  };
}

function aColumnasCampana(campana) {
  return {
    nombre: campana.nombre,
    canal: campana.canal,
    plantilla: campana.plantilla,
    estado: campana.estado || "Programada",
    fecha_programada: campana.fechaProgramada || null,
    updated_at: new Date().toISOString(),
  };
}

function aColumnasMensaje(mensaje) {
  return {
    campana_id: mensaje.campanaId,
    prospecto_id: mensaje.prospectoId,
    canal: mensaje.canal,
    asunto: mensaje.asunto || null,
    mensaje: mensaje.mensaje,
    estado: mensaje.estado || "Programado",
    fecha_programada: mensaje.fechaProgramada,
    fecha_envio: mensaje.fechaEnvio || null,
    error: mensaje.error || null,
    updated_at: new Date().toISOString(),
  };
}

export async function obtenerCampanasComerciales() {
  const { data, error } = await supabase
    .from("campanas_comerciales")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("No se pudieron cargar campanas comerciales", error.message);
    return [];
  }

  return data.map(aCampana);
}

export async function obtenerMensajesProgramados() {
  const { data, error } = await supabase
    .from("mensajes_programados")
    .select("*")
    .order("fecha_programada", { ascending: true });

  if (error) {
    console.warn("No se pudieron cargar mensajes programados", error.message);
    return [];
  }

  return data.map(aMensaje);
}

export async function crearCampanaConMensajes(campana, mensajes) {
  const { data, error } = await supabase
    .from("campanas_comerciales")
    .insert([aColumnasCampana(campana)])
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  const campanaCreada = aCampana(data);
  const filasMensajes = mensajes.map((mensaje) =>
    aColumnasMensaje({ ...mensaje, campanaId: campanaCreada.id })
  );

  const { error: errorMensajes } = await supabase
    .from("mensajes_programados")
    .insert(filasMensajes);

  if (errorMensajes) {
    console.error(errorMensajes);
    throw errorMensajes;
  }

  return campanaCreada;
}

export async function actualizarEstadoMensajeProgramado(id, estado, extras = {}) {
  const cambios = {
    estado,
    updated_at: new Date().toISOString(),
  };

  if (extras.fechaEnvio) cambios.fecha_envio = extras.fechaEnvio;
  if (extras.error !== undefined) cambios.error = extras.error;

  const { data, error } = await supabase
    .from("mensajes_programados")
    .update(cambios)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return aMensaje(data);
}

export async function actualizarEstadoCampana(id, estado) {
  const { data, error } = await supabase
    .from("campanas_comerciales")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return aCampana(data);
}
