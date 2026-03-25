"use client"

import Image from "next/image"
import { Trash2, GripVertical } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ConfirmDeleteDialog } from "@/components/admin/shared/ConfirmDeleteDialog"
import { deleteImagen } from "@/lib/actions/galeria"
import { toast } from "sonner"
import type { ImagenGaleria } from "@/lib/queries/galeria"

type Props = {
  imagen: ImagenGaleria
  onDeleted: (id: string) => void
}

export function ImageCard({ imagen, onDeleted }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: imagen.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDelete = async () => {
    const result = await deleteImagen(imagen.id, imagen.url)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    toast.success("Imagen eliminada")
    onDeleted(imagen.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-lg overflow-hidden border bg-card aspect-square"
    >
      {/* Imagen */}
      <Image
        src={imagen.url}
        alt={imagen.titulo || "Imagen de galería"}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover"
        unoptimized={process.env.NODE_ENV === "development"}
      />

      {/* Overlay en hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

      {/* Handle de drag */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical size={16} />
      </button>

      {/* Botón eliminar */}
      <ConfirmDeleteDialog
        trigger={
          <button
            type="button"
            className="absolute top-2 right-2 p-1.5 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80"
            aria-label="Eliminar imagen"
          >
            <Trash2 size={14} />
          </button>
        }
        description="¿Eliminar esta imagen de la galería? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
      />

      {/* Título (si tiene) */}
      {imagen.titulo && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
          <p className="text-xs text-white truncate">{imagen.titulo}</p>
        </div>
      )}
    </div>
  )
}
