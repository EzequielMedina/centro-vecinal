"use client"

import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export type UploadFile = {
  id: string
  file: File
  previewUrl: string
  titulo: string
  descripcion: string
  status: "pending" | "uploading" | "done" | "error"
  errorMessage?: string
}

type Props = {
  files: UploadFile[]
  onRemove: (id: string) => void
  onUpdate: (id: string, field: "titulo" | "descripcion", value: string) => void
}

export function ImagePreviewGrid({ files, onRemove, onUpdate }: Props) {
  if (files.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {files.map((item) => (
        <div key={item.id} className="rounded-lg border bg-card overflow-hidden">
          {/* Imagen */}
          <div className="relative aspect-video bg-muted overflow-hidden">
            <img
              src={item.previewUrl}
              alt={item.file.name}
              className="w-full h-full object-cover"
            />

            {/* Overlay de estado */}
            {item.status === "uploading" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 size={24} className="text-white animate-spin" />
              </div>
            )}
            {item.status === "done" && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <CheckCircle size={24} className="text-green-400" />
              </div>
            )}
            {item.status === "error" && (
              <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center p-2 gap-1">
                <AlertCircle size={20} className="text-red-300" />
                <p className="text-xs text-red-200 text-center leading-tight">
                  {item.errorMessage ?? "Error"}
                </p>
              </div>
            )}

            {/* Botón quitar */}
            {item.status === "pending" && (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                aria-label={`Quitar ${item.file.name}`}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Campos de texto */}
          <div className="p-3 space-y-2">
            <input
              type="text"
              placeholder="Título (opcional)"
              value={item.titulo}
              disabled={item.status !== "pending"}
              onChange={(e) => onUpdate(item.id, "titulo", e.target.value)}
              className="w-full text-sm px-2 py-1.5 rounded-md border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={item.descripcion}
              disabled={item.status !== "pending"}
              onChange={(e) => onUpdate(item.id, "descripcion", e.target.value)}
              rows={2}
              className="w-full text-sm px-2 py-1.5 rounded-md border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 resize-none"
            />
            <p className="text-xs text-muted-foreground truncate">{item.file.name} · {(item.file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        </div>
      ))}
    </div>
  )
}
