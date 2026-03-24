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
import { createAviso, updateAviso } from "@/lib/actions/avisos"
import type { Aviso } from "@/lib/queries/avisos"

// Carga lazy del editor (pesado, no necesario en SSR)
const RichTextEditor = dynamic(
  () => import("@/components/admin/editor/RichTextEditor").then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <div className="h-40 rounded-lg border border-input bg-muted animate-pulse" /> }
)

type Props = {
  aviso?: Aviso
}

export function AvisoForm({ aviso }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [contenido, setContenido] = useState(aviso?.contenido ?? "")
  // imagePreview: blob URL (nueva imagen) | string URL (imagen guardada) | null (sin imagen)
  const [imagePreview, setImagePreview] = useState<string | null>(aviso?.imagen_url ?? null)
  // true cuando se quitó una imagen que ya estaba guardada (no es blob)
  const [removeImage, setRemoveImage] = useState(false)
  const blobUrlRef = useRef<string | null>(null)
  // Guardar el File para incluirlo en FormData aunque el input esté desmontado
  const selectedFileRef = useRef<File | null>(null)
  const isEdit = !!aviso

  // Revocar blob URL al desmontar el componente
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Revocar blob URL anterior si había uno
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    const url = URL.createObjectURL(file)
    blobUrlRef.current = url
    selectedFileRef.current = file
    setImagePreview(url)
    setRemoveImage(false)
  }

  function handleRemoveImage() {
    // Revocar blob URL si la imagen era recién seleccionada
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    selectedFileRef.current = null
    // Si había una imagen guardada, marcar para eliminarla en el servidor
    if (aviso?.imagen_url && imagePreview === aviso.imagen_url) {
      setRemoveImage(true)
    }
    setImagePreview(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)

    const formData = new FormData(e.currentTarget)
    formData.set("contenido", contenido)

    // El input file puede estar desmontado si hay preview — adjuntar el archivo manualmente
    if (selectedFileRef.current) {
      formData.set("imagen", selectedFileRef.current)
    }

    if (removeImage) formData.set("remove_image", "true")

    startTransition(async () => {
      const result = isEdit
        ? await updateAviso(aviso.id, formData)
        : await createAviso(formData)

      if ("error" in result) {
        setServerError(result.error)
      } else {
        router.push("/admin/avisos")
        router.refresh()
      }
    })
  }

  const isBlob = imagePreview?.startsWith("blob:")

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
          defaultValue={aviso?.titulo}
          placeholder="Título del aviso"
          required
          disabled={isPending}
        />
      </div>

      {/* Contenido */}
      <div className="space-y-1.5">
        <Label>Contenido</Label>
        <RichTextEditor
          value={contenido}
          onChange={setContenido}
          disabled={isPending}
        />
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
              // Los blob URLs son locales — no pasan por el optimizador de Next.js
              unoptimized={isBlob}
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

      {/* Opciones */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="destacado"
            value="true"
            defaultChecked={aviso?.destacado}
            disabled={isPending}
            className="rounded border-input"
          />
          <span className="text-sm font-medium">Destacado</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="activo"
            value="true"
            defaultChecked={aviso?.activo ?? true}
            disabled={isPending}
            className="rounded border-input"
          />
          <span className="text-sm font-medium">Activo</span>
        </label>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending || !contenido.trim()}>
          {isPending && <Loader2 size={15} className="animate-spin mr-2" />}
          {isEdit ? "Guardar cambios" : "Publicar aviso"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/avisos")}
          disabled={isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
