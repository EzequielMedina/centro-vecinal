"use client"

import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export type UploadFile = {
  id: string
  file: File
  previewUrl: string
  status: "pending" | "uploading" | "done" | "error"
  errorMessage?: string
}

type Props = {
  files: UploadFile[]
  onRemove: (id: string) => void
}

export function ImagePreviewGrid({ files, onRemove }: Props) {
  if (files.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
      {files.map((item) => (
        <div key={item.id} className="relative group rounded-lg overflow-hidden border bg-muted aspect-square">
          {/* Preview */}
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

          {/* Botón quitar (solo pending) */}
          {item.status === "pending" && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              aria-label={`Quitar ${item.file.name}`}
            >
              <X size={14} />
            </button>
          )}

          {/* Nombre del archivo */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-1">
            <p className="text-xs text-white truncate">{item.file.name}</p>
            <p className="text-xs text-white/70">
              {(item.file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
