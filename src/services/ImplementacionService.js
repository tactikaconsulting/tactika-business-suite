import { supabase } from "../lib/supabase";

const modulosIniciales = [
  "CRM Comercial",
  "Diagnostico",
  "Planes de Accion",
  "Seguimiento",
  "Reportes",
];

export const catalogoModulosTactika = [
  {
    modulo: "CRM Comercial",
    categoria: "Comercial",
    descripcion: "Prospectos, pipeline, propuestas, plantillas y seguimiento comercial.",
    planes: ["Base", "Profesional", "Enterprise"],
  },
  {
    modulo: "Diagnostico",
    categoria: "Consultoria",
    descripcion: "Evaluacion empresarial, pilares de gestion e informe de oportunidades.",
    planes: ["Base", "Profesional", "Enterprise"],
  },
  {
    modulo: "Planes de Accion",
    categoria: "Consultoria",
    descripcion: "Acciones, responsables, prioridades y fechas de mejora.",
    planes: ["Base", "Profesional", "Enterprise"],
  },
  {
    modulo: "Seguimiento",
    categoria: "Operacion",
    descripcion: "Tareas, recordatorios y control de avances del cliente.",
    planes: ["Base", "Profesional", "Enterprise"],
  },
  {
    modulo: "Reportes",
    categoria: "Gestion",
    descripcion: "Informes, exportaciones y vista ejecutiva de resultados.",
    planes: ["Profesional", "Enterprise"],
  },
  {
    modulo: "Ventas",
    categoria: "Gestion",
    descripcion: "Servicios contratados, valores, pagos y suscripciones.",
    planes: ["Profesional", "Enterprise"],
  },
  {
    modulo: "Prospeccion IA",
    categoria: "Comercial",
    descripcion: "Busqueda de oportunidades, priorizacion y mensajes comerciales.",
    planes: ["Enterprise"],
  },
  {
    modulo: "Inventario",
    categoria: "Futuro",
    descripcion: "Control de productos, stock, compras y rotacion.",
    planes: ["Enterprise"],
  },
  {
    modulo: "RRHH",
    categoria: "Futuro",
    descripcion: "Colaboradores, asistencia, documentos y gestion interna.",
    planes: ["Enterprise"],
  },
];

const tareasBase = [
  {
    titulo: "Reunion de inicio con cliente",
    descripcion: "Alinear objetivos, responsables, alcance y fechas del proyecto.",
    prioridad: "Alta",
    orden: 1,
  },
  {
    titulo: "Levantamiento de procesos",
    descripcion: "Documentar como trabaja hoy la empresa y detectar procesos criticos.",
    prioridad: "Alta",
    orden: 2,
  },
  {
    titulo: "Configurar modulos iniciales",
    descripcion: "Activar las herramientas contratadas segun el diagnostico y el plan.",
    prioridad: "Media",
    orden: 3,
  },
  {
    titulo: "Capacitacion del cliente",
    descripcion: "Explicar uso de la plataforma y buenas practicas del Metodo Tactika.",
    prioridad: "Media",
    orden: 4,
  },
  {
    titulo: "Primer seguimiento operativo",
    descripcion: "Revisar adopcion, dudas, pendientes y proximas mejoras.",
    prioridad: "Media",
    orden: 5,
  },
];

