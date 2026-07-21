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
        </div>
      )}
    </Draggable>
  );
}