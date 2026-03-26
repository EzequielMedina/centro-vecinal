"use client"

import { useState, useTransition } from "react"
import dynamic from "next/dynamic"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { updateSeccion } from "@/lib/actions/institucional"
import type { SeccionKey } from "@/lib/constants/defaultContent"

const RichTextEditor = dynamic(
  () => import("@/components/admin/editor/RichTextEditor").then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <div className="h-40 rounded-lg border border-input bg-muted animate-pulse" /> }
)

const TITULOS: Record<SeccionKey, string> = {
  historia: "Historia",
  mision: "Misión y Visión",
  valores: "Valores",
}

type Props = {
  seccion: SeccionKey
  contenidoInicial: string
  updatedAt: string
}

export function EditorSeccion({ seccion, contenidoInicial, updatedAt }: Props) {
  const [contenido, setContenido] = useState(contenidoInicial)
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const fechaActualizacion = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(updatedAt))

  const handleSave = () => {
    setServerError(null)
    startTransition(async () => {
      const result = await updateSeccion(seccion, contenido)
      if ("error" in result) {
        setServerError(result.error)
        return
      }
      toast.success(`Sección "${TITULOS[seccion]}" guardada correctamente`)
    })
  }

  return (
    <div className="space-y-3">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <RichTextEditor value={contenido} onChange={setContenido} disabled={isPending} />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Última edición: {fechaActualizacion}
        </p>
        <Button onClick={handleSave} disabled={isPending} size="sm">
          {isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}
