"use client"

import { useRef, useState, useCallback } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImagePreviewGrid, type UploadFile } from "./ImagePreviewGrid"
import type { ImagenGaleria } from "@/lib/queries/galeria"

const MAX_FILES = 10
const MAX_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]

type Props = {
  onUploaded: (nuevas: ImagenGaleria[]) => void
}

export function ImageUploadZone({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming
      .filter((f) => ACCEPTED_TYPES.includes(f.type))
      .filter((f) => f.size <= MAX_SIZE_BYTES)
      .slice(0, MAX_FILES)

    setFiles((prev) => {
      const remaining = MAX_FILES - prev.length
      return [
        ...prev,
        ...valid.slice(0, remaining).map((f) => ({
          id: Math.random().toString(36).slice(2),
          file: f,
          previewUrl: URL.createObjectURL(f),
          titulo: "",
          descripcion: "",
          status: "pending" as const,
        })),
      ]
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      addFiles(Array.from(e.dataTransfer.files))
    },
    [addFiles]
  )

  const handleUpdate = useCallback((id: string, field: "titulo" | "descripcion", value: string) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, [field]: value } : f))
  }, [])

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const handleConfirm = async () => {
    const pending = files.filter((f) => f.status === "pending")
    if (pending.length === 0) return

    setUploading(true)

    // Marcar todos como uploading
    setFiles((prev) =>
      prev.map((f) => (f.status === "pending" ? { ...f, status: "uploading" } : f))
    )

    // Subir en paralelo
    const results = await Promise.all(
      pending.map(async (item) => {
        const formData = new FormData()
        formData.append("file", item.file)
        formData.append("titulo", item.titulo)
        formData.append("descripcion", item.descripcion)

        try {
          const res = await fetch("/api/upload/galeria", {
            method: "POST",
            body: formData,
          })

          if (!res.ok) {
            const json = (await res.json()) as { error?: string }
            return { id: item.id, ok: false, error: json.error ?? "Error al subir", data: null }
          }

          const json = (await res.json()) as { id: string; url: string }
          return { id: item.id, ok: true, error: null, data: json }
        } catch {
          return { id: item.id, ok: false, error: "Error de red", data: null }
        }
      })
    )

    // Actualizar estados individuales
    setFiles((prev) =>
      prev.map((f) => {
        const result = results.find((r) => r.id === f.id)
        if (!result) return f
        return result.ok
          ? { ...f, status: "done" }
          : { ...f, status: "error", errorMessage: result.error ?? undefined }
      })
    )

    setUploading(false)

    // Notificar imágenes subidas exitosamente
    const uploaded = results.filter((r) => r.ok && r.data)

    if (uploaded.length > 0) {
      const pendingMap = Object.fromEntries(pending.map((p) => [p.id, p]))
      const nuevas = uploaded.map((r) => ({
        id: r.data!.id,
        url: r.data!.url,
        titulo: pendingMap[r.id]?.titulo ?? "",
        descripcion: pendingMap[r.id]?.descripcion ?? "",
        categoria: "",
        orden: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) satisfies ImagenGaleria[]
      onUploaded(nuevas)
    }

    // Limpiar previews de los exitosos tras 2s
    setTimeout(() => {
      setFiles((prev) => {
        const toKeep = prev.filter((f) => f.status !== "done")
        const toRemove = prev.filter((f) => f.status === "done")
        toRemove.forEach((f) => URL.revokeObjectURL(f.previewUrl))
        return toKeep
      })
    }, 2000)
  }

  const pendingCount = files.filter((f) => f.status === "pending").length

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []))
            e.currentTarget.value = ""
          }}
        />
        <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
        <p className="text-sm font-medium text-foreground">
          Arrastrá imágenes o hacé click para seleccionar
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG o WebP · Máx. 10 MB por imagen · Hasta {MAX_FILES} a la vez
        </p>
      </div>

      {/* Previews */}
      <ImagePreviewGrid files={files} onRemove={handleRemove} onUpdate={handleUpdate} />

      {/* Acción confirmar */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3">
          <Button onClick={handleConfirm} disabled={uploading}>
            {uploading ? "Subiendo…" : `Subir ${pendingCount} imagen${pendingCount > 1 ? "es" : ""}`}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              files.forEach((f) => URL.revokeObjectURL(f.previewUrl))
              setFiles([])
            }}
            disabled={uploading}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}
