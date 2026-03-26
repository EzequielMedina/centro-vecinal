"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  arrayMove, useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ConfirmDeleteDialog } from "@/components/admin/shared/ConfirmDeleteDialog"
import { toggleActivoMiembro, deleteMiembro, updateOrdenEquipo } from "@/lib/actions/institucional"
import { MiembroForm } from "./MiembroForm"
import type { MiembroEquipo } from "@/lib/queries/institucional"

function MiembroRow({
  miembro,
  onToggle,
  onDeleted,
  onEdit,
}: {
  miembro: MiembroEquipo
  onToggle: (id: string, activo: boolean) => void
  onDeleted: (id: string) => void
  onEdit: (miembro: MiembroEquipo) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: miembro.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDelete = async () => {
    const result = await deleteMiembro(miembro.id)
    if ("error" in result) { toast.error(result.error); return }
    toast.success("Miembro eliminado")
    onDeleted(miembro.id)
  }

  const handleToggle = async (checked: boolean) => {
    onToggle(miembro.id, checked)
    const result = await toggleActivoMiembro(miembro.id, checked)
    if ("error" in result) {
      toast.error(result.error)
      onToggle(miembro.id, !checked)
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical size={16} />
      </button>

      {/* Avatar */}
      {miembro.foto_url ? (
        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
          <Image src={miembro.foto_url} alt={miembro.nombre} fill sizes="32px" className="object-cover" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-primary">{miembro.nombre[0]?.toUpperCase()}</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{miembro.nombre}</p>
        <p className="text-xs text-muted-foreground truncate">{miembro.cargo}</p>
      </div>

      {/* Toggle activo */}
      <button
        type="button"
        role="switch"
        aria-checked={miembro.activo}
        aria-label={miembro.activo ? "Desactivar" : "Activar"}
        onClick={() => handleToggle(!miembro.activo)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          miembro.activo ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          miembro.activo ? "translate-x-4" : "translate-x-0"
        }`} />
      </button>

      <button
        type="button"
        aria-label="Editar"
        onClick={() => onEdit(miembro)}
        className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <Pencil size={15} />
      </button>

      <ConfirmDeleteDialog
        trigger={
          <button type="button" aria-label="Eliminar" className="inline-flex items-center justify-center p-2 rounded-md hover:bg-destructive/10 transition-colors text-destructive">
            <Trash2 size={15} />
          </button>
        }
        description={`¿Eliminar a "${miembro.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}

type Props = { initialMiembros: MiembroEquipo[] }

export function EquipoAdminList({ initialMiembros }: Props) {
  const router = useRouter()
  const [miembros, setMiembros] = useState(initialMiembros)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<MiembroEquipo | undefined>(undefined)
  const isSavingRef = useRef(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    if (isSavingRef.current) return

    const oldIndex = miembros.findIndex((m) => m.id === active.id)
    const newIndex = miembros.findIndex((m) => m.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const snapshot = miembros
    const reordered = arrayMove(miembros, oldIndex, newIndex)
    setMiembros(reordered)

    isSavingRef.current = true
    const result = await updateOrdenEquipo(reordered.map((m) => m.id))
    isSavingRef.current = false

    if ("error" in result) {
      toast.error(result.error)
      setMiembros(snapshot)
    } else {
      toast.success("Orden guardado")
    }
  }, [miembros])

  const handleToggle = useCallback((id: string, activo: boolean) => {
    setMiembros((prev) => prev.map((m) => m.id === id ? { ...m, activo } : m))
  }, [])

  const handleDeleted = useCallback((id: string) => {
    setMiembros((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const handleEdit = useCallback((miembro: MiembroEquipo) => {
    setEditando(miembro)
    setDialogOpen(true)
  }, [])

  const handleDialogDone = () => {
    setDialogOpen(false)
    setEditando(undefined)
    // Refresca los Server Components sin perder estado del cliente ni recargar la página
    router.refresh()
  }

  const handleNuevo = () => {
    setEditando(undefined)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{miembros.length} miembro{miembros.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={handleNuevo}>
          <Plus size={14} className="mr-2" />
          Agregar miembro
        </Button>
      </div>

      {miembros.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No hay miembros. Agregá el primero.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={miembros.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {miembros.map((miembro) => (
                <MiembroRow
                  key={miembro.id}
                  miembro={miembro}
                  onToggle={handleToggle}
                  onDeleted={handleDeleted}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar miembro" : "Agregar miembro"}</DialogTitle>
          </DialogHeader>
          <MiembroForm key={editando?.id ?? "nuevo"} miembro={editando} onDone={handleDialogDone} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
