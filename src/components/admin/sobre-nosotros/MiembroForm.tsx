"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import Image from "next/image"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { createMiembro, updateMiembro } from "@/lib/actions/institucional"
import type { MiembroEquipo } from "@/lib/queries/institucional"

type Props = {
  miembro?: MiembroEquipo
  onDone: () => void
}

export function MiembroForm({ miembro, onDone }: Props) {
  const isEditing = !!miembro
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(miembro?.foto_url ?? null)
  const [removeFoto, setRemoveFoto] = useState(false)
  const blobUrlRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [])

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    const url = URL.createObjectURL(file)
    blobUrlRef.current = url
    setFotoPreview(url)
    setRemoveFoto(false)
  }

  const handleQuitarFoto = () => {
    // Limpiar el input para que el archivo no se incluya en el FormData
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setFotoPreview(null)
    // Señalar al server que debe eliminar la foto existente
    setRemoveFoto(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServerError(null)
    const formData = new FormData(e.currentTarget)
    if (removeFoto) formData.set("remove_foto", "true")

    startTransition(async () => {
      const result = isEditing
        ? await updateMiembro(miembro.id, formData)
        : await createMiembro(formData)

      if ("error" in result) {
        setServerError(result.error)
        return
      }

      toast.success(isEditing ? "Miembro actualizado" : "Miembro agregado")
      onDone()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          defaultValue={miembro?.nombre}
          required
          disabled={isPending}
          data-gramm="false"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cargo">Cargo</Label>
        <Input
          id="cargo"
          name="cargo"
          defaultValue={miembro?.cargo}
          required
          disabled={isPending}
          data-gramm="false"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Foto (opcional)</Label>
        <div className="flex items-center gap-4">
          {fotoPreview ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border">
              <Image src={fotoPreview} alt="Preview" fill sizes="64px" className="object-cover" />
              <button
                type="button"
                onClick={handleQuitarFoto}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                aria-label="Quitar foto"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shrink-0 border border-dashed">
              <span className="text-xl font-semibold text-muted-foreground">
                {miembro?.nombre?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
          )}
          <Input
            ref={fileInputRef}
            id="foto"
            name="foto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isPending}
            onChange={handleFotoChange}
            className="text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG o WebP. Máximo 2 MB. Se recortará a 200×200.</p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
          {isEditing ? "Guardar cambios" : "Agregar miembro"}
        </Button>
        <Button type="button" variant="ghost" disabled={isPending} onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