function sumarDias(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function aProyecto(fila) {
  return {
    id: fila.id,
    clienteId: fila.cliente_id,
    prospectoId: fila.prospecto_id,
    clienteNombre: fila.clientes?.empresa,
    clienteRut: fila.clientes?.rut,
    nombre: fila.nombre,
    tipo: fila.tipo,
    estado: fila.estado,
    fechaInicio: fila.fecha_inicio,
    fechaObjetivo: fila.fecha_objetivo,
    responsable: fila.responsable,
    observaciones: fila.observaciones,
    createdAt: fila.created_at,
  };
}

function aImplementacion(fila) {
  return {
    id: fila.id,
    proyectoId: fila.proyecto_id,
    clienteId: fila.cliente_id,
    etapa: fila.etapa,
    estado: fila.estado,
    avance: Number(fila.avance || 0),
    fechaInicio: fila.fecha_inicio,
    fechaObjetivo: fila.fecha_objetivo,
    responsable: fila.responsable,
    notas: fila.notas,
    createdAt: fila.created_at,
  };
}

function aTarea(fila) {
  return {
    id: fila.id,
    implementacionId: fila.implementacion_id,
    clienteId: fila.cliente_id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    responsable: fila.responsable,
    estado: fila.estado,
    prioridad: fila.prioridad,
    fechaLimite: fila.fecha_limite,
    orden: fila.orden,
  };
}

function aModulo(fila) {
  return {
    id: fila.id,
    clienteId: fila.cliente_id,
    modulo: fila.modulo,
    estado: fila.estado,
    plan: fila.plan,
    fechaActivacion: fila.fecha_activacion,
    observaciones: fila.observaciones,
  };
}

export function modulosSugeridosPorPlan(plan) {
  if (!plan) return [];
  return catalogoModulosTactika
    .filter((item) => item.planes.includes(plan))
    .map((item) => item.modulo);
}

async function obtenerProyectoExistente(clienteId) {
  const { data, error } = await supabase
    .from("proyectos_cliente")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error(error);
    throw error;
  }

  return data?.[0] || null;
}

async function obtenerImplementacionExistente(clienteId) {
  const { data, error } = await supabase
    .from("implementaciones_cliente")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error(error);
    throw error;
  }

  return data?.[0] || null;
}

export async function crearImplementacionInicial({ clienteId, prospecto }) {
  if (!clienteId) throw new Error("Falta clienteId para crear la implementacion.");

  let proyecto = await obtenerProyectoExistente(clienteId);

  if (!proyecto) {
    const { data, error } = await supabase
      .from("proyectos_cliente")
      .insert([
        {
          cliente_id: clienteId,
          prospecto_id: prospecto?.id || null,
          nombre: `Implementacion Tactika - ${prospecto?.empresa || "Cliente"}`,
          tipo: "Implementacion Tactika Suite",
          estado: "Pendiente",
          fecha_inicio: new Date().toISOString().slice(0, 10),
          fecha_objetivo: sumarDias(30),
          responsable: "Claudio Urra",
          observaciones: "Proyecto creado automaticamente al convertir prospecto en cliente.",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    proyecto = data;
  }

  let implementacion = await obtenerImplementacionExistente(clienteId);

  if (!implementacion) {
    const { data, error } = await supabase
      .from("implementaciones_cliente")
      .insert([
        {
          proyecto_id: proyecto.id,
          cliente_id: clienteId,
          etapa: "Diagnostico inicial",
          estado: "Pendiente",
          avance: 0,
          fecha_inicio: new Date().toISOString().slice(0, 10),
          fecha_objetivo: sumarDias(30),
          responsable: "Claudio Urra",
          notas: "Implementacion inicial creada desde el flujo comercial.",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    implementacion = data;
  }

  const { data: tareasExistentes, error: errorTareasExistentes } = await supabase
    .from("implementacion_tareas")
    .select("id")
    .eq("implementacion_id", implementacion.id)
    .limit(1);

  if (errorTareasExistentes) {
    console.error(errorTareasExistentes);
    throw errorTareasExistentes;
  }

  if (!tareasExistentes?.length) {
    const { error: errorTareas } = await supabase
      .from("implementacion_tareas")
      .insert(
        tareasBase.map((tarea) => ({
          implementacion_id: implementacion.id,
          cliente_id: clienteId,
          titulo: tarea.titulo,
          descripcion: tarea.descripcion,
          prioridad: tarea.prioridad,
          estado: "Pendiente",
          fecha_limite: sumarDias(7 * tarea.orden),
          orden: tarea.orden,
        }))
      );

    if (errorTareas) {
      console.error(errorTareas);
      throw errorTareas;
    }
  }

  const { error: errorModulos } = await supabase.from("modulos_cliente").upsert(
    modulosIniciales.map((modulo) => ({
      cliente_id: clienteId,
      modulo,
      estado: "Activo",
      plan: "Base",
      observaciones: "Modulo inicial activado automaticamente.",
    })),
    { onConflict: "cliente_id,modulo" }
  );

  if (errorModulos) {
    console.error(errorModulos);
    throw errorModulos;
  }

  await supabase.from("seguimientos").insert([
    {
      tarea: `Inicio implementacion Tactika - ${prospecto?.empresa || "Cliente"}`,
      responsable: "Claudio Urra",
      fecha: sumarDias(7),
      estado: "Pendiente",
      fecha_creacion: new Date().toLocaleDateString("es-CL"),
    },
  ]);

  return {
    proyecto: aProyecto(proyecto),
    implementacion: aImplementacion(implementacion),
  };
}

export async function obtenerImplementacionesCliente() {
  const [
    { data: proyectos, error: errorProyectos },
    { data: implementaciones, error: errorImplementaciones },
    { data: tareas, error: errorTareas },
    { data: modulos, error: errorModulos },
  ] = await Promise.all([
    supabase
      .from("proyectos_cliente")
      .select("*, clientes(empresa, rut)")
      .order("created_at", { ascending: false }),
    supabase
      .from("implementaciones_cliente")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("implementacion_tareas")
      .select("*")
      .order("orden", { ascending: true }),
    supabase
      .from("modulos_cliente")
      .select("*")
      .order("modulo", { ascending: true }),
  ]);

  const errores = [errorProyectos, errorImplementaciones, errorTareas, errorModulos].filter(Boolean);
  if (errores.length > 0) {
    errores.forEach((error) => console.error(error));
    return [];
  }

  return proyectos.map((proyecto) => {
    const implementacion = implementaciones.find((item) => item.proyecto_id === proyecto.id);
    return {
      ...aProyecto(proyecto),
      implementacion: implementacion ? aImplementacion(implementacion) : null,
      tareas: implementacion
        ? tareas.filter((tarea) => tarea.implementacion_id === implementacion.id).map(aTarea)
        : [],
      modulos: modulos.filter((modulo) => modulo.cliente_id === proyecto.cliente_id).map(aModulo),
    };
  });
}

export async function actualizarEstadoTareaImplementacion(id, estado) {
  const { error } = await supabase
    .from("implementacion_tareas")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function crearTareaImplementacionCliente({
  implementacionId,
  clienteId,
  titulo,
  descripcion,
  responsable,
  prioridad = "Media",
  fechaLimite,
}) {
  if (!implementacionId || !clienteId) {
    throw new Error("Falta la implementacion del cliente para crear la tarea.");
  }

  const { data: ultimaTarea, error: errorUltimaTarea } = await supabase
    .from("implementacion_tareas")
    .select("orden")
    .eq("implementacion_id", implementacionId)
    .order("orden", { ascending: false })
    .limit(1);

  if (errorUltimaTarea) {
    console.error(errorUltimaTarea);
    throw errorUltimaTarea;
  }

  const orden = Number(ultimaTarea?.[0]?.orden || 0) + 1;

  const { error } = await supabase.from("implementacion_tareas").insert([
    {
      implementacion_id: implementacionId,
      cliente_id: clienteId,
      titulo,
      descripcion,
      responsable,
      prioridad,
      estado: "Pendiente",
      fecha_limite: fechaLimite || null,
      orden,
    },
  ]);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function actualizarImplementacion(id, datos) {
  const { error } = await supabase
    .from("implementaciones_cliente")
    .update({
      etapa: datos.etapa,
      estado: datos.estado,
      avance: Number(datos.avance || 0),
      notas: datos.notas,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function obtenerModulosCliente(clienteId) {
  if (!clienteId) return [];

  const { data, error } = await supabase
    .from("modulos_cliente")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("modulo", { ascending: true });

  if (error) {
    console.error(error);
    throw error;
  }

  return data.map(aModulo);
}

export async function guardarConfiguracionModulosCliente({
  clienteId,
  plan,
  modulosActivos,
  observaciones,
}) {
  if (!clienteId) throw new Error("Selecciona un cliente.");

  const seleccion = new Set(modulosActivos || []);
  const registros = catalogoModulosTactika.map((item) => ({
    cliente_id: clienteId,
    modulo: item.modulo,
    estado: seleccion.has(item.modulo) ? "Activo" : "Inactivo",
    plan: plan || "Base",
    observaciones: observaciones || "",
  }));

  const { error } = await supabase
    .from("modulos_cliente")
    .upsert(registros, { onConflict: "cliente_id,modulo" });

  if (error) {
    console.error(error);
    throw error;
  }
}
