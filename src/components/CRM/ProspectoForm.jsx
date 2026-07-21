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