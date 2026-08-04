import { obtenerImplementacionesCliente } from "./ImplementacionService";
import { obtenerProspectos } from "./ProspectoService";
import { obtenerVentasServicios } from "./VentaServicioService";
import { obtenerBitacoraCliente } from "./BitacoraClienteService";
import { obtenerClientes } from "./ClienteService";

function fechaClave(valor) {
  if (!valor) return null;
  return new Date(valor).toISOString().slice(0, 10);
}

function inicioDia(fecha = new Date()) {
  const base = new Date(fecha);
  base.setHours(0, 0, 0, 0);
  return base;
}

function finRango(dias) {
  const fecha = inicioDia();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

function clasificarFecha(fecha) {
  if (!fecha) return "sin_fecha";
  const actual = inicioDia(fecha);
  const hoy = inicioDia();
  if (actual < hoy) return "vencido";
  if (actual.getTime() === hoy.getTime()) return "hoy";
  if (actual <= finRango(7)) return "semana";
  return "futuro";
}

function ordenTipo(tipo) {
  const orden = {
    vencido: 0,
    hoy: 1,
    semana: 2,
    futuro: 3,
    sin_fecha: 4,
  };
  return orden[tipo] ?? 9;
}

async function obtenerBitacorasClientes(clientes) {
  const resultados = await Promise.all(
    clientes.map(async (cliente) => {
      try {
        const bitacora = await obtenerBitacoraCliente(cliente.id);
        return bitacora.map((evento) => ({
          ...evento,
          clienteNombre: cliente.nombre,
        }));
      } catch (error) {
        console.error(error);
        return [];
      }
    })
  );

  return resultados.flat();
}

export async function obtenerAgendaOperativa() {
  const [clientes, prospectos, implementaciones, ventas] = await Promise.all([
    obtenerClientes(),
    obtenerProspectos(),
    obtenerImplementacionesCliente(),
    obtenerVentasServicios(),
  ]);

  const bitacoras = await obtenerBitacorasClientes(clientes);

  const eventosProspectos = prospectos
    .filter((prospecto) => prospecto.fechaProximoContacto)
    .map((prospecto) => ({
      id: `prospecto-${prospecto.id}`,
      origenId: prospecto.id,
      tipo: "Prospecto",
      titulo: `Contactar a ${prospecto.empresa}`,
      descripcion: prospecto.problemaDetectado || prospecto.necesidad || "Seguimiento comercial",
      responsable: prospecto.contactoNombre || "Claudio Urra",
      fecha: prospecto.fechaProximoContacto,
      fechaClave: fechaClave(prospecto.fechaProximoContacto),
      estado: prospecto.estado,
      prioridad: prospecto.indiceTactika >= 60 ? "Alta" : "Media",
      clienteNombre: prospecto.empresa,
      ruta: "/crm",
    }));

  const eventosTareas = implementaciones.flatMap((proyecto) =>
    (proyecto.tareas || [])
      .filter((tarea) => tarea.estado !== "Completado")
      .map((tarea) => ({
        id: `tarea-${tarea.id}`,
        origenId: tarea.id,
        tipo: "Implementacion",
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        responsable: tarea.responsable || proyecto.implementacion?.responsable || "Tactika",
        fecha: tarea.fechaLimite,
        fechaClave: fechaClave(tarea.fechaLimite),
        estado: tarea.estado,
        prioridad: tarea.prioridad,
        clienteNombre: proyecto.clienteNombre,
        ruta: proyecto.clienteId ? `/clientes/${proyecto.clienteId}` : "/implementaciones",
      }))
  );

  const eventosCobros = ventas
    .filter((venta) => venta.fechaProximoCobro && !["Pagado", "Cancelado"].includes(venta.estado))
    .map((venta) => ({
      id: `cobro-${venta.id}`,
      origenId: venta.id,
      tipo: "Cobro",
      titulo: `Cobrar ${venta.servicio}`,
      descripcion: `${venta.modalidad} · ${venta.valor.toLocaleString("es-CL")} CLP`,
      responsable: "Claudio Urra",
      fecha: venta.fechaProximoCobro,
      fechaClave: fechaClave(venta.fechaProximoCobro),
      estado: venta.estado,
      prioridad: "Alta",
      clienteNombre: venta.clienteNombre,
      ruta: "/ventas",
    }));

  const eventosBitacora = bitacoras
    .filter((evento) => evento.proximoPaso)
    .slice(0, 20)
    .map((evento) => ({
      id: `bitacora-${evento.id}`,
      origenId: evento.id,
      tipo: "Bitacora",
      titulo: evento.proximoPaso,
      descripcion: evento.titulo,
      responsable: evento.responsable || "Tactika",
      fecha: evento.fechaEvento,
      fechaClave: fechaClave(evento.fechaEvento),
      estado: "Registrado",
      prioridad: "Media",
      clienteNombre: evento.clienteNombre,
      ruta: evento.clienteId ? `/clientes/${evento.clienteId}` : "/clientes",
    }));

  const eventos = [
    ...eventosProspectos,
    ...eventosTareas,
    ...eventosCobros,
    ...eventosBitacora,
  ]
    .map((evento) => ({
      ...evento,
      grupo: clasificarFecha(evento.fecha),
    }))
    .sort((a, b) => {
      const grupo = ordenTipo(a.grupo) - ordenTipo(b.grupo);
      if (grupo !== 0) return grupo;
      return String(a.fecha || "").localeCompare(String(b.fecha || ""));
    });

  return {
    eventos,
    metricas: {
      vencidos: eventos.filter((evento) => evento.grupo === "vencido").length,
      hoy: eventos.filter((evento) => evento.grupo === "hoy").length,
      semana: eventos.filter((evento) => evento.grupo === "semana").length,
      cobros: eventos.filter((evento) => evento.tipo === "Cobro").length,
    },
  };
}
