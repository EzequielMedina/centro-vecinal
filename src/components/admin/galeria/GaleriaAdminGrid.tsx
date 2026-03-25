"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { toast } from "sonner"
import { ImageCard } from "./ImageCard"
import { updateOrden } from "@/lib/actions/galeria"
import type { ImagenGaleria } from "@/lib/queries/galeria"

type Props = {
  initialImagenes: ImagenGaleria[]
}

export function GaleriaAdminGrid({ initialImagenes }: Props) {
  const [imagenes, setImagenes] = useState(initialImagenes)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = imagenes.findIndex((img) => img.id === active.id)
      const newIndex = imagenes.findIndex((img) => img.id === over.id)
      const reordered = arrayMove(imagenes, oldIndex, newIndex)

      // Optimistic update
      setImagenes(reordered)

      const result = await updateOrden(reordered.map((img) => img.id))
      if ("error" in result) {
        toast.error(result.error)
        // Revertir
        setImagenes(imagenes)
      } else {
        toast.success("Orden actualizado")
      }
    },
    [imagenes]
  )

  const handleDeleted = useCallback((id: string) => {
    setImagenes((prev) => prev.filter((img) => img.id !== id))
  }, [])

  if (imagenes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No hay imágenes en la galería. Subí la primera usando el formulario de arriba.
      </p>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={imagenes.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {imagenes.map((imagen) => (
            <ImageCard key={imagen.id} imagen={imagen} onDeleted={handleDeleted} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
