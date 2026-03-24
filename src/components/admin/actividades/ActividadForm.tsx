"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import Image from "next/image"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createActividad, updateActividad } from "@/lib/actions/actividades"
import { CATEGORIAS } from "@/lib/utils/categorias"
import type { Actividad } from "@/lib/queries/actividades"

const RichTextEditor = dynamic(
  () => import("@/components/admin/editor/RichTextEditor").then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <div className="h-40 rounded-lg border border-input bg-muted animate-pulse" /> }
)

type Props = {
  actividad?: Actividad
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ""
  // Convertir ISO string a formato YYYY-MM-DDTHH:mm para el input datetime-local
  return iso.slice(0, 16)
}

export function ActividadForm({ actividad }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [descripcion, setDescripcion] = useState(actividad?.descripcion ?? "")
  const [categoria, setCategoria] = useState(actividad?.categoria ?? "")
  const [imagePreview, setImagePreview] = useState<string | null>(actividad?.imagen_url ?? null)
  const [removeImage, setRemoveImage] = useState(false)
  const blobUrlRef = useRef<string | null>(null)
  const selectedFileRef = useRef<File | null>(null)
  const isEdit = !!actividad

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    const url = URL.createObjectURL(file)
    blobUrlRef.current = url
    selectedFileRef.current = file
    setImagePreview(url)
    setRemoveImage(false)
  }

  function handleRemoveImage() {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    selectedFileRef.current = null
    if (actividad?.imagen_url && imagePreview === actividad.imagen_url) {
      setRemoveImage(true)
    }
    setImagePreview(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)

    const formData = new FormData(e.currentTarget)
    formData.set("descripcion", descripcion)
    formData.set("categoria", categoria)

    if (selectedFileRef.current) {
      formData.set("imagen", selectedFileRef.current)
    }
    if (removeImage) formData.set("remove_image", "true")

    startTransition(async () => {
      const result = isEdit
        ? await updateActividad(actividad.id, formData)
        : await createActividad(formData)

      if ("error" in result) {
        setServerError(result.error)
      } else {
        router.push("/admin/actividades")
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Título */}
      <div className="space-y-1.5">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          name="titulo"
          defaultValue={actividad?.titulo}
          placeholder="Título de la actividad"
          required
          disabled={isPending}
        />
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label>Descripción</Label>
        <RichTextEditor
          value={descripcion}
          onChange={setDescripcion}
          disabled={isPending}
        />
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fecha_inicio">Fecha y hora de inicio</Label>
          <Input
            id="fecha_inicio"
            name="fecha_inicio"
            type="datetime-local"
            defaultValue={toDatetimeLocal(actividad?.fecha_inicio)}
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fecha_fin">Fecha y hora de fin (opcional)</Label>
          <Input
            id="fecha_fin"
            name="fecha_fin"
            type="datetime-local"
            defaultValue={toDatetimeLocal(actividad?.fecha_fin)}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Categoría */}
      <div className="space-y-1.5">
        <Label>Categoría</Label>
        <Select
          value={categoria}
          onValueChange={(v) => { if (v) setCategoria(v) }}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccioná una categoría" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIAS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ubicación y capacidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ubicacion">Ubicación (opcional)</Label>
          <Input
            id="ubicacion"
            name="ubicacion"
            defaultValue={actividad?.ubicacion ?? ""}
            placeholder="Ej: Salón principal"
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="capacidad">Capacidad (opcional)</Label>
          <Input
            id="capacidad"
            name="capacidad"
            type="number"
            min={1}
            defaultValue={actividad?.capacidad ?? ""}
            placeholder="Ej: 30"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Imagen */}
      <div className="space-y-1.5">
        <Label>Imagen (opcional)</Label>
        {imagePreview ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-input bg-muted">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              aria-label="Quitar imagen"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background rounded-full p-1 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <Input
            id="imagen"
            name="imagen"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isPending}
            onChange={handleImageChange}
          />
        )}
        <p className="text-xs text-muted-foreground">JPG, PNG o WebP. Máx. 5 MB.</p>
      </div>

      {/* Activa */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          name="activa"
          value="true"
          defaultChecked={actividad?.activa ?? true}
          disabled={isPending}
          className="rounded border-input"
        />
        <span className="text-sm font-medium">Activa</span>
      </label>

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending || !descripcion.trim() || !categoria}>
          {isPending && <Loader2 size={15} className="animate-spin mr-2" />}
          {isEdit ? "Guardar cambios" : "Crear actividad"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/actividades")}
          disabled={isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
