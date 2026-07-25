

---
### src/App.jsx
```javascript
import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
```


---
### src/components/CRM/AlertasSeguimiento.jsx
```javascript
import { AlertTriangle } from "lucide-react";

export default function AlertasSeguimiento({ prospectos, onEditar }) {
  const atrasados = prospectos.filter((p) => {
    if (!p.fechaProximoContacto) return false;
    if (p.estado === "Cliente" || p.estado === "Perdido") return false;
    return new Date(p.fechaProximoContacto) < new Date();
  });

  if (atrasados.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="text-red-600" size={18} />
        <h3 className="text-sm font-bold text-red-700">
          {atrasados.length} prospecto{atrasados.length > 1 ? "s" : ""} con seguimiento atrasado
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {atrasados.map((p) => {
          const dias = Math.floor((new Date() - new Date(p.fechaProximoContacto)) / (1000 * 60 * 60 * 24));
          return (
            <button
              key={p.id}
              onClick={() => onEditar(p)}
              className="flex items-center gap-2 bg-white border border-red-200 rounded-lg px-3 py-2 text-xs hover:bg-red-100 transition"
            >
              <span className="font-semibold text-slate-800">{p.empresa}</span>
              <span className="text-red-600 font-mono">{dias}d atrasado</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```


---
### src/components/CRM/DashboardComercial.jsx
```javascript
import { calcularMetricasComerciales } from "../../services/MetricasComerciales";

function formatoCLP(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CL");
}

export default function DashboardComercial({ prospectos, historial }) {
  const m = calcularMetricasComerciales(prospectos, historial);

  const cards = [
    { label: "Prospectos", valor: m.cantidadProspectos },
    { label: "Diagnósticos agendados", valor: m.diagnosticosAgendados },
    { label: "Diagnósticos realizados", valor: m.diagnosticosRealizados },
    { label: "Propuestas enviadas", valor: m.propuestasEnviadas },
    { label: "Clientes ganados", valor: m.clientesGanados, color: "text-green-600" },
    { label: "Clientes perdidos", valor: m.clientesPerdidos, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Cards principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-2xl font-bold font-mono ${c.color || "text-slate-800"}`}>{c.valor}</p>
          </div>
        ))}
      </div>

      {/* Monto y conversión */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white rounded-xl p-5">
          <p className="text-xs text-slate-400 mb-1">Monto potencial (pipeline activo)</p>
          <p className="text-2xl font-bold font-mono">{formatoCLP(m.montoPotencial)}</p>
        </div>
        <div className="bg-slate-900 text-white rounded-xl p-5">
          <p className="text-xs text-slate-400 mb-1">Monto vendido</p>
          <p className="text-2xl font-bold font-mono text-green-400">{formatoCLP(m.montoVendido)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-xs text-slate-500 mb-1">Conversión</p>
          <p className="text-2xl font-bold font-mono text-blue-600">{m.conversion}%</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-xs text-slate-500 mb-1">Tiempo promedio de cierre</p>
          <p className="text-2xl font-bold font-mono text-slate-800">
            {m.tiempoPromedioCierre === null ? "—" : `${m.tiempoPromedioCierre} días`}
          </p>
        </div>
      </div>

      {/* Agrupaciones */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Prospectos por comuna</h3>
          {m.porComuna.length === 0 ? (
            <p className="text-sm text-slate-400">Sin datos todavía.</p>
          ) : (
            <div className="space-y-3">
              {m.porComuna.map((c) => (
                <div key={c.nombre}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{c.nombre}</span>
                    <span className="font-mono">{c.cantidad}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(c.cantidad / m.cantidadProspectos) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Prospectos por rubro</h3>
          {m.porRubro.length === 0 ? (
            <p className="text-sm text-slate-400">Sin datos todavía.</p>
          ) : (
            <div className="space-y-3">
              {m.porRubro.map((r) => (
                <div key={r.nombre}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{r.nombre}</span>
                    <span className="font-mono">{r.cantidad}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(r.cantidad / m.cantidadProspectos) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ranking de oportunidades */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Ranking de oportunidades (pipeline activo)</h3>
        {m.ranking.length === 0 ? (
          <p className="text-sm text-slate-400">Sin prospectos activos con valor estimado todavía.</p>
        ) : (
          <div className="space-y-2">
            {m.ranking.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between border-b last:border-0 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-mono flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.empresa}</p>
                    <p className="text-xs text-slate-400">{p.estado} · {p.probabilidadCierre || 0}% probabilidad</p>
                  </div>
                </div>
                <span className="font-mono text-sm text-slate-700">{formatoCLP(p.valorEstimado)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```


---
### src/components/CRM/IndiceTactikaBadge.jsx
```javascript
import { categoriaIndiceTactika } from "../../services/IndiceTactika";

const estilos = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

export default function IndiceTactikaBadge({ puntaje }) {
  const { label, color } = categoriaIndiceTactika(puntaje || 0);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${estilos[color]}`}>
      <span className="font-mono">{puntaje || 0}</span> · {label}
    </span>
  );
}
```


---
### src/components/CRM/KanbanBoard.jsx
```javascript
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import KanbanCard from "./KanbanCard";

const columnas = [
  { estado: "Prospecto", color: "border-t-gray-400" },
  { estado: "Contactado", color: "border-t-blue-400" },
  { estado: "Diagnóstico Agendado", color: "border-t-cyan-400" },
  { estado: "Diagnóstico Realizado", color: "border-t-indigo-400" },
  { estado: "Propuesta Enviada", color: "border-t-amber-400" },
  { estado: "Negociación", color: "border-t-orange-400" },
  { estado: "Cliente", color: "border-t-green-400" },
  { estado: "Perdido", color: "border-t-red-400" },
];

export default function KanbanBoard({ prospectos, onCambiarEstado, onEditar }) {
  function handleDragEnd(result) {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    onCambiarEstado(draggableId, source.droppableId, destination.droppableId);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columnas.map((col) => {
          const items = prospectos.filter((p) => p.estado === col.estado);

          return (
            <div key={col.estado} className="flex-shrink-0 w-72">
              <div className={`bg-white rounded-t-lg border-t-4 ${col.color} border-x border-slate-200 p-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-700">{col.estado}</h3>
                  <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-mono">
                    {items.length}
                  </span>
                </div>
              </div>

              <Droppable droppableId={col.estado}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`border-x border-b border-slate-200 rounded-b-lg p-3 min-h-[120px] ${
                      snapshot.isDraggingOver ? "bg-blue-50" : "bg-slate-50"
                    }`}
                  >
                    {items.length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-xs text-slate-300 text-center py-4">Sin prospectos</p>
                    )}
                    {items.map((p, index) => (
                      <KanbanCard key={p.id} prospecto={p} index={index} onClick={onEditar} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
```


---
### src/components/CRM/KanbanCard.jsx
```javascript
import { Draggable } from "@hello-pangea/dnd";
import IndiceTactikaBadge from "./IndiceTactikaBadge";

export default function KanbanCard({ prospecto, index, onClick }) {
  const atrasado =
    prospecto.fechaProximoContacto &&
    new Date(prospecto.fechaProximoContacto) < new Date() &&
    prospecto.estado !== "Cliente" &&
    prospecto.estado !== "Perdido";

  return (
    <Draggable draggableId={prospecto.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(prospecto)}
          className={`bg-white rounded-lg border p-3 mb-3 cursor-pointer transition shadow-sm hover:shadow-md ${
            snapshot.isDragging ? "ring-2 ring-blue-400" : "border-slate-200"
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-sm text-slate-800 leading-tight">
              {prospecto.empresa}
            </h4>
            <IndiceTactikaBadge puntaje={prospecto.indiceTactika} />
          </div>

          {prospecto.contactoNombre && (
            <p className="text-xs text-slate-500 mb-1">{prospecto.contactoNombre}</p>
          )}

          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-slate-400">
              {prospecto.comuna || "Sin comuna"}
            </span>
            {prospecto.valorEstimado ? (
              <span className="font-mono text-slate-600">
                ${Number(prospecto.valorEstimado).toLocaleString("es-CL")}
              </span>
            ) : null}
          </div>

          {prospecto.fechaProximoContacto && (
            <div className={`mt-2 text-xs font-medium ${atrasado ? "text-red-600" : "text-slate-400"}`}>
              {atrasado ? "⚠ Atrasado" : "Próximo contacto"}: {prospecto.fechaProximoContacto}
            </div>
          )}

          {/* Espacio reservado para IA — no activo todavía */}
          {/* <RecomendacionIA prospecto={prospecto} /> */}
        </div>
      )}
    </Draggable>
  );
}
```


---
### src/components/CRM/ProspectoForm.jsx
```javascript
import { useState, useEffect } from "react";

const vacio = {
  empresa: "",
  rut: "",
  giro: "",
  comuna: "",
  region: "",
  numTrabajadores: "",
  contactoNombre: "",
  contactoCargo: "",
  correo: "",
  telefono: "",
  sitioWeb: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  usaSoftware: false,
  softwareActual: "",
  problemaDetectado: "",
  dolorPrincipal: "",
  necesidad: "",
  observaciones: "",
  origen: "Google Maps",
  estado: "Prospecto",
  fechaProximoContacto: "",
  valorEstimado: "",
  probabilidadCierre: "",
  muchoTrabajoAdministrativo: false,
  interesAlto: false,
  necesidadUrgente: false,
};

const origenes = ["Google Maps", "Facebook", "Instagram", "LinkedIn", "Referido", "Visita presencial", "Otro"];
const estados = ["Prospecto", "Contactado", "Diagnóstico Agendado", "Diagnóstico Realizado", "Propuesta Enviada", "Negociación", "Cliente", "Perdido"];

export default function ProspectoForm({ onGuardar, prospectoEditar, onCancelar }) {
  const [form, setForm] = useState(vacio);

  useEffect(() => {
    if (prospectoEditar) {
      setForm({ ...vacio, ...prospectoEditar });
    } else {
      setForm(vacio);
    }
  }, [prospectoEditar]);

  function cambiar(e) {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  function guardar(e) {
    e.preventDefault();
    onGuardar(form);
    if (!prospectoEditar) setForm(vacio);
  }

  return (
    <form onSubmit={guardar} className="bg-white rounded-xl shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          {prospectoEditar ? "Editar Prospecto" : "Nuevo Prospecto"}
        </h2>
        {prospectoEditar && (
          <button type="button" onClick={onCancelar} className="text-sm text-slate-500 hover:text-slate-700">
            Cancelar edición
          </button>
        )}
      </div>

      {/* Identificación */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Empresa</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <input name="empresa" placeholder="Nombre empresa" value={form.empresa} onChange={cambiar} required className="border rounded-lg p-2.5" />
          <input name="rut" placeholder="RUT" value={form.rut} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="giro" placeholder="Giro" value={form.giro} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="comuna" placeholder="Comuna" value={form.comuna} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="region" placeholder="Región" value={form.region} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="numTrabajadores" type="number" min="0" placeholder="N° trabajadores" value={form.numTrabajadores} onChange={cambiar} className="border rounded-lg p-2.5" />
        </div>
      </div>

      {/* Contacto */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Contacto</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <input name="contactoNombre" placeholder="Nombre contacto" value={form.contactoNombre} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="contactoCargo" placeholder="Cargo" value={form.contactoCargo} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="correo" type="email" placeholder="Correo" value={form.correo} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="sitioWeb" placeholder="Página web" value={form.sitioWeb} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="facebook" placeholder="Facebook" value={form.facebook} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="instagram" placeholder="Instagram" value={form.instagram} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="linkedin" placeholder="LinkedIn" value={form.linkedin} onChange={cambiar} className="border rounded-lg p-2.5" />
        </div>
      </div>

      {/* Diagnóstico comercial */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Diagnóstico comercial</h3>
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" name="usaSoftware" checked={form.usaSoftware} onChange={cambiar} id="usaSoftware" />
          <label htmlFor="usaSoftware" className="text-sm">¿Usa algún software actualmente?</label>
        </div>
        {form.usaSoftware && (
          <input name="softwareActual" placeholder="¿Cuál?" value={form.softwareActual} onChange={cambiar} className="border rounded-lg p-2.5 w-full mb-3" />
        )}
        <div className="grid md:grid-cols-2 gap-4 mb-3">
          <textarea name="problemaDetectado" placeholder="Problema detectado" value={form.problemaDetectado} onChange={cambiar} className="border rounded-lg p-2.5" rows="2" />
          <textarea name="dolorPrincipal" placeholder="Dolor principal" value={form.dolorPrincipal} onChange={cambiar} className="border rounded-lg p-2.5" rows="2" />
          <textarea name="necesidad" placeholder="Necesidad" value={form.necesidad} onChange={cambiar} className="border rounded-lg p-2.5" rows="2" />
          <textarea name="observaciones" placeholder="Observaciones" value={form.observaciones} onChange={cambiar} className="border rounded-lg p-2.5" rows="2" />
        </div>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="muchoTrabajoAdministrativo" checked={form.muchoTrabajoAdministrativo} onChange={cambiar} />
            Mucho trabajo administrativo
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="interesAlto" checked={form.interesAlto} onChange={cambiar} />
            Interés alto
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="necesidadUrgente" checked={form.necesidadUrgente} onChange={cambiar} />
            Necesidad urgente
          </label>
        </div>
      </div>

      {/* Comercial */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Seguimiento comercial</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <select name="origen" value={form.origen} onChange={cambiar} className="border rounded-lg p-2.5">
            {origenes.map((o) => <option key={o}>{o}</option>)}
          </select>
          <select name="estado" value={form.estado} onChange={cambiar} className="border rounded-lg p-2.5">
            {estados.map((e) => <option key={e}>{e}</option>)}
          </select>
          <input name="fechaProximoContacto" type="date" value={form.fechaProximoContacto || ""} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="valorEstimado" type="number" min="0" placeholder="Valor estimado ($)" value={form.valorEstimado} onChange={cambiar} className="border rounded-lg p-2.5" />
          <input name="probabilidadCierre" type="number" min="0" max="100" placeholder="Probabilidad cierre (%)" value={form.probabilidadCierre} onChange={cambiar} className="border rounded-lg p-2.5" />
        </div>
      </div>

      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
        {prospectoEditar ? "Actualizar Prospecto" : "Guardar Prospecto"}
      </button>
    </form>
  );
}
```


---
### src/components/CRM/ProspectoTable.jsx
```javascript
import IndiceTactikaBadge from "./IndiceTactikaBadge";

const estadoColor = {
  "Prospecto": "bg-gray-100 text-gray-700",
  "Contactado": "bg-blue-100 text-blue-700",
  "Diagnóstico Agendado": "bg-cyan-100 text-cyan-700",
  "Diagnóstico Realizado": "bg-indigo-100 text-indigo-700",
  "Propuesta Enviada": "bg-amber-100 text-amber-700",
  "Negociación": "bg-orange-100 text-orange-700",
  "Cliente": "bg-green-100 text-green-700",
  "Perdido": "bg-red-100 text-red-700",
};

export default function ProspectoTable({ prospectos, onEditar, onEliminar }) {
  if (prospectos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center text-slate-400">
        No hay prospectos registrados todavía.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-800 text-white">
          <tr>
            <th className="p-3 text-left">Empresa</th>
            <th className="p-3 text-left">Contacto</th>
            <th className="p-3 text-left">Comuna</th>
            <th className="p-3 text-left">Índice Táctika</th>
            <th className="p-3 text-left">Estado</th>
            <th className="p-3 text-left">Próximo contacto</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {prospectos.map((p) => {
            const atrasado = p.fechaProximoContacto && new Date(p.fechaProximoContacto) < new Date() && p.estado !== "Cliente" && p.estado !== "Perdido";
            return (
              <tr key={p.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-medium">{p.empresa}</td>
                <td className="p-3">{p.contactoNombre || "—"}</td>
                <td className="p-3">{p.comuna || "—"}</td>
                <td className="p-3"><IndiceTactikaBadge puntaje={p.indiceTactika} /></td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${estadoColor[p.estado] || "bg-gray-100 text-gray-700"}`}>
                    {p.estado}
                  </span>
                </td>
                <td className="p-3">
                  {p.fechaProximoContacto ? (
                    <span className={atrasado ? "text-red-600 font-semibold" : ""}>
                      {p.fechaProximoContacto}{atrasado ? " · Atrasado" : ""}
                    </span>
                  ) : "—"}
                </td>
                <td className="p-3 text-center space-x-3 whitespace-nowrap">
                  <button onClick={() => onEditar(p)} className="text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => onEliminar(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```


---
### src/components/CRM/RecomendacionIA.jsx
```javascript
import { Sparkles } from "lucide-react";

/**
 * Espacio reservado en la UI para la futura recomendación de IA.
 * Por ahora solo muestra un estado "próximamente" — no llama a ningún servicio.
 */
export default function RecomendacionIA({ prospecto }) {
  const tieneRecomendacion = !!prospecto?.recomendacionIA?.disponible;

  if (!tieneRecomendacion) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Recomendación IA</p>
          <p className="text-xs text-slate-400">Próximamente: sugerencias automáticas de módulo, asesoría y probabilidad de cierre.</p>
        </div>
      </div>
    );
  }

  // Cuando la IA esté implementada, aquí se muestra la recomendación real.
  const r = prospecto.recomendacionIA;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-blue-600" />
        <p className="text-sm font-bold text-blue-700">Recomendación IA</p>
      </div>
      <p className="text-sm text-slate-700 mb-1"><strong>Módulo sugerido:</strong> {r.moduloRecomendado}</p>
      <p className="text-sm text-slate-700 mb-1"><strong>Tipo de asesoría:</strong> {r.tipoAsesoria}</p>
      <p className="text-sm text-slate-700"><strong>Probabilidad de cierre estimada:</strong> {r.probabilidadCierreIA}%</p>
    </div>
  );
}
```


---
### src/components/Clientes/ClienteCard.jsx
```javascript

```


---
### src/components/Clientes/ClienteForm.jsx
```javascript
import { useState, useEffect } from "react";

export default function ClienteForm({ onGuardar, clienteEditar }) {
  const vacio = {
    nombre: "",
    rut: "",
    giro: "",
    contacto: "",
    email: "",
    telefono: "",
    estado: "Prospecto",
  };

  const [cliente, setCliente] = useState(vacio);

  useEffect(() => {
    if (clienteEditar) {
      setCliente(clienteEditar);
    } else {
      setCliente(vacio);
    }
  }, [clienteEditar]);

  const cambiarValor = (e) => {
    setCliente({
      ...cliente,
      [e.target.name]: e.target.value,
    });
  };

  const guardar = (e) => {
    e.preventDefault();

    onGuardar(cliente);

    setCliente(vacio);
  };

  return (
    <form
      onSubmit={guardar}
      className="bg-white rounded-xl shadow p-6 space-y-4"
    >
      <h2 className="text-2xl font-bold">
        {clienteEditar ? "Editar Empresa Cliente" : "Nueva Empresa Cliente"}
      </h2>

      <input
        className="w-full border rounded p-2"
        placeholder="Empresa"
        name="nombre"
        value={cliente.nombre}
        onChange={cambiarValor}
      />

      <input
        className="w-full border rounded p-2"
        placeholder="RUT"
        name="rut"
        value={cliente.rut}
        onChange={cambiarValor}
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Giro"
        name="giro"
        value={cliente.giro}
        onChange={cambiarValor}
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Contacto"
        name="contacto"
        value={cliente.contacto}
        onChange={cambiarValor}
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Correo"
        name="email"
        value={cliente.email}
        onChange={cambiarValor}
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Teléfono"
        name="telefono"
        value={cliente.telefono}
        onChange={cambiarValor}
      />

      <select
        className="w-full border rounded p-2"
        name="estado"
        value={cliente.estado}
        onChange={cambiarValor}
      >
        <option>Prospecto</option>
        <option>Activo</option>
        <option>En Consultoría</option>
        <option>Finalizado</option>
      </select>

      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        {clienteEditar ? "Actualizar Empresa" : "Guardar Empresa"}
      </button>
    </form>
  );
}
```


---
### src/components/Clientes/ClienteModal.jsx
```javascript

```


---
### src/components/Clientes/ClienteSearch.jsx
```javascript
export default function ClienteSearch({ buscar, setBuscar }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <label className="block text-sm font-semibold text-gray-600 mb-2">
        Buscar empresa
      </label>

      <input
        type="text"
        placeholder="Buscar por empresa, RUT, contacto o correo..."
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
}
```


---
### src/components/Clientes/ClienteStats.jsx
```javascript
export default function ClienteStats({ clientes }) {
  const total = clientes.length;

  const prospectos = clientes.filter(
    (cliente) => cliente.estado === "Prospecto"
  ).length;

  const activos = clientes.filter(
    (cliente) => cliente.estado === "Activo"
  ).length;

  const consultoria = clientes.filter(
    (cliente) => cliente.estado === "En Consultoría"
  ).length;

  const finalizados = clientes.filter(
    (cliente) => cliente.estado === "Finalizado"
  ).length;

  const cards = [
    {
      titulo: "Total Empresas",
      valor: total,
      color: "bg-slate-800",
    },
    {
      titulo: "Prospectos",
      valor: prospectos,
      color: "bg-yellow-500",
    },
    {
      titulo: "Activos",
      valor: activos,
      color: "bg-green-600",
    },
    {
      titulo: "En Consultoría",
      valor: consultoria,
      color: "bg-blue-600",
    },
    {
      titulo: "Finalizados",
      valor: finalizados,
      color: "bg-gray-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.titulo}
          className={`${card.color} text-white rounded-xl shadow-lg p-6`}
        >
          <p className="text-sm opacity-80">{card.titulo}</p>

          <h2 className="text-4xl font-bold mt-2">
            {card.valor}
          </h2>
        </div>
      ))}
    </div>
  );
}
```


---
### src/components/Clientes/ClienteTable.jsx
```javascript
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";

export default function ClienteTable({
  clientes,
  onEliminar,
  onEditar,
}) {
  if (clientes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-500">
          No existen empresas registradas
        </h3>

        <p className="text-gray-400 mt-2">
          Agrega tu primera empresa para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-slate-800 text-white">

          <tr>

            <th className="p-4 text-left">Empresa</th>
            <th className="p-4 text-left">Contacto</th>
            <th className="p-4 text-left">Correo</th>
            <th className="p-4 text-left">Estado</th>
            <th className="p-4 text-center">Acciones</th>

          </tr>

        </thead>

        <tbody>

          {clientes.map((cliente) => (

            <tr
              key={cliente.id}
              className="border-b hover:bg-gray-50"
            >

              <td className="p-4 font-medium">
                {cliente.nombre}
              </td>

              <td className="p-4">
                {cliente.contacto}
              </td>

              <td className="p-4">
                {cliente.email}
              </td>

              <td className="p-4">

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold

                  ${
                    cliente.estado === "Activo"
                      ? "bg-green-100 text-green-700"

                    : cliente.estado === "Prospecto"
                      ? "bg-yellow-100 text-yellow-700"

                    : cliente.estado === "En Consultoría"
                      ? "bg-blue-100 text-blue-700"

                    : "bg-gray-200 text-gray-700"
                  }

                  `}
                >

                  {cliente.estado}

                </span>

              </td>

              <td className="p-4">

                <div className="flex justify-center gap-3">

                  <button
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEye />
                  </button>

                  <button
                    onClick={() => onEditar(cliente)}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => onEliminar(cliente.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}
```


---
### src/components/Clientes/index.js
```javascript

```


---
### src/components/Dashboard/DashboardCards.jsx
```javascript
import {
  FaUsers,
  FaClipboardCheck,
  FaTasks,
  FaChartLine,
  FaCalendarCheck,
} from "react-icons/fa";

export default function DashboardCards({
  clientes = 0,
  diagnosticos = 0,
  planes = 0,
  seguimientos = 0,
  cumplimiento = 0,
}) {
  const cards = [
    {
      titulo: "Clientes",
      valor: clientes,
      icono: <FaUsers size={30} />,
      color: "bg-blue-500",
    },
    {
      titulo: "Diagnósticos",
      valor: diagnosticos,
      icono: <FaClipboardCheck size={30} />,
      color: "bg-green-500",
    },
    {
      titulo: "Planes de Acción",
      valor: planes,
      icono: <FaTasks size={30} />,
      color: "bg-orange-500",
    },
    {
      titulo: "Seguimientos",
      valor: seguimientos,
      icono: <FaCalendarCheck size={30} />,
      color: "bg-cyan-500",
    },
    {
      titulo: "Cumplimiento",
      valor: `${cumplimiento}%`,
      icono: <FaChartLine size={30} />,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
      {cards.map((card) => (
        <div
          key={card.titulo}
          className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-slate-100"
        >
          <div className="flex justify-between items-center">
            <div className="min-w-0 pr-3">
              <p className="text-gray-500 text-sm font-medium truncate">
                {card.titulo}
              </p>

              <h2 className="text-3xl font-bold mt-2 text-slate-800">
                {card.valor}
              </h2>
            </div>

            <div className={`${card.color} text-white rounded-xl p-4 shrink-0`}>
              {card.icono}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```


---
### src/components/Dashboard/DashboardChart.jsx
```javascript
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function DashboardChart({
  clientes = 0,
  diagnosticos = 0,
  planes = 0,
  seguimientos = 0,
}) {
  const data = {
    labels: [
      "Clientes",
      "Diagnósticos",
      "Planes",
      "Seguimientos",
    ],
    datasets: [
      {
        label: "Registros",
        data: [
          clientes,
          diagnosticos,
          planes,
          seguimientos,
        ],
        backgroundColor: [
          "#2563EB",
          "#10B981",
          "#F59E0B",
          "#06B6D4",
        ],
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 55,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0F172A",
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#475569",
          font: {
            size: 13,
            weight: "bold",
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: "#64748B",
        },
        grid: {
          color: "#E2E8F0",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Resumen General
          </h2>

          <p className="text-slate-500 text-sm">
            Estado general del sistema
          </p>
        </div>
      </div>

      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
```


---
### src/components/Dashboard/PendingPlans.jsx
```javascript
import {
  AlertTriangle,
  Clock3,
  CheckCircle2,
} from "lucide-react";

const estilosPorEstado = {
  Pendiente: { color: "bg-red-100 text-red-700", icono: <AlertTriangle size={18} /> },
  "En Proceso": { color: "bg-yellow-100 text-yellow-700", icono: <Clock3 size={18} /> },
  Finalizado: { color: "bg-green-100 text-green-700", icono: <CheckCircle2 size={18} /> },
};

export default function PendingPlans({ planes = [] }) {
  const proximos = planes
    .filter((p) => p.estado !== "Finalizado" && p.fechaLimite)
    .sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Próximos Planes
      </h2>

      {proximos.length === 0 ? (
        <p className="text-sm text-slate-400">
          No hay planes pendientes con fecha límite registrada.
        </p>
      ) : (
        <div className="space-y-4">
          {proximos.map((plan) => {
            const estilo = estilosPorEstado[plan.estado] || estilosPorEstado.Pendiente;

            return (
              <div
                key={plan.id}
                className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {plan.accion}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {plan.empresa}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Fecha límite: {plan.fechaLimite}
                    </p>
                  </div>

                  <span
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${estilo.color}`}
                  >
                    {estilo.icono}
                    {plan.estado}
                  </span>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
```


---
### src/components/Dashboard/QuickActions.jsx
```javascript
import { useNavigate } from "react-router-dom";
import {
  Users,
  ClipboardCheck,
  Target,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";

export default function QuickActions() {
  const navigate = useNavigate();

  const acciones = [
    {
      titulo: "Clientes",
      descripcion: "Administrar clientes",
      icono: <Users size={24} />,
      color: "bg-blue-500",
      ruta: "/clientes",
    },
    {
      titulo: "Diagnósticos",
      descripcion: "Ver diagnósticos",
      icono: <ClipboardCheck size={24} />,
      color: "bg-green-500",
      ruta: "/diagnosticos",
    },
    {
      titulo: "Planes",
      descripcion: "Gestionar planes",
      icono: <Target size={24} />,
      color: "bg-orange-500",
      ruta: "/planes",
    },
    {
      titulo: "Seguimientos",
      descripcion: "Control de seguimiento",
      icono: <CalendarCheck size={24} />,
      color: "bg-cyan-500",
      ruta: "/seguimiento",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Accesos rápidos
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        {acciones.map((accion) => (
          <button
            key={accion.titulo}
            onClick={() => navigate(accion.ruta)}
            className="text-left border border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-center">

              <div className={`${accion.color} text-white rounded-xl p-3`}>
                {accion.icono}
              </div>

              <ArrowRight className="text-slate-400" size={20} />

            </div>

            <h3 className="font-bold text-slate-800 mt-4">
              {accion.titulo}
            </h3>

            <p className="text-sm text-slate-500">
              {accion.descripcion}
            </p>

          </button>
        ))}

      </div>

    </div>
  );
}
```


---
### src/components/Dashboard/RecentActivity.jsx
```javascript
import {
  Building2,
  ClipboardCheck,
  Target,
  CalendarCheck,
  Activity,
} from "lucide-react";

function tiempoRelativo(fechaISO) {
  if (!fechaISO) return "";

  const diffMs = Date.now() - new Date(fechaISO).getTime();
  const minutos = Math.floor(diffMs / 60000);

  if (minutos < 1) return "Justo ahora";
  if (minutos < 60) return `Hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} hora${horas > 1 ? "s" : ""}`;

  const dias = Math.floor(horas / 24);
  return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
}

export default function RecentActivity({
  clientes = [],
  diagnosticos = [],
  planes = [],
  seguimientos = [],
}) {
  const actividades = [
    ...clientes.map((c) => ({
      icono: <Building2 className="text-blue-600" size={20} />,
      titulo: "Nuevo cliente registrado",
      descripcion: c.nombre || "Empresa incorporada al sistema.",
      fecha: c.createdAt,
    })),
    ...diagnosticos.map((d) => ({
      icono: <ClipboardCheck className="text-green-600" size={20} />,
      titulo: "Diagnóstico completado",
      descripcion: d.empresa || "Se registró un nuevo diagnóstico.",
      fecha: d.createdAt,
    })),
    ...planes.map((p) => ({
      icono: <Target className="text-orange-500" size={20} />,
      titulo: "Plan de acción creado",
      descripcion: p.accion || "Nuevo plan disponible.",
      fecha: p.createdAt,
    })),
    ...seguimientos.map((s) => ({
      icono: <CalendarCheck className="text-cyan-600" size={20} />,
      titulo: "Seguimiento registrado",
      descripcion: s.tarea || "Se modificó el estado de una tarea.",
      fecha: s.createdAt,
    })),
  ]
    .filter((a) => a.fecha)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 6);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">

      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-blue-600" />

        <h2 className="text-xl font-bold text-slate-800">
          Actividad Reciente
        </h2>
      </div>

      {actividades.length === 0 ? (
        <p className="text-sm text-slate-400">
          Todavía no hay actividad registrada.
        </p>
      ) : (
        <div className="space-y-4">
          {actividades.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition"
            >
              <div className="bg-slate-100 p-3 rounded-xl">
                {item.icono}
              </div>

              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-slate-800">
                    {item.titulo}
                  </h3>

                  <span className="text-xs text-slate-400">
                    {tiempoRelativo(item.fecha)}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  {item.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
```


---
### src/components/Dashboard/WelcomeBanner.jsx
```javascript
import { Calendar, TrendingUp } from "lucide-react";

export default function WelcomeBanner() {
  const fecha = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl p-8 shadow-lg">

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">

        <div>
          <h1 className="text-3xl font-bold">
            Bienvenido a Táctika Business Suite
          </h1>

          <p className="mt-3 text-blue-100">
            Administra clientes, diagnósticos, planes de acción y seguimientos
            desde un solo lugar.
          </p>
        </div>

        <div className="flex gap-6">

          <div className="bg-white/20 rounded-xl p-4 text-center min-w-[150px]">
            <Calendar className="mx-auto mb-2" />
            <p className="text-sm">Hoy</p>
            <p className="font-semibold capitalize">{fecha}</p>
          </div>

          <div className="bg-white/20 rounded-xl p-4 text-center min-w-[150px]">
            <TrendingUp className="mx-auto mb-2" />
            <p className="text-sm">Estado</p>
            <p className="font-semibold">Sistema Operativo</p>
          </div>

        </div>

      </div>

    </div>
  );
}
```


---
### src/components/Dashboard/index.js
```javascript
export { default as DashboardCards } from "./DashboardCards";
export { default as DashboardChart } from "./DashboardChart";
export { default as RecentActivity } from "./RecentActivity";
export { default as PendingPlans } from "./PendingPlans";
export { default as QuickActions } from "./QuickActions";
export { default as WelcomeBanner } from "./WelcomeBanner";
```


---
### src/components/Diagnostico/DiagnosticoForm.jsx
```javascript
import { useState } from "react";

const preguntas = [
  {
    categoria: "Estrategia",
    items: [
      "La empresa tiene misión definida",
      "La empresa tiene visión definida",
      "Existen objetivos estratégicos"
    ]
  },
  {
    categoria: "Marketing",
    items: [
      "Existe un plan de marketing",
      "Se realizan campañas digitales",
      "Se mide la satisfacción del cliente"
    ]
  }
];

export default function DiagnosticoForm({ onGuardar, clientes = [] }) {
  const [clienteId, setClienteId] = useState("");

  const [respuestas, setRespuestas] = useState(
    preguntas.flatMap((categoria) =>
      categoria.items.map((pregunta) => ({
        categoria: categoria.categoria,
        pregunta,
        valor: 3,
      }))
    )
  );

  function cambiarValor(index, valor) {
    const copia = [...respuestas];
    copia[index].valor = Number(valor);
    setRespuestas(copia);
  }

  function guardar(e) {
    e.preventDefault();

    const cliente = clientes.find((c) => c.id === clienteId);

    onGuardar({
      clienteId,
      empresa: cliente ? cliente.nombre : "",
      preguntas: respuestas,
    });

    setClienteId("");

    setRespuestas(
      preguntas.flatMap((categoria) =>
        categoria.items.map((pregunta) => ({
          categoria: categoria.categoria,
          pregunta,
          valor: 3,
        }))
      )
    );
  }

  let indice = 0;

  return (
    <form
      onSubmit={guardar}
      className="bg-white rounded-xl shadow-lg p-8 space-y-8"
    >
      <div>
        <label className="block font-semibold mb-2">
          Empresa
        </label>

        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          required
          className="w-full border rounded-lg p-3"
        >
          <option value="">-- Seleccionar Cliente --</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </option>
          ))}
        </select>

        {clientes.length === 0 && (
          <p className="text-xs text-red-500 mt-2">
            No hay clientes registrados todavía. Ve a "Clientes" y registra al menos una empresa antes de crear un diagnóstico.
          </p>
        )}
      </div>

      {preguntas.map((categoria) => (
        <div key={categoria.categoria}>
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            {categoria.categoria}
          </h2>

          <div className="space-y-4">
            {categoria.items.map((pregunta) => {
              const actual = indice++;

              return (
                <div key={pregunta} className="border rounded-lg p-4">
                  <p className="font-medium mb-3">{pregunta}</p>

                  <select
                    value={respuestas[actual].valor}
                    onChange={(e) => cambiarValor(actual, e.target.value)}
                    className="border rounded-lg p-2"
                  >
                    <option value="1">1 - Muy Deficiente</option>
                    <option value="2">2 - Deficiente</option>
                    <option value="3">3 - Aceptable</option>
                    <option value="4">4 - Bueno</option>
                    <option value="5">5 - Excelente</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
        Guardar Diagnóstico
      </button>
    </form>
  );
}
```


---
### src/components/Diagnostico/DiagnosticoStats.jsx
```javascript

```


---
### src/components/Diagnostico/PreguntaCard.jsx
```javascript

```


---
### src/components/Diagnostico/ResultadoCard.jsx
```javascript

```


---
### src/components/Diagnostico/index.js
```javascript

```


---
### src/components/RutaProtegida.jsx
```javascript
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida() {
  const { sesion, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Cargando...
      </div>
    );
  }

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```


---
### src/components/Seguimiento/SeguimientoForm.jsx
```javascript
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

export default function SeguimientoForm({
  onGuardar,
  seguimientoSeleccionado,
}) {
  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  useEffect(() => {
    if (seguimientoSeleccionado) {
      reset(seguimientoSeleccionado);
    } else {
      reset({
        tarea: "",
        responsable: "",
        fecha: "",
        estado: "Pendiente",
      });
    }
  }, [seguimientoSeleccionado, reset]);

  const guardar = (data) => {
    if (seguimientoSeleccionado?.id) {
      data.id = seguimientoSeleccionado.id;
      data.fechaCreacion = seguimientoSeleccionado.fechaCreacion;
    }

    onGuardar(data);

    Swal.fire({
      icon: "success",
      title: "Guardado",
      text: "Seguimiento guardado correctamente.",
      timer: 1500,
      showConfirmButton: false,
    });

    reset({
      tarea: "",
      responsable: "",
      fecha: "",
      estado: "Pendiente",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(guardar)}
      className="bg-white rounded-xl shadow-md p-6 mb-6"
    >
      <h2 className="text-xl font-bold mb-6">
        {seguimientoSeleccionado
          ? "Editar Seguimiento"
          : "Nuevo Seguimiento"}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        <div>
          <label className="block mb-2 font-medium">
            Tarea
          </label>

          <input
            {...register("tarea", { required: true })}
            className="w-full border rounded-lg p-3"
            placeholder="Nombre de la tarea"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Responsable
          </label>

          <input
            {...register("responsable", { required: true })}
            className="w-full border rounded-lg p-3"
            placeholder="Responsable"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Fecha límite
          </label>

          <input
            type="date"
            {...register("fecha", { required: true })}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Estado
          </label>

          <select
            {...register("estado")}
            className="w-full border rounded-lg p-3"
          >
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Completado</option>
          </select>
        </div>

      </div>

      <button
        type="submit"
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
      >
        Guardar Seguimiento
      </button>
    </form>
  );
}
```


---
### src/components/Seguimiento/SeguimientoStats.jsx
```javascript
export default function SeguimientoStats({ estadisticas }) {
  const cards = [
    {
      titulo: "Total",
      valor: estadisticas.total,
      color: "bg-blue-500",
    },
    {
      titulo: "Pendientes",
      valor: estadisticas.pendientes,
      color: "bg-red-500",
    },
    {
      titulo: "En proceso",
      valor: estadisticas.proceso,
      color: "bg-yellow-500",
    },
    {
      titulo: "Completados",
      valor: estadisticas.completados,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => (
        <div
          key={card.titulo}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className={`w-3 h-3 rounded-full ${card.color} mb-3`} />

          <h3 className="text-gray-500 text-sm">
            {card.titulo}
          </h3>

          <p className="text-3xl font-bold mt-2">
            {card.valor}
          </p>
        </div>
      ))}
    </div>
  );
}
```


---
### src/components/Seguimiento/SeguimientoTable.jsx
```javascript
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function SeguimientoTable({
  seguimientos,
  onEditar,
  onEliminar,
}) {
  const eliminar = (id) => {
    Swal.fire({
      title: "¿Eliminar seguimiento?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        onEliminar(id);

        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "Seguimiento eliminado correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const colorEstado = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-red-100 text-red-700";

      case "En proceso":
        return "bg-yellow-100 text-yellow-700";

      case "Completado":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="text-left p-4">Tarea</th>

            <th className="text-left p-4">Responsable</th>

            <th className="text-left p-4">Fecha</th>

            <th className="text-left p-4">Estado</th>

            <th className="text-center p-4">Acciones</th>

          </tr>

        </thead>

        <tbody>

          {seguimientos.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="text-center py-10 text-gray-500"
              >
                No existen seguimientos registrados.
              </td>
            </tr>
          ) : (
            seguimientos.map((item) => (
              <tr
                key={item.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="p-4">{item.tarea}</td>

                <td className="p-4">{item.responsable}</td>

                <td className="p-4">{item.fecha}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${colorEstado(
                      item.estado
                    )}`}
                  >
                    {item.estado}
                  </span>
                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-3">

                    <button
                      onClick={() => onEditar(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => eliminar(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}
```


---
### src/components/Seguimiento/index.js
```javascript
export { default as SeguimientoForm } from "./SeguimientoForm";
export { default as SeguimientoStats } from "./SeguimientoStats";
export { default as SeguimientoTable } from "./SeguimientoTable";
```


---
### src/components/layout/Header.jsx
```javascript
export default function Header() {
  return (
    <header className="bg-white h-16 shadow flex items-center justify-between px-8">

      <h2 className="text-xl font-semibold">
        Táctika Business Suite
      </h2>

      <div>

        <p className="font-medium">
          Claudio Urra
        </p>

      </div>

    </header>
  );
}
```


---
### src/components/layout/Logo.jsx
```javascript
export default function Logo() {
  return (
    <div className="p-6 border-b border-slate-700">
      <h1 className="text-3xl font-bold text-white">
        Táctika
      </h1>

      <p className="text-gray-400 text-sm mt-1">
        Business Suite
      </p>
    </div>
  );
}
```


---
### src/components/layout/Sidebar.jsx
```javascript
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Target,
  CalendarCheck,
  BarChart3,
  Settings,
  Briefcase,
} from "lucide-react";

import Logo from "./Logo";
import SidebarItem from "./SidebarItem";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-slate-900 min-h-screen flex flex-col shadow-xl">

      <Logo />

      <nav className="flex-1 mt-6 space-y-1">

        <SidebarItem
          to="/"
          icon={LayoutDashboard}
          text="Dashboard"
        />

        <SidebarItem
          to="/clientes"
          icon={Users}
          text="Clientes"
        />

        <SidebarItem
          to="/diagnosticos"
          icon={ClipboardCheck}
          text="Diagnósticos"
        />

        <SidebarItem
          to="/planes"
          icon={Target}
          text="Planes de Acción"
        />

        <SidebarItem
          to="/seguimiento"
          icon={CalendarCheck}
          text="Seguimiento"
        />

        <SidebarItem
          to="/crm"
          icon={Briefcase}
          text="CRM Comercial"
        />

        <SidebarItem
          to="/reportes"
          icon={BarChart3}
          text="Reportes"
        />

        <SidebarItem
          to="/configuracion"
          icon={Settings}
          text="Configuración"
        />

      </nav>

      <div className="border-t border-slate-700 p-4">

        <p className="text-gray-400 text-xs text-center">
          Táctika Business Suite
        </p>

        <p className="text-gray-500 text-xs text-center mt-1">
          Versión 1.0
        </p>

      </div>

    </aside>
  );
}
```


---
### src/components/layout/SidebarItem.jsx
```javascript
import { NavLink } from "react-router-dom";

export default function SidebarItem({
  to,
  icon: Icon,
  text,
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-6 py-3 transition-all
        ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <Icon size={20} />

      <span>{text}</span>
    </NavLink>
  );
}
```


---
### src/components/layout/TopBar.jsx
```javascript
import {
  Bell,
  Search,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { perfil, cerrarSesion } = useAuth();

  return (
    <header className="bg-white shadow px-8 h-16 flex items-center justify-between">

      <div className="flex items-center gap-3 border rounded-lg px-4 py-2 w-96">

        <Search size={18} className="text-gray-400" />

        <input
          placeholder="Buscar..."
          className="outline-none w-full"
        />

      </div>

      <div className="flex items-center gap-6">

        <Bell className="text-gray-500 cursor-pointer" />

        <div className="flex items-center gap-2">

          <UserCircle size={35} />

          <div>

            <p className="font-semibold">
              {perfil?.nombre || "Usuario"}
            </p>

            <p className="text-sm text-gray-500 capitalize">
              {perfil?.rol || "..."}
            </p>

          </div>

        </div>

        <button
          onClick={cerrarSesion}
          className="text-gray-500 hover:text-red-600 flex items-center gap-1"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>

      </div>

    </header>
  );
}
```


---
### src/components/layout/index.js
```javascript
export { default as Logo } from "./Logo";
export { default as Sidebar } from "./Sidebar";
export { default as SidebarItem } from "./SidebarItem";
export { default as Topbar } from "./TopBar";
```


---
### src/context/AuthContext.jsx
```javascript
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      if (session) {
        cargarPerfil(session.user.id);
      } else {
        setCargando(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSesion(session);
        if (session) {
          cargarPerfil(session.user.id);
        } else {
          setPerfil(null);
          setCargando(false);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function cargarPerfil(userId) {
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error) {
      setPerfil(data);
    }

    setCargando(false);
  }

  async function iniciarSesion(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{ sesion, perfil, cargando, iniciarSesion, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```


---
### src/hooks/UseClientes.js
```javascript

```


---
### src/layouts/MainLayout.jsx
```javascript
import { Sidebar, Topbar } from "../components/layout";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Contenido */}
      <div className="flex-1 flex flex-col">

        {/* Barra superior */}
        <Topbar />

        {/* Contenido de las páginas */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
```


---
### src/lib/supabase.js
```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://udxybphezzpptgconhma.supabase.co";

const supabaseKey = "sb_publishable_WgIGQ5MQsVvh6X0R4S7XsA_5Z7V8A6Z";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
```


---
### src/main.jsx
```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```


---
### src/pages/CRMComercial.jsx
```javascript
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import ProspectoForm from "../components/CRM/ProspectoForm";
import ProspectoTable from "../components/CRM/ProspectoTable";
import KanbanBoard from "../components/CRM/KanbanBoard";
import DashboardComercial from "../components/CRM/DashboardComercial";
import AlertasSeguimiento from "../components/CRM/AlertasSeguimiento";

import {
  obtenerProspectos,
  crearProspecto,
  actualizarProspecto,
  eliminarProspecto,
  cambiarEstadoProspecto,
  obtenerHistorial,
  convertirProspectoACliente,
} from "../services/ProspectoService";

export default function CRMComercial() {
  const [prospectos, setProspectos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [prospectoEditar, setProspectoEditar] = useState(null);
  const [vista, setVista] = useState("kanban");

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const [dataProspectos, dataHistorial] = await Promise.all([
      obtenerProspectos(),
      obtenerHistorial(),
    ]);
    setProspectos(dataProspectos);
    setHistorial(dataHistorial);
  }

  async function guardar(datos) {
    try {
      if (prospectoEditar) {
        await actualizarProspecto(prospectoEditar.id, datos);

        // Si al editar se marcó como "Cliente" y aún no tiene cliente vinculado, lo creamos
        if (datos.estado === "Cliente" && !prospectoEditar.clienteId) {
          await convertirProspectoACliente({ ...datos, id: prospectoEditar.id });
        }
      } else {
        await crearProspecto(datos);
      }

      setProspectoEditar(null);
      await cargar();

      Swal.fire({
        icon: "success",
        title: prospectoEditar ? "Prospecto actualizado" : "Prospecto creado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error al guardar", text: error.message });
    }
  }

  function eliminar(id) {
    Swal.fire({
      title: "¿Eliminar prospecto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await eliminarProspecto(id);
          await cargar();
        } catch (error) {
          Swal.fire({ icon: "error", title: "Error al eliminar", text: error.message });
        }
      }
    });
  }

  function editarDesdeKanban(prospecto) {
    setProspectoEditar(prospecto);
    setVista("lista");
  }

  async function moverEnKanban(id, estadoAnterior, estadoNuevo) {
    const prospecto = prospectos.find((p) => p.id === id);

    setProspectos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: estadoNuevo } : p))
    );

    try {
      if (estadoNuevo === "Cliente" && prospecto && !prospecto.clienteId) {
        await convertirProspectoACliente(prospecto);
      }

      await cambiarEstadoProspecto(id, estadoAnterior, estadoNuevo);
      await cargar();

      if (estadoNuevo === "Cliente") {
        Swal.fire({
          icon: "success",
          title: "¡Nuevo cliente! 🎉",
          text: `${prospecto?.empresa} fue agregado automáticamente a tu cartera de Clientes.`,
          timer: 2500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo mover el prospecto", text: error.message });
      await cargar();
    }
  }

  const tabs = [
    { id: "kanban", label: "Kanban" },
    { id: "lista", label: "Lista" },
    { id: "dashboard", label: "Dashboard" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">CRM Comercial</h1>
          <p className="text-slate-500 mt-1">Prospección y seguimiento comercial de nuevos clientes.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-1 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setVista(t.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                vista === t.id ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AlertasSeguimiento prospectos={prospectos} onEditar={editarDesdeKanban} />

      {vista === "kanban" && (
        <KanbanBoard
          prospectos={prospectos}
          onCambiarEstado={moverEnKanban}
          onEditar={editarDesdeKanban}
        />
      )}

      {vista === "lista" && (
        <>
          <ProspectoForm
            onGuardar={guardar}
            prospectoEditar={prospectoEditar}
            onCancelar={() => setProspectoEditar(null)}
          />
          <ProspectoTable
            prospectos={prospectos}
            onEditar={setProspectoEditar}
            onEliminar={eliminar}
          />
        </>
      )}

      {vista === "dashboard" && (
        <DashboardComercial prospectos={prospectos} historial={historial} />
      )}
    </div>
  );
}
```


---
### src/pages/Clientes.jsx
```javascript
import { useState, useEffect } from "react";
import ClienteForm from "../components/Clientes/ClienteForm";
import {
  obtenerClientes,
  guardarCliente,
  actualizarCliente,
  eliminarCliente,
} from "../services/ClienteService";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [clienteEditar, setClienteEditar] = useState(null);

  const cargarClientes = async () => {
    setCargando(true);
    try {
      const data = await obtenerClientes();
      setClientes(data);
    } catch (error) {
      alert("Error al cargar clientes: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const guardarClienteForm = async (cliente) => {
    try {
      if (cliente.id) {
        await actualizarCliente(cliente.id, cliente);
      } else {
        await guardarCliente(cliente);
      }
      setClienteEditar(null);
      await cargarClientes();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    try {
      await eliminarCliente(id);
      await cargarClientes();
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Clientes</h1>

      <ClienteForm onGuardar={guardarClienteForm} clienteEditar={clienteEditar} />

      {cargando ? (
        <p>Cargando clientes...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">Empresa</th>
                <th className="p-3">RUT</th>
                <th className="p-3">Giro</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3">{c.nombre}</td>
                  <td className="p-3">{c.rut}</td>
                  <td className="p-3">{c.giro}</td>
                  <td className="p-3">{c.contacto}</td>
                  <td className="p-3">{c.estado}</td>
                  <td className="p-3 space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setClienteEditar(c)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => eliminar(c.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```


---
### src/pages/Configuracion.jsx
```javascript
import React, { useState } from 'react';

export default function Configuracion() {
  const [nombreConsultora, setNombreConsultora] = useState('Táctika Consulting');
  const [rutConsultora, setRutConsultora] = useState('77.654.321-5');
  const [region, setRegion] = useState('Región Metropolitana');
  const [exito, setExito] = useState(false);

  const handleGuardarConfig = (e) => {
    e.preventDefault();
    setExito(true);
    setTimeout(() => setExito(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Configuración del Sistema</h2>
        <p className="text-sm text-slate-500 mt-1">
          Administra las variables globales de la suite, datos de tu firma de consultoría y parámetros técnicos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PERFIL DE LA CONSULTORA */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-base mb-4">Datos Corporativos de la Firma</h3>
          
          <form onSubmit={handleGuardarConfig} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre Comercial de la Suite</label>
                <input 
                  type="text" 
                  value={nombreConsultora} 
                  onChange={e => setNombreConsultora(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">RUT Empresa Emisora</label>
                <input 
                  type="text" 
                  value={rutConsultora} 
                  onChange={e => setRutConsultora(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ubicación Casa Matriz</label>
              <input 
                type="text" 
                value={region} 
                onChange={e => setRegion(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              {exito ? (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                  ✓ Cambios del sistema actualizados con éxito
                </span>
              ) : <div />}
              <button type="submit" className="bg-slate-800 hover:bg-slate-950 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors">
                Guardar Ajustes
              </button>
            </div>
          </form>
        </div>

        {/* VISTA PREVIA FUTUROS ASESORES */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-base">Control de Equipo</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Próximamente, cuando conectemos la base de datos en la nube, desde aquí podrás invitar a tus asesores adjuntando su correo electrónico y definiendo sus permisos de edición.
            </p>
            
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">Claudio (Tú)</p>
                  <p className="text-slate-400">Administrador Global</p>
                </div>
                <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-sm scale-90">Root</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
                <span>Espacio disponible para Asesor...</span>
                <span className="border border-dashed px-2 py-0.5 rounded-sm scale-90">Bloqueado</span>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-[11px] text-amber-800 leading-relaxed mt-4">
            <strong>Fase de Diseño Completa:</strong> Toda la interfaz interactiva de la Suite está lista para pasar a la integración con servidores.
          </div>
        </div>
      </div>
    </div>
  );
}
```


---
### src/pages/Dashboard.jsx
```javascript
import { useEffect, useState } from "react";

import {
  WelcomeBanner,
  DashboardCards,
  DashboardChart,
  QuickActions,
  RecentActivity,
  PendingPlans,
} from "../components/Dashboard";
import AlertasSeguimiento from "../components/CRM/AlertasSeguimiento";

import { obtenerClientes } from "../services/ClienteService";
import { obtenerDiagnosticos } from "../services/DiagnosticoService";
import { obtenerPlanes } from "../services/PlanAccionService";
import { obtenerSeguimientos } from "../services/SeguimientoService";
import { obtenerProspectos } from "../services/ProspectoService";

export default function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [prospectos, setProspectos] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const [dataClientes, dataDiagnosticos, dataPlanes, dataSeguimientos, dataProspectos] =
      await Promise.all([
        obtenerClientes(),
        obtenerDiagnosticos(),
        obtenerPlanes(),
        obtenerSeguimientos(),
        obtenerProspectos(),
      ]);

    setClientes(dataClientes);
    setDiagnosticos(dataDiagnosticos);
    setPlanes(dataPlanes);
    setSeguimientos(dataSeguimientos);
    setProspectos(dataProspectos);
  }

  const planesFinalizados = planes.filter(
    (plan) => plan.estado === "Finalizado"
  ).length;

  const cumplimiento =
    planes.length === 0
      ? 0
      : Math.round((planesFinalizados / planes.length) * 100);

  return (
    <div className="space-y-8">

      <WelcomeBanner />

      <AlertasSeguimiento prospectos={prospectos} onEditar={() => {}} />

      <DashboardCards
        clientes={clientes.length}
        diagnosticos={diagnosticos.length}
        planes={planes.length}
        seguimientos={seguimientos.length}
        cumplimiento={cumplimiento}
      />

      <DashboardChart
        clientes={clientes.length}
        diagnosticos={diagnosticos.length}
        planes={planes.length}
        seguimientos={seguimientos.length}
      />

      <QuickActions />

      <div className="grid xl:grid-cols-2 gap-6">
        <RecentActivity
          clientes={clientes}
          diagnosticos={diagnosticos}
          planes={planes}
          seguimientos={seguimientos}
        />
        <PendingPlans planes={planes} />
      </div>

    </div>
  );
}
```


---
### src/pages/Diagnostico.jsx
```javascript
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import DiagnosticoForm from "../components/Diagnostico/DiagnosticoForm";

import {
  obtenerDiagnosticos,
  guardarDiagnostico,
  eliminarDiagnostico,
  obtenerResultado,
} from "../services/DiagnosticoService";
import { obtenerClientes } from "../services/ClienteService";

export default function Diagnostico() {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    cargarDiagnosticos();
    cargarClientes();
  }, []);

  async function cargarDiagnosticos() {
    const data = await obtenerDiagnosticos();
    setDiagnosticos(data);
  }

  async function cargarClientes() {
    const data = await obtenerClientes();
    setClientes(data);
  }

  async function guardar(datos) {
    const resultado = obtenerResultado(datos.preguntas);

    try {
      await guardarDiagnostico({
        ...datos,
        resultado,
      });

      await cargarDiagnosticos();

      Swal.fire({
        icon: "success",
        title: "Diagnóstico guardado",
        text: "El diagnóstico fue registrado correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error.message,
      });
    }
  }

  function eliminar(id) {
    Swal.fire({
      title: "¿Eliminar diagnóstico?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarDiagnostico(id);
          await cargarDiagnosticos();

          Swal.fire({
            icon: "success",
            title: "Diagnóstico eliminado",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error al eliminar",
            text: error.message,
          });
        }
      }
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">
        Diagnóstico Empresarial
      </h1>

      <DiagnosticoForm onGuardar={guardar} clientes={clientes} />

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">Empresa</th>
              <th className="p-4 text-center">Resultado</th>
              <th className="p-4 text-center">Fecha</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {diagnosticos.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-8 text-gray-500">
                  No existen diagnósticos registrados.
                </td>
              </tr>
            ) : (
              diagnosticos.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{item.empresa}</td>

                  <td className="text-center p-4">
                    <span className="font-bold text-blue-600">
                      {item.resultado}%
                    </span>
                  </td>

                  <td className="text-center p-4">{item.fecha}</td>

                  <td className="text-center p-4">
                    <button
                      onClick={() => eliminar(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```


---
### src/pages/GestionPersonal.jsx
```javascript
import React, { useState, useEffect } from 'react';

export default function GestionPersonal() {
  const [personal, setPersonal] = useState([]);
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [contrato, setContrato] = useState('Escriturado y Vigente');
  const [epp, setEpp] = useState('Firmado por Trabajador');
  const [odi, setOdi] = useState('Acreditada en Carpeta');

  useEffect(() => {
    // Al cargar, solo buscamos lo que ya exista, SIN cargar ejemplos por defecto
    const guardados = localStorage.getItem('tactika_personal_captacion');
    if (guardados) {
      setPersonal(JSON.parse(guardados));
    }
  }, []);

  const handleAgregar = (e) => {
    e.preventDefault();
    if (!nombre || !cargo) return alert('Ingresa nombre y cargo.');

    let multa = 0;
    if (contrato !== 'Escriturado y Vigente') multa += 1400000;
    if (epp !== 'Firmado por Trabajador') multa += 1400000;
    if (odi !== 'Acreditada en Carpeta') multa += 1400000;

    const nuevoTrabajador = {
      id: crypto.randomUUID(),
      nombre,
      cargo,
      contrato,
      epp,
      odi,
      multaEstimada: multa,
      fechaRegistro: new Date().toLocaleDateString('es-CL')
    };

    const nuevos = [...personal, nuevoTrabajador];
    setPersonal(nuevos);
    localStorage.setItem('tactika_personal_captacion', JSON.stringify(nuevos));
    
    // Limpiar formulario
    setNombre('');
    setCargo('');
  };

  const totalRiesgo = personal.reduce((acc, cur) => acc + cur.multaEstimada, 0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-blue-400">Auditoría de Riesgo Laboral</h2>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Riesgo Económico Total</span>
          <span className="text-3xl font-black text-rose-400">${totalRiesgo.toLocaleString('es-CL')} CLP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleAgregar} className="space-y-4">
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Nombre" />
            <input type="text" value={cargo} onChange={e => setCargo(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Cargo" />
            <select value={contrato} onChange={e => setContrato(e.target.value)} className="w-full p-2 border rounded-lg">
              <option>Escriturado y Vigente</option>
              <option>Vencido</option>
              <option>Sin Contrato</option>
            </select>
            <select value={epp} onChange={e => setEpp(e.target.value)} className="w-full p-2 border rounded-lg">
              <option>Firmado por Trabajador</option>
              <option>Pendiente</option>
            </select>
            <select value={odi} onChange={e => setOdi(e.target.value)} className="w-full p-2 border rounded-lg">
              <option>Acreditada en Carpeta</option>
              <option>Pendiente</option>
            </select>
            <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg">Calcular</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-slate-400 text-xs uppercase">
                <th className="pb-3 text-left">Nombre</th>
                <th className="pb-3">Contrato</th>
                <th className="pb-3">EPP</th>
                <th className="pb-3">ODI</th>
                <th className="pb-3 text-right">Multa</th>
              </tr>
            </thead>
            <tbody>
              {personal.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="py-3 font-semibold">{p.nombre}</td>
                  <td className="text-center">{p.contrato === 'Escriturado y Vigente' ? '✅' : '❌'}</td>
                  <td className="text-center">{p.epp === 'Firmado por Trabajador' ? '✅' : '❌'}</td>
                  <td className="text-center">{p.odi === 'Acreditada en Carpeta' ? '✅' : '❌'}</td>
                  <td className="text-right font-bold text-rose-600">${p.multaEstimada.toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```


---
### src/pages/Login.jsx
```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await iniciarSesion(email, password);
      navigate("/");
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={enviar}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm space-y-4"
      >
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-slate-800">Táctika</h1>
          <p className="text-sm text-slate-500">Business Suite</p>
        </div>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded-lg p-3"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded-lg p-3"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          disabled={cargando}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
```


---
### src/pages/MatrizRiesgos.jsx
```javascript
import React, { useState, useEffect } from 'react';

export default function MatrizRiesgos() {
  const [riesgos, setRiesgos] = useState([]);
  const [area, setArea] = useState('Operaciones');
  const [peligro, setPeligro] = useState('');
  const [criticidad, setCriticidad] = useState('Media');

  useEffect(() => {
    const guardados = localStorage.getItem('tactika_matriz_riesgos');
    if (guardados) setRiesgos(JSON.parse(guardados));
  }, []);

  const handleAgregar = (e) => {
    e.preventDefault();
    if (!peligro) return alert('Describe el peligro.');

    const nuevoRiesgo = {
      id: crypto.randomUUID(),
      area,
      peligro,
      criticidad
    };

    const nuevos = [...riesgos, nuevoRiesgo];
    setRiesgos(nuevos);
    localStorage.setItem('tactika_matriz_riesgos', JSON.stringify(nuevos));
    setPeligro('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Matriz de Riesgos (PCC)</h2>
        <p className="text-sm text-slate-500">Identificación técnica de peligros operacionales y niveles críticos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Levantar Peligro</h3>
          <form onSubmit={handleAgregar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Área afectada</label>
              <select value={area} onChange={e => setArea(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white">
                <option value="Operaciones">Operaciones / Faena</option>
                <option value="Bodega">Bodega / Logística</option>
                <option value="Administración">Administración</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Descripción del Peligro</label>
              <textarea value={peligro} onChange={e => setPeligro(e.target.value)} rows="3" className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Ej: Falta de señalización en zona de tránsito de grúas..."></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Criticidad Evaluada</label>
              <select value={criticidad} onChange={e => setCriticidad(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white">
                <option value="Baja">🟢 Baja</option>
                <option value="Media">🟡 Media</option>
                <option value="Alta / Crítica">🔴 Alta / Crítica</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-slate-800 text-white text-sm font-medium py-2.5 rounded-lg">Registrar en Matriz</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Registro de Hallazgos Técnicos</h3>
          <div className="space-y-3">
            {riesgos.map(r => (
              <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded uppercase">{r.area}</span>
                  <p className="text-sm text-slate-700 mt-2 font-medium">{r.peligro}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-black shrink-0 ${
                  r.criticidad === 'Baja' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  r.criticidad === 'Media' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>{r.criticidad}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```


---
### src/pages/PlanAccion.jsx
```javascript
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { obtenerPlanes, guardarPlan, eliminarPlan, actualizarEstado } from "../services/PlanAccionService";
import { obtenerClientes } from "../services/ClienteService";

export default function PlanAccion() {
  const [planes, setPlanes] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [formulario, setFormulario] = useState({
    clienteId: "",
    area: "",
    accion: "",
    responsable: "",
    prioridad: "Media",
    fechaLimite: "",
  });

  useEffect(() => {
    cargarPlanes();
    cargarClientes();
  }, []);

  async function cargarPlanes() {
    const data = await obtenerPlanes();
    setPlanes(data);
  }

  async function cargarClientes() {
    const data = await obtenerClientes();
    setClientes(data);
  }

  function cambiar(e) {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  }

  async function guardar(e) {
    e.preventDefault();

    const cliente = clientes.find((c) => c.id === formulario.clienteId);

    try {
      await guardarPlan({
        ...formulario,
        empresa: cliente ? cliente.nombre : "",
      });

      await cargarPlanes();

      setFormulario({
        clienteId: "",
        area: "",
        accion: "",
        responsable: "",
        prioridad: "Media",
        fechaLimite: "",
      });

      Swal.fire({
        icon: "success",
        title: "Plan guardado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error.message,
      });
    }
  }

  function borrar(id) {
    Swal.fire({
      title: "¿Eliminar plan?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await eliminarPlan(id);
          await cargarPlanes();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error al eliminar",
            text: error.message,
          });
        }
      }
    });
  }

  async function cambiarEstado(id, estado) {
    try {
      await actualizarEstado(id, estado);
      await cargarPlanes();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar estado",
        text: error.message,
      });
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Plan de Acción</h1>

      <form
        onSubmit={guardar}
        className="bg-white rounded-xl shadow p-6 grid grid-cols-2 gap-4"
      >
        <select
          name="clienteId"
          value={formulario.clienteId}
          onChange={cambiar}
          className="border rounded-lg p-3"
          required
        >
          <option value="">-- Seleccionar Empresa --</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </option>
          ))}
        </select>

        <input
          name="area"
          placeholder="Área"
          value={formulario.area}
          onChange={cambiar}
          className="border rounded-lg p-3"
          required
        />

        <input
          name="accion"
          placeholder="Acción"
          value={formulario.accion}
          onChange={cambiar}
          className="border rounded-lg p-3"
          required
        />

        <input
          name="responsable"
          placeholder="Responsable"
          value={formulario.responsable}
          onChange={cambiar}
          className="border rounded-lg p-3"
          required
        />

        <select
          name="prioridad"
          value={formulario.prioridad}
          onChange={cambiar}
          className="border rounded-lg p-3"
        >
          <option>Alta</option>
          <option>Media</option>
          <option>Baja</option>
        </select>

        <div>
          <label className="block text-sm text-slate-500 mb-1">
            Fecha límite
          </label>
          <input
            type="date"
            name="fechaLimite"
            value={formulario.fechaLimite}
            onChange={cambiar}
            className="border rounded-lg p-3 w-full"
          />
        </div>

        <button className="bg-blue-600 text-white rounded-lg col-span-2">
          Guardar Plan
        </button>
      </form>

      {clientes.length === 0 && (
        <p className="text-sm text-red-500">
          No hay clientes registrados todavía. Ve a "Clientes" y registra al menos una empresa antes de crear un plan de acción.
        </p>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-3">Empresa</th>
              <th>Área</th>
              <th>Acción</th>
              <th>Responsable</th>
              <th>Prioridad</th>
              <th>Fecha límite</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {planes.map((plan) => (
              <tr key={plan.id} className="border-b">
                <td className="p-3">{plan.empresa}</td>
                <td>{plan.area}</td>
                <td>{plan.accion}</td>
                <td>{plan.responsable}</td>
                <td>{plan.prioridad}</td>
                <td>{plan.fechaLimite || "—"}</td>

                <td>
                  <select
                    value={plan.estado}
                    onChange={(e) => cambiarEstado(plan.id, e.target.value)}
                    className="border rounded"
                  >
                    <option>Pendiente</option>
                    <option>En Proceso</option>
                    <option>Finalizado</option>
                  </select>
                </td>

                <td>
                  <button
                    onClick={() => borrar(plan.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```


---
### src/pages/Reportes.jsx
```javascript
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { obtenerClientes } from "../services/ClienteService";
import { obtenerDiagnosticos } from "../services/DiagnosticoService";
import { obtenerPlanes } from "../services/PlanAccionService";

function coincidePorNombre(nombreCliente, textoEmpresa) {
  if (!nombreCliente || !textoEmpresa) return false;
  return nombreCliente.trim().toLowerCase() === textoEmpresa.trim().toLowerCase();
}

function perteneceACliente(registro, cliente) {
  if (registro.clienteId) return registro.clienteId === cliente.id;
  return coincidePorNombre(cliente.nombre, registro.empresa);
}

export default function Reportes() {
  const [clientes, setClientes] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const [dataClientes, dataDiagnosticos, dataPlanes] = await Promise.all([
      obtenerClientes(),
      obtenerDiagnosticos(),
      obtenerPlanes(),
    ]);

    setClientes(dataClientes);
    setDiagnosticos(dataDiagnosticos);
    setPlanes(dataPlanes);
  }

  const cliente = clientes.find((c) => c.id === clienteSeleccionadoId) || null;

  const diagnosticosCliente = cliente
    ? diagnosticos.filter((d) => perteneceACliente(d, cliente))
    : [];

  const planesCliente = cliente
    ? planes.filter((p) => perteneceACliente(p, cliente))
    : [];

  const ultimoDiagnostico =
    diagnosticosCliente.length > 0
      ? diagnosticosCliente[diagnosticosCliente.length - 1]
      : null;

  const promedioResultado =
    diagnosticosCliente.length > 0
      ? Math.round(
          diagnosticosCliente.reduce((acc, d) => acc + Number(d.resultado || 0), 0) /
            diagnosticosCliente.length
        )
      : 0;

  const planesActivos = planesCliente.filter((p) => p.estado !== "Finalizado").length;

  const pilares = [];
  if (ultimoDiagnostico?.preguntas?.length) {
    const categorias = {};
    ultimoDiagnostico.preguntas.forEach((p) => {
      if (!categorias[p.categoria]) categorias[p.categoria] = [];
      categorias[p.categoria].push(Number(p.valor));
    });

    Object.entries(categorias).forEach(([nombre, valores]) => {
      const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
      pilares.push({ area: nombre, valor: promedio.toFixed(1) });
    });
  }

  function exportarExcel() {
    if (!cliente) return;

    const libro = XLSX.utils.book_new();

    const resumen = [
      ["Informe de Cliente", ""],
      ["Empresa", cliente.nombre],
      ["RUT", cliente.rut || "—"],
      ["Giro", cliente.giro || "—"],
      ["Contacto", cliente.contacto || "—"],
      ["Estado", cliente.estado || "—"],
      ["", ""],
      ["Diagnósticos realizados", diagnosticosCliente.length],
      ["Resultado promedio", diagnosticosCliente.length > 0 ? `${promedioResultado}%` : "Sin mediciones"],
      ["Planes activos", planesActivos],
    ];
    const hojaResumen = XLSX.utils.aoa_to_sheet(resumen);
    XLSX.utils.book_append_sheet(libro, hojaResumen, "Resumen");

    if (pilares.length > 0) {
      const filasPilares = [["Área", "Promedio (1-5)"], ...pilares.map((p) => [p.area, p.valor])];
      const hojaPilares = XLSX.utils.aoa_to_sheet(filasPilares);
      XLSX.utils.book_append_sheet(libro, hojaPilares, "Análisis por Pilar");
    }

    if (planesCliente.length > 0) {
      const filasPlanes = [
        ["Área", "Acción", "Responsable", "Prioridad", "Fecha límite", "Estado"],
        ...planesCliente.map((p) => [
          p.area,
          p.accion,
          p.responsable,
          p.prioridad,
          p.fechaLimite || "—",
          p.estado,
        ]),
      ];
      const hojaPlanes = XLSX.utils.aoa_to_sheet(filasPlanes);
      XLSX.utils.book_append_sheet(libro, hojaPlanes, "Planes de Acción");
    }

    XLSX.writeFile(libro, `Informe_${cliente.nombre.replace(/\s+/g, "_")}.xlsx`);
  }

  function exportarPDF() {
    if (!cliente) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Informe de Cliente — Táctika Consulting", 14, 18);

    doc.setFontSize(11);
    doc.text(`Empresa: ${cliente.nombre}`, 14, 30);
    doc.text(`RUT: ${cliente.rut || "—"}`, 14, 37);
    doc.text(`Giro: ${cliente.giro || "—"}`, 14, 44);
    doc.text(`Contacto: ${cliente.contacto || "—"}`, 14, 51);
    doc.text(`Estado: ${cliente.estado || "—"}`, 14, 58);
    doc.text(
      `Resultado promedio de diagnósticos: ${diagnosticosCliente.length > 0 ? promedioResultado + "%" : "Sin mediciones"}`,
      14,
      65
    );

    let y = 75;

    if (pilares.length > 0) {
      doc.setFontSize(13);
      doc.text("Análisis por Pilar de Negocio", 14, y);
      autoTable(doc, {
        startY: y + 4,
        head: [["Área", "Promedio (1-5)"]],
        body: pilares.map((p) => [p.area, p.valor]),
        theme: "grid",
        headStyles: { fillColor: [30, 41, 59] },
      });
      y = doc.lastAutoTable.finalY + 12;
    }

    if (planesCliente.length > 0) {
      doc.setFontSize(13);
      doc.text("Planes de Acción", 14, y);
      autoTable(doc, {
        startY: y + 4,
        head: [["Área", "Acción", "Responsable", "Prioridad", "Fecha límite", "Estado"]],
        body: planesCliente.map((p) => [
          p.area,
          p.accion,
          p.responsable,
          p.prioridad,
          p.fechaLimite || "—",
          p.estado,
        ]),
        theme: "grid",
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 8 },
      });
    }

    doc.save(`Informe_${cliente.nombre.replace(/\s+/g, "_")}.pdf`);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Informes y Reportes</h2>
          <p className="text-sm text-slate-500 mt-1">
            Visualización de resultados de diagnósticos y estatus de planes de acción por cliente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {cliente && (
            <>
              <button
                onClick={exportarExcel}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
              >
                Descargar Excel
              </button>
              <button
                onClick={exportarPDF}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition"
              >
                Descargar PDF
              </button>
            </>
          )}

          <div className="w-64">
            <select
              value={clienteSeleccionadoId}
              onChange={(e) => setClienteSeleccionadoId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-700 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Seleccionar Cliente --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!cliente ? (
        <div className="p-16 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl bg-white">
          Por favor, selecciona una empresa cliente en el menú superior derecho para desplegar su reporte.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
              <div className="border-b pb-3 border-slate-50">
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded uppercase">
                  Ficha de Cliente
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{cliente.nombre}</h3>
                <p className="text-xs text-slate-400 mt-0.5">RUT: {cliente.rut || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Giro</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{cliente.giro || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Contacto</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{cliente.contacto || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Diagnósticos</p>
                  <p className="text-slate-700 font-semibold mt-0.5">
                    {diagnosticosCliente.length} realizados
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Planes Activos</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{planesActivos} activos</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50">
                <p className="text-xs text-slate-400 font-medium mb-1">Estado del Cliente:</p>
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100 inline-block">
                  {cliente.estado}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-xl shadow-md text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resultado Promedio de Diagnósticos
              </p>
              <p className="text-5xl font-black text-white mt-4 mb-2">
                {diagnosticosCliente.length > 0 ? `${promedioResultado}%` : "—"}
              </p>
              <p className="text-xs text-slate-400">
                {diagnosticosCliente.length > 0
                  ? `Basado en ${diagnosticosCliente.length} diagnóstico(s)`
                  : "Aún no hay diagnósticos registrados"}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-300">
                {promedioResultado >= 80
                  ? "Nivel Avanzado / Optimizado"
                  : promedioResultado >= 60
                  ? "Nivel Intermedio / En Desarrollo"
                  : diagnosticosCliente.length > 0
                  ? "Nivel Crítico / Requiere Intervención"
                  : "Sin mediciones registradas"}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 text-base mb-4">
                Análisis por Pilar de Negocio
              </h4>

              {pilares.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No hay diagnósticos registrados para calcular este análisis.
                </p>
              ) : (
                <div className="space-y-4">
                  {pilares.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>{item.area}</span>
                        <span className="text-slate-800">{item.valor} / 5.0</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${(parseFloat(item.valor) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 text-base mb-4">
                Planes de Acción del Cliente
              </h4>

              {planesCliente.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No hay planes de acción registrados para este cliente.
                </p>
              ) : (
                <ul className="space-y-3">
                  {planesCliente.map((plan) => (
                    <li
                      key={plan.id}
                      className="flex justify-between items-center border-b pb-2 text-sm"
                    >
                      <div>
                        <p className="text-slate-700 font-medium">{plan.accion}</p>
                        <p className="text-slate-400 text-xs">
                          {plan.area} · {plan.responsable}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          plan.estado === "Finalizado"
                            ? "bg-green-100 text-green-700"
                            : plan.estado === "En Proceso"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {plan.estado}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```


---
### src/pages/Seguimientos.jsx
```javascript
import { useEffect, useState } from "react";

import {
  SeguimientoForm,
  SeguimientoStats,
  SeguimientoTable,
} from "../components/Seguimiento";

import {
  obtenerSeguimientos,
  guardarSeguimiento,
  eliminarSeguimiento,
  obtenerEstadisticasSeguimiento,
} from "../services/SeguimientoService";


export default function Seguimientos() {

  const [seguimientos, setSeguimientos] = useState([]);

  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    proceso: 0,
    completados: 0,
  });


  const [seguimientoSeleccionado, setSeguimientoSeleccionado] =
    useState(null);


  const cargarDatos = async () => {
    const dataSeguimientos = await obtenerSeguimientos();
    const dataEstadisticas = await obtenerEstadisticasSeguimiento();

    setSeguimientos(dataSeguimientos);
    setEstadisticas(dataEstadisticas);
  };


  useEffect(() => {
    cargarDatos();
  }, []);


  const guardar = async (seguimiento) => {
    try {
      await guardarSeguimiento(seguimiento);
      await cargarDatos();
      setSeguimientoSeleccionado(null);
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };


  const editar = (seguimiento) => {
    setSeguimientoSeleccionado(seguimiento);
  };


  const eliminar = async (id) => {
    try {
      await eliminarSeguimiento(id);
      await cargarDatos();
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };


  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Seguimiento
        </h1>

        <p className="text-slate-500 mt-2">
          Control y seguimiento de tareas de los planes de acción.
        </p>
      </div>


      <SeguimientoStats 
        estadisticas={estadisticas} 
      />


      <SeguimientoForm
        onGuardar={guardar}
        seguimientoSeleccionado={seguimientoSeleccionado}
      />


      <SeguimientoTable
        seguimientos={seguimientos}
        onEditar={editar}
        onEliminar={eliminar}
      />


    </div>
  );
}
```


---
### src/router/AppRouter.jsx
```javascript
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import RutaProtegida from "../components/RutaProtegida";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Clientes from "../pages/Clientes";
import Diagnostico from "../pages/Diagnostico";
import PlanAccion from "../pages/PlanAccion";
import Seguimientos from "../pages/Seguimientos";
import Reportes from "../pages/Reportes";
import Configuracion from "../pages/Configuracion";

import GestionPersonal from "../pages/GestionPersonal";
import MatrizRiesgos from "../pages/MatrizRiesgos";
import CRMComercial from "../pages/CRMComercial"; // ⬅ NUEVO

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<RutaProtegida />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/diagnosticos" element={<Diagnostico />} />
            <Route path="/planes" element={<PlanAccion />} />
            <Route path="/seguimiento" element={<Seguimientos />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/personal" element={<GestionPersonal />} />
            <Route path="/riesgos" element={<MatrizRiesgos />} />
            <Route path="/crm" element={<CRMComercial />} /> {/* ⬅ NUEVO */}
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```


---
### src/services/ClienteService.js
```javascript
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
```


---
### src/services/DashboardService.js
```javascript
import { obtenerClientes } from "./ClienteService";
import { obtenerDiagnosticos } from "./DiagnosticoService";
import { obtenerPlanes } from "./PlanService";
import {
  obtenerSeguimientos,
  calcularAvance,
} from "./seguimientoService";

export function obtenerDashboard() {
  const clientes = obtenerClientes();
  const diagnosticos = obtenerDiagnosticos();
  const planes = obtenerPlanes();
  const seguimientos = obtenerSeguimientos();

  return {
    totalClientes: clientes.length,

    totalDiagnosticos: diagnosticos.length,

    totalPlanes: planes.length,

    totalSeguimientos: seguimientos.length,

    avance: calcularAvance(),

    pendientes: seguimientos.filter(
      (s) => s.estado === "Pendiente"
    ).length,

    proceso: seguimientos.filter(
      (s) => s.estado === "En proceso"
    ).length,

    completados: seguimientos.filter(
      (s) => s.estado === "Completado"
    ).length,
  };
}
```


---
### src/services/DiagnosticoService.js
```javascript
import { supabase } from "../lib/supabase";

export async function obtenerDiagnosticos() {
  const { data, error } = await supabase
    .from("diagnosticos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((d) => ({
    id: d.id,
    clienteId: d.cliente_id,
    empresa: d.empresa,
    preguntas: d.preguntas,
    resultado: d.resultado,
    fecha: d.fecha,
    createdAt: d.created_at,
  }));
}

export async function guardarDiagnostico(diagnostico) {
  const { error } = await supabase
    .from("diagnosticos")
    .insert([
      {
        cliente_id: diagnostico.clienteId,
        empresa: diagnostico.empresa,
        preguntas: diagnostico.preguntas,
        resultado: diagnostico.resultado,
        fecha: new Date().toLocaleDateString("es-CL"),
      },
    ]);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function eliminarDiagnostico(id) {
  const { error } = await supabase
    .from("diagnosticos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export function obtenerResultado(preguntas) {
  const total = preguntas.reduce(
    (acumulado, pregunta) => acumulado + Number(pregunta.valor),
    0
  );

  const promedio = total / preguntas.length;

  return Math.round(promedio * 20);
}
```


---
### src/services/IAService.js
```javascript
import { supabase } from "../lib/supabase";

/**
 * ARQUITECTURA PREPARADA PARA IA — NO IMPLEMENTADA TODAVÍA.
 *
 * Esta función define el CONTRATO que va a usar la futura IA de
 * recomendación: qué datos recibe y qué formato de respuesta entrega.
 * Por ahora no llama a ningún modelo — solo deja la estructura lista
 * para conectarla más adelante (ej. vía una Edge Function de Supabase
 * que llame a un modelo de lenguaje).
 *
 * Cuando se implemente, esta función debería:
 * 1. Tomar los datos del prospecto (incluyendo su historial de estados)
 * 2. Enviarlos a un servicio de IA (ej. Edge Function + modelo)
 * 3. Guardar la respuesta en la columna `recomendacion_ia` (jsonb)
 * 4. Retornar la recomendación al componente que la llamó
 */
export async function obtenerRecomendacionIA(prospecto) {
  console.warn("IAService.obtenerRecomendacionIA: aún no implementado. Retornando estructura vacía.");

  return {
    disponible: false,
    moduloRecomendado: null,      // ej. "Diagnóstico + Plan de Acción"
    tipoAsesoria: null,           // ej. "Ordenamiento de procesos"
    accionesSugeridas: [],        // ej. ["Agendar diagnóstico", "Enviar propuesta"]
    probabilidadCierreIA: null,   // ej. 0-100, estimado por el modelo
    razonamiento: null,           // explicación en texto de por qué
  };
}

/**
 * Guarda una recomendación de IA ya generada en el prospecto.
 * Lista para usarse cuando obtenerRecomendacionIA() esté implementada de verdad.
 */
export async function guardarRecomendacionIA(prospectoId, recomendacion) {
  const { error } = await supabase
    .from("prospectos")
    .update({ recomendacion_ia: recomendacion })
    .eq("id", prospectoId);

  if (error) {
    console.error(error);
    throw error;
  }
}
```


---
### src/services/IndiceTactika.js
```javascript
/**
 * Calcula el Índice Táctika de un prospecto (0-100).
 * Recibe el objeto del formulario/prospecto y retorna el puntaje.
 */
export function calcularIndiceTactika(prospecto) {
  let puntaje = 0;

  if (!prospecto.usaSoftware) puntaje += 20;
  if (prospecto.softwareActual?.toLowerCase().includes("excel")) puntaje += 15;
  if (Number(prospecto.numTrabajadores) > 10) puntaje += 10;
  if (!prospecto.sitioWeb) puntaje += 10;
  if (prospecto.muchoTrabajoAdministrativo) puntaje += 15;
  if (prospecto.problemaDetectado?.trim()) puntaje += 15;
  if (prospecto.interesAlto) puntaje += 15;
  if (prospecto.necesidadUrgente) puntaje += 10;

  return Math.min(puntaje, 100);
}

/**
 * Traduce el puntaje a una categoría con color, para mostrar en badges.
 */
export function categoriaIndiceTactika(puntaje) {
  if (puntaje >= 81) return { label: "Prioridad Máxima", color: "red" };
  if (puntaje >= 61) return { label: "Alto", color: "amber" };
  if (puntaje >= 31) return { label: "Medio", color: "blue" };
  return { label: "Bajo", color: "gray" };
}
```


---
### src/services/MetricasComerciales.js
```javascript
export function calcularMetricasComerciales(prospectos, historial) {
  const cantidadProspectos = prospectos.length;

  const pasoPor = (estado) =>
    new Set(historial.filter((h) => h.estadoNuevo === estado).map((h) => h.prospectoId)).size;

  const diagnosticosAgendados = pasoPor("Diagnóstico Agendado");
  const diagnosticosRealizados = pasoPor("Diagnóstico Realizado");
  const propuestasEnviadas = pasoPor("Propuesta Enviada");

  const clientesGanados = prospectos.filter((p) => p.estado === "Cliente").length;
  const clientesPerdidos = prospectos.filter((p) => p.estado === "Perdido").length;

  const activos = prospectos.filter((p) => p.estado !== "Cliente" && p.estado !== "Perdido");

  const montoPotencial = activos.reduce((acc, p) => acc + (Number(p.valorEstimado) || 0), 0);
  const montoVendido = prospectos
    .filter((p) => p.estado === "Cliente")
    .reduce((acc, p) => acc + (Number(p.valorEstimado) || 0), 0);

  const conversion = cantidadProspectos === 0 ? 0 : Math.round((clientesGanados / cantidadProspectos) * 100);

  // Tiempo promedio de cierre: días entre creación y el momento en que llegó a "Cliente"
  const tiempos = prospectos
    .filter((p) => p.estado === "Cliente")
    .map((p) => {
      const cierre = historial.find((h) => h.prospectoId === p.id && h.estadoNuevo === "Cliente");
      if (!cierre || !p.createdAt) return null;
      const dias = (new Date(cierre.fecha) - new Date(p.createdAt)) / (1000 * 60 * 60 * 24);
      return dias >= 0 ? dias : null;
    })
    .filter((d) => d !== null);

  const tiempoPromedioCierre =
    tiempos.length === 0 ? null : Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);

  // Agrupaciones
  const agrupar = (campo) => {
    const mapa = {};
    prospectos.forEach((p) => {
      const clave = p[campo]?.trim() || "Sin especificar";
      mapa[clave] = (mapa[clave] || 0) + 1;
    });
    return Object.entries(mapa)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  };

  const porComuna = agrupar("comuna").slice(0, 6);
  const porRubro = agrupar("giro").slice(0, 6);

  // Ranking de oportunidades: valor estimado x probabilidad, solo pipeline activo
  const ranking = activos
    .map((p) => ({
      ...p,
      puntajeOportunidad: (Number(p.valorEstimado) || 0) * ((Number(p.probabilidadCierre) || 0) / 100),
    }))
    .sort((a, b) => b.puntajeOportunidad - a.puntajeOportunidad)
    .slice(0, 5);

  return {
    cantidadProspectos,
    diagnosticosAgendados,
    diagnosticosRealizados,
    propuestasEnviadas,
    clientesGanados,
    clientesPerdidos,
    montoPotencial,
    montoVendido,
    conversion,
    tiempoPromedioCierre,
    porComuna,
    porRubro,
    ranking,
  };
}
```


---
### src/services/PlanAccionService.js
```javascript
import { supabase } from "../lib/supabase";

export async function obtenerPlanes() {
  const { data, error } = await supabase
    .from("planes_accion")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((p) => ({
    id: p.id,
    clienteId: p.cliente_id,
    empresa: p.empresa,
    area: p.area,
    accion: p.accion,
    responsable: p.responsable,
    prioridad: p.prioridad,
    estado: p.estado,
    fecha: p.fecha,
    fechaLimite: p.fecha_limite,
    createdAt: p.created_at,
  }));
}

export async function guardarPlan(plan) {
  const { error } = await supabase
    .from("planes_accion")
    .insert([
      {
        cliente_id: plan.clienteId,
        empresa: plan.empresa,
        area: plan.area,
        accion: plan.accion,
        responsable: plan.responsable,
        prioridad: plan.prioridad,
        estado: "Pendiente",
        fecha: new Date().toLocaleDateString("es-CL"),
        fecha_limite: plan.fechaLimite || null,
      },
    ]);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function eliminarPlan(id) {
  const { error } = await supabase
    .from("planes_accion")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function actualizarEstado(id, estado) {
  const { error } = await supabase
    .from("planes_accion")
    .update({ estado })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}
```


---
### src/services/ProspectoService.js
```javascript
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
    recomendacionIA: fila.recomendacion_ia,
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
}
```


---
### src/services/SeguimientoService.js
```javascript
import { supabase } from "../lib/supabase";

function aSeguimiento(fila) {
  return {
    id: fila.id,
    tarea: fila.tarea,
    responsable: fila.responsable,
    fecha: fila.fecha,
    estado: fila.estado,
    fechaCreacion: fila.fecha_creacion,
    createdAt: fila.created_at,
  };
}

export async function obtenerSeguimientos() {
  const { data, error } = await supabase
    .from("seguimientos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(aSeguimiento);
}

export async function guardarSeguimiento(seguimiento) {
  if (seguimiento.id) {
    const { error } = await supabase
      .from("seguimientos")
      .update({
        tarea: seguimiento.tarea,
        responsable: seguimiento.responsable,
        fecha: seguimiento.fecha,
        estado: seguimiento.estado,
      })
      .eq("id", seguimiento.id);

    if (error) {
      console.error(error);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from("seguimientos")
      .insert([
        {
          tarea: seguimiento.tarea,
          responsable: seguimiento.responsable,
          fecha: seguimiento.fecha,
          estado: seguimiento.estado,
          fecha_creacion: new Date().toLocaleDateString("es-CL"),
        },
      ]);

    if (error) {
      console.error(error);
      throw error;
    }
  }
}

export async function eliminarSeguimiento(id) {
  const { error } = await supabase
    .from("seguimientos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function obtenerEstadisticasSeguimiento() {
  const seguimientos = await obtenerSeguimientos();

  return {
    total: seguimientos.length,
    pendientes: seguimientos.filter((s) => s.estado === "Pendiente").length,
    proceso: seguimientos.filter((s) => s.estado === "En proceso").length,
    completados: seguimientos.filter((s) => s.estado === "Completado").length,
  };
}

export async function calcularAvance() {
  const seguimientos = await obtenerSeguimientos();

  if (seguimientos.length === 0) return 0;

  const completados = seguimientos.filter(
    (s) => s.estado === "Completado"
  ).length;

  return Math.round((completados / seguimientos.length) * 100);
}
```


---
### supabase/functions/agente-venta/index.ts
```javascript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres el asistente comercial de Táctika Consulting, una consultora chilena que ayuda a pequeñas y medianas empresas (pymes) a ordenar su gestión mediante asesoría profesional y una plataforma propia (Táctika Business Suite).

Tu tarea:
- Responder preguntas del visitante sobre el servicio de forma breve, cercana y en español chileno, sin sonar robótico.
- El servicio incluye: diagnóstico de la empresa, plan de acción con responsables y plazos, y seguimiento a través de la plataforma.
- Atienden principalmente pymes de Buin y la Región Metropolitana.
- De forma natural durante la conversación, intenta obtener: nombre de la empresa, nombre de la persona de contacto, comuna, número aproximado de trabajadores, y un correo o teléfono de contacto, y qué problema tiene la empresa.
- No preguntes todo de golpe como un formulario — ve conversando naturalmente.
- Mientras conversas, evalúa (sin preguntarlo directamente como encuesta) estas señales, según lo que el visitante cuente:
  - ¿La empresa usa algún software de gestión hoy? (sí/no, y cuál si menciona uno)
  - ¿Parece tener mucho trabajo administrativo o manual (planillas, papeles, todo a mano)?
  - ¿El visitante muestra interés alto en avanzar (pregunta por precios, quiere agendar, pide más info)?
  - ¿Menciona una necesidad urgente o un problema que quiere resolver pronto?

Cuando ya tengas al menos el nombre de la empresa Y un dato de contacto (correo o teléfono), agrega AL FINAL de tu respuesta (después de tu texto normal, en una línea nueva) este bloque exacto con los datos que tengas:
<<<LEAD>>>{"empresa":"...","contacto":"...","correo":"...","telefono":"...","comuna":"...","numTrabajadores":"...","problema":"...","usaSoftware":true_o_false,"softwareActual":"...","trabajoAdministrativo":true_o_false,"interesAlto":true_o_false,"necesidadUrgente":true_o_false}<<<END>>>

Reglas para ese bloque:
- Usa "" vacío para los campos de texto que no tengas.
- Usa false (no null, no "") para los campos true/false si no tienes evidencia clara — solo pon true cuando el visitante lo haya insinuado o dicho.
- Ese bloque no lo ve el visitante (se procesa aparte), así que no lo menciones ni lo expliques en tu respuesta visible.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await aiResponse.json();
    const texto = data?.content?.[0]?.text ?? "Lo siento, no pude procesar tu mensaje.";

    let respuestaVisible = texto;
    let lead: any = null;

    const match = texto.match(/<<<LEAD>>>([\s\S]*?)<<<END>>>/);
    if (match) {
      respuestaVisible = texto.replace(match[0], "").trim();
      try {
        lead = JSON.parse(match[1]);
      } catch (_e) {
        lead = null;
      }
    }

    if (lead && lead.empresa) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      let indice = 0;
      if (!lead.usaSoftware) indice += 20;
      if (String(lead.softwareActual || "").toLowerCase().includes("excel")) indice += 15;
      if (Number(lead.numTrabajadores) > 10) indice += 10;
      if (lead.trabajoAdministrativo) indice += 15;
      if (lead.problema && lead.problema.trim()) indice += 15;
      if (lead.interesAlto) indice += 15;
      if (lead.necesidadUrgente) indice += 10;
      indice = Math.min(indice, 100);

      await supabase.from("prospectos").insert([
        {
          empresa: lead.empresa,
          contacto_nombre: lead.contacto || null,
          correo: lead.correo || null,
          telefono: lead.telefono || null,
          comuna: lead.comuna || null,
          num_trabajadores: lead.numTrabajadores ? Number(lead.numTrabajadores) : null,
          problema_detectado: lead.problema || null,
          usa_software: !!lead.usaSoftware,
          software_actual: lead.softwareActual || null,
          trabajo_administrativo: !!lead.trabajoAdministrativo,
          interes_alto: !!lead.interesAlto,
          necesidad_urgente: !!lead.necesidadUrgente,
          indice_tactika: indice,
          origen: "Chat Landing (IA)",
          estado: "Prospecto",
        },
      ]);
    }

    return new Response(JSON.stringify({ respuesta: respuestaVisible }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
```
