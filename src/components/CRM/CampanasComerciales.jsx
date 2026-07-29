import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Mail,
  MessageSquareText,
  PauseCircle,
  PlayCircle,
  Send,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  actualizarEstadoCampana,
  actualizarEstadoMensajeProgramado,
  crearCampanaConMensajes,
  obtenerCampanasComerciales,
  obtenerMensajesProgramados,
} from "../../services/CampanaComercialService";

const plantillasCampana = [
  {
    id: "primer-contacto",
    nombre: "Primer contacto",
    generar: (p) =>
      `Hola${p.contactoNombre ? ` ${p.contactoNombre}` : ""}, soy Claudio Urra de Tactika Consulting. Estamos conversando con empresas${p.giro ? ` del rubro ${p.giro}` : ""} para conocer como estan gestionando clientes, procesos y seguimiento comercial. Me gustaria coordinar una conversacion breve de 15 minutos para entender como trabajan hoy y ver si podemos aportar valor mediante un diagnostico empresarial.`,
  },
  {
    id: "invitacion-diagnostico",
    nombre: "Invitacion a diagnostico",
    generar: (p) =>
      `Hola${p.contactoNombre ? ` ${p.contactoNombre}` : ""}, en Tactika ayudamos a pymes como ${p.empresa} a ordenar procesos, seguimiento comercial e informacion clave. Podemos partir con un diagnostico breve para detectar oportunidades de mejora y definir un plan accionable. ¿Te acomoda coordinar 15 minutos esta semana?`,
  },
  {
    id: "seguimiento",
    nombre: "Seguimiento",
    generar: (p) =>
      `Hola${p.contactoNombre ? ` ${p.contactoNombre}` : ""}, retomo contacto por Tactika Consulting. Queria saber si sigue siendo prioridad revisar oportunidades para mejorar la gestion de ${p.empresa}. Si te parece, puedo enviarte una propuesta simple para partir con un diagnostico empresarial.`,
  },
];

function limpiarTelefono(telefono) {
  return String(telefono || "").replace(/[^\d]/g, "");
}

function crearWhatsAppUrl(prospecto, mensaje) {
  const telefono = limpiarTelefono(prospecto.telefono);
  const numero = telefono.startsWith("56") ? telefono : `56${telefono}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

function crearCorreoUrl(prospecto, asunto, mensaje) {
  return `mailto:${prospecto.correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
}

function fechaInputManana() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 1);
  fecha.setHours(9, 30, 0, 0);
  return fecha.toISOString().slice(0, 16);
}

function formatoFecha(fecha) {
  if (!fecha) return "Sin fecha";
  return new Date(fecha).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function estadoClase(estado) {
  const clases = {
    Programado: "bg-blue-50 text-blue-700 border-blue-100",
    Preparado: "bg-amber-50 text-amber-700 border-amber-100",
    Enviado: "bg-green-50 text-green-700 border-green-100",
    Respondio: "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Sin respuesta": "bg-slate-50 text-slate-600 border-slate-100",
    Cancelado: "bg-red-50 text-red-700 border-red-100",
  };

  return clases[estado] || "bg-slate-50 text-slate-600 border-slate-100";
}

export default function CampanasComerciales({ prospectos, onRegistrarEnvio }) {
  const [campanas, setCampanas] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [nombre, setNombre] = useState("Prospeccion inicial Tactika");
  const [canal, setCanal] = useState("correo");
  const [plantillaId, setPlantillaId] = useState("primer-contacto");
  const [fechaProgramada, setFechaProgramada] = useState(fechaInputManana());
  const [seleccionados, setSeleccionados] = useState({});

  const plantilla = plantillasCampana.find((p) => p.id === plantillaId) || plantillasCampana[0];
  const prospectosValidos = prospectos.filter((p) =>
    canal === "correo" ? p.correo : limpiarTelefono(p.telefono)
  );
  const mensajesPendientes = mensajes.filter((m) =>
    ["Programado", "Preparado", "Sin respuesta"].includes(m.estado)
  );

  const totalSeleccionados = useMemo(
    () => Object.values(seleccionados).filter(Boolean).length,
    [seleccionados]
  );

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setErrorCarga("");
    try {
      const [dataCampanas, dataMensajes] = await Promise.all([
        obtenerCampanasComerciales(),
        obtenerMensajesProgramados(),
      ]);
      setCampanas(dataCampanas);
      setMensajes(dataMensajes);
    } catch (error) {
      setErrorCarga(error.message);
    } finally {
      setCargando(false);
    }
  }

  function alternarProspecto(id) {
    setSeleccionados((actual) => ({ ...actual, [id]: !actual[id] }));
  }

  function seleccionarPrimeros() {
    const nuevos = {};
    prospectosValidos.slice(0, 10).forEach((p) => {
      nuevos[p.id] = true;
    });
    setSeleccionados(nuevos);
  }

  function limpiarSeleccion() {
    setSeleccionados({});
  }

  async function crearCampana() {
    const prospectosSeleccionados = prospectos.filter((p) => seleccionados[p.id]);

    if (!nombre.trim()) {
      Swal.fire({ icon: "warning", title: "Falta el nombre de la campana" });
      return;
    }

    if (prospectosSeleccionados.length === 0) {
      Swal.fire({ icon: "warning", title: "Selecciona al menos un prospecto" });
      return;
    }

    const mensajesCampana = prospectosSeleccionados.map((prospecto) => ({
      prospectoId: prospecto.id,
      canal,
      asunto: `Tactika Consulting - ${prospecto.empresa}`,
      mensaje: plantilla.generar(prospecto),
      estado: "Programado",
      fechaProgramada: new Date(fechaProgramada).toISOString(),
    }));

    try {
      await crearCampanaConMensajes(
        {
          nombre,
          canal,
          plantilla: plantillaId,
          estado: "Programada",
          fechaProgramada: new Date(fechaProgramada).toISOString(),
        },
        mensajesCampana
      );

      await cargar();
      limpiarSeleccion();

      Swal.fire({
        icon: "success",
        title: "Campana programada",
        text: `Se dejaron ${mensajesCampana.length} mensajes listos para revision.`,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo crear la campana",
        text: error.message || "Revisa si las tablas de campanas existen en Supabase.",
      });
    }
  }

  async function registrarMensaje(mensaje, prospecto, estado = "Preparado") {
    await actualizarEstadoMensajeProgramado(mensaje.id, estado, {
      fechaEnvio: new Date().toISOString(),
    });

    if (onRegistrarEnvio) {
      await onRegistrarEnvio({
        prospectoId: prospecto.id,
        tipo: mensaje.canal,
        titulo: mensaje.canal === "correo" ? "Correo preparado desde campana" : "WhatsApp preparado desde campana",
        resultado: estado === "Enviado" ? "Marcado como enviado" : "Mensaje preparado desde campana comercial",
        detalle: mensaje.mensaje,
        fechaInteraccion: new Date().toISOString(),
        proximoSeguimiento: {
          fechaProximoContacto: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
          proximoPaso: "Revisar respuesta del prospecto",
        },
      });
    }

    await cargar();
  }

  async function prepararMensaje(mensaje) {
    const prospecto = prospectos.find((p) => p.id === mensaje.prospectoId);
    if (!prospecto) return;

    if (mensaje.canal === "whatsapp") {
      window.open(crearWhatsAppUrl(prospecto, mensaje.mensaje), "_blank", "noopener,noreferrer");
    } else {
      window.location.href = crearCorreoUrl(prospecto, mensaje.asunto, mensaje.mensaje);
    }

    await registrarMensaje(mensaje, prospecto, "Preparado");
  }

  async function marcarEnviado(mensaje) {
    const prospecto = prospectos.find((p) => p.id === mensaje.prospectoId);
    if (!prospecto) return;
    await registrarMensaje(mensaje, prospecto, "Enviado");
  }

  async function cancelarMensaje(mensaje) {
    await actualizarEstadoMensajeProgramado(mensaje.id, "Cancelado");
    await cargar();
  }

  async function cambiarCampana(campana, estado) {
    await actualizarEstadoCampana(campana.id, estado);
    await cargar();
  }

  if (cargando) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-500">
        Cargando campanas comerciales...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorCarga && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          No se pudo cargar el modulo de campanas. Revisa que la migracion de Supabase este aplicada.
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">Campanas comerciales</p>
            <h2 className="text-xl font-bold text-slate-800 mt-1">Programar mensajes</h2>
            <p className="text-sm text-slate-500 mt-1">
              Crea secuencias controladas. El sistema prepara el mensaje y registra seguimiento.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {campanas.length} campanas
            </span>
            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
              {mensajesPendientes.length} pendientes
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 mt-5">
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-500 uppercase">Nombre</span>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500 uppercase">Canal</span>
                <select
                  value={canal}
                  onChange={(e) => {
                    setCanal(e.target.value);
                    limpiarSeleccion();
                  }}
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                >
                  <option value="correo">Correo</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-500 uppercase">Fecha</span>
                <input
                  type="datetime-local"
                  value={fechaProgramada}
                  onChange={(e) => setFechaProgramada(e.target.value)}
                  className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-slate-500 uppercase">Plantilla</span>
              <select
                value={plantillaId}
                onChange={(e) => setPlantillaId(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
              >
                {plantillasCampana.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800 mb-2">Regla de seguridad</p>
              <p>
                WhatsApp se mantiene manual. Correo queda preparado para automatizar con Gmail,
                Resend o Brevo en una siguiente etapa.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-sm font-bold text-slate-700">Prospectos disponibles</h3>
                <p className="text-xs text-slate-400">
                  Se muestran solo prospectos con {canal === "correo" ? "correo" : "telefono"}.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={seleccionarPrimeros}
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Seleccionar 10
                </button>
                <button
                  onClick={limpiarSeleccion}
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {prospectosValidos.length === 0 ? (
                <p className="p-5 text-sm text-slate-400">No hay prospectos disponibles para este canal.</p>
              ) : (
                prospectosValidos.map((prospecto) => (
                  <label
                    key={prospecto.id}
                    className="flex items-center justify-between gap-4 p-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{prospecto.empresa}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {canal === "correo" ? prospecto.correo : prospecto.telefono}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!seleccionados[prospecto.id]}
                      onChange={() => alternarProspecto(prospecto.id)}
                    />
                  </label>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-sm text-slate-500">{totalSeleccionados} seleccionados</span>
              <button
                onClick={crearCampana}
                className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 flex items-center gap-2"
              >
                <CalendarClock size={16} />
                Programar campana
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Mensajes programados</h2>
            <p className="text-sm text-slate-500">Revisa cada mensaje antes de abrir el canal.</p>
          </div>
        </div>

        {mensajes.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-sm text-slate-400">
            Todavia no hay mensajes programados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500">
                  <th className="p-3 text-left">Prospecto</th>
                  <th className="p-3 text-left">Canal</th>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Estado</th>
                  <th className="p-3 text-left">Mensaje</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mensajes.map((mensaje) => {
                  const prospecto = prospectos.find((p) => p.id === mensaje.prospectoId);
                  const puedePreparar =
                    prospecto && !["Enviado", "Cancelado", "Respondio"].includes(mensaje.estado);

                  return (
                    <tr key={mensaje.id} className="border-b align-top hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">
                        {prospecto?.empresa || "Prospecto no disponible"}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          {mensaje.canal === "correo" ? <Mail size={14} /> : <MessageSquareText size={14} />}
                          {mensaje.canal}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{formatoFecha(mensaje.fechaProgramada)}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${estadoClase(mensaje.estado)}`}>
                          {mensaje.estado}
                        </span>
                      </td>
                      <td className="p-3 max-w-md">
                        <p className="line-clamp-3 text-slate-500">{mensaje.mensaje}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2 flex-wrap">
                          {puedePreparar && (
                            <button
                              onClick={() => prepararMensaje(mensaje)}
                              className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Send size={13} />
                              Preparar
                            </button>
                          )}
                          {puedePreparar && (
                            <button
                              onClick={() => marcarEnviado(mensaje)}
                              className="px-3 py-1.5 rounded-md border border-green-200 text-green-700 bg-green-50 text-xs font-semibold hover:bg-green-100 flex items-center gap-1"
                            >
                              <CheckCircle2 size={13} />
                              Enviado
                            </button>
                          )}
                          {!["Cancelado", "Enviado", "Respondio"].includes(mensaje.estado) && (
                            <button
                              onClick={() => cancelarMensaje(mensaje)}
                              className="px-3 py-1.5 rounded-md border border-red-200 text-red-700 bg-red-50 text-xs font-semibold hover:bg-red-100 flex items-center gap-1"
                            >
                              <XCircle size={13} />
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Campanas creadas</h2>
        {campanas.length === 0 ? (
          <p className="text-sm text-slate-400">No hay campanas creadas todavia.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {campanas.map((campana) => (
              <div key={campana.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{campana.nombre}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {campana.canal} · {formatoFecha(campana.fechaProgramada)}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {campana.estado}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  {campana.estado !== "Pausada" ? (
                    <button
                      onClick={() => cambiarCampana(campana, "Pausada")}
                      className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <PauseCircle size={13} />
                      Pausar
                    </button>
                  ) : (
                    <button
                      onClick={() => cambiarCampana(campana, "Programada")}
                      className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <PlayCircle size={13} />
                      Reactivar
                    </button>
                  )}
                  <button
                    onClick={() => cambiarCampana(campana, "Finalizada")}
                    className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
