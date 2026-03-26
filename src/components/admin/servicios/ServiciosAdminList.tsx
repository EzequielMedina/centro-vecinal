"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  arrayMove, useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDeleteDialog } from "@/components/admin/shared/ConfirmDeleteDialog"
import { toggleActivo, deleteServicio, updateOrden } from "@/lib/actions/servicios"
import { getDynamicIcon } from "@/lib/utils/icons"
import type { Servicio } from "@/lib/queries/servicios"

function ServicioRow({
  servicio,
  onToggle,
  onDeleted,
}: {
  servicio: Servicio
  onToggle: (id: string, activo: boolean) => void
  onDeleted: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: servicio.id,
  })
  const Icon = getDynamicIcon(servicio.icono)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDelete = async () => {
    const result = await deleteServicio(servicio.id)
    if ("error" in result) { toast.error(result.error); return }
    toast.success("Servicio eliminado")
    onDeleted(servicio.id)
  }

  const handleToggle = async (checked: boolean) => {
    onToggle(servicio.id, checked)
    const result = await toggleActivo(servicio.id, checked)
    if ("error" in result) {
      toast.error(result.error)
      onToggle(servicio.id, !checked) // revertir
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical size={16} />
      </button>

      {/* Ícono */}
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-primary" />
      </div>

      {/* Nombre + descripción */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{servicio.nombre}</p>
        <p className="text-xs text-muted-foreground truncate">{servicio.descripcion}</p>
      </div>

      {/* Toggle activo */}
      <button
        type="button"
        role="switch"
        aria-checked={servicio.activo}
        aria-label={servicio.activo ? "Desactivar" : "Activar"}
        onClick={() => handleToggle(!servicio.activo)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          servicio.activo ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          servicio.activo ? "translate-x-4" : "translate-x-0"
        }`} />
      </button>

      {/* Editar */}
      <Link
        href={`/admin/servicios/${servicio.id}/editar`}
        aria-label="Editar"
        className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <Pencil size={15} />
      </Link>

      {/* Eliminar */}
      <ConfirmDeleteDialog
        trigger={
          <button type="button" aria-label="Eliminar" className="inline-flex items-center justify-center p-2 rounded-md hover:bg-destructive/10 transition-colors text-destructive">
            <Trash2 size={15} />
          </button>
        }
        description={`¿Eliminar el servicio "${servicio.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}

type Props = { initialServicios: Servicio[] }

export function ServiciosAdminList({ initialServicios }: Props) {
  const [servicios, setServicios] = useState(initialServicios)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = servicios.findIndex((s) => s.id === active.id)
    const newIndex = servicios.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(servicios, oldIndex, newIndex)
    setServicios(reordered)

    const result = await updateOrden(reordered.map((s) => s.id))
    if ("error" in result) {
      toast.error(result.error)
      setServicios(servicios)
    } else {
      toast.success("Orden guardado")
    }
  }, [servicios])

  const handleToggle = useCallback((id: string, activo: boolean) => {
    setServicios((prev) => prev.map((s) => s.id === id ? { ...s, activo } : s))
  }, [])

  const handleDeleted = useCallback((id: string) => {
    setServicios((prev) => prev.filter((s) => s.id !== id))
  }, [])

  if (servicios.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No hay servicios. Creá el primero.</p>
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={servicios.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {servicios.map((servicio) => (
            <ServicioRow
              key={servicio.id}
              servicio={servicio}
              onToggle={handleToggle}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
