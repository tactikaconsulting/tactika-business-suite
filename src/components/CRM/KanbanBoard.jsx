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