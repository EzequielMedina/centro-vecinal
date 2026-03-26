"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconSelector } from "./IconSelector"
import { createServicio, updateServicio } from "@/lib/actions/servicios"
import { toast } from "sonner"
import type { Servicio } from "@/lib/queries/servicios"

type Props = {
  servicio?: Servicio
}

export function ServicioForm({ servicio }: Props) {
  const router = useRouter()
  const isEditing = !!servicio
  const [isPending, startTransition] = useTransition()

  const [icono, setIcono] = useState(servicio?.icono ?? "Star")
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServerError(null)

    const formData = new FormData(e.currentTarget)
    formData.set("icono", icono)

    startTransition(async () => {
      const result = isEditing
        ? await updateServicio(servicio.id, formData)
        : await createServicio(formData)

      if ("error" in result) {
        setServerError(result.error)
        return
      }

      toast.success(isEditing ? "Servicio actualizado" : "Servicio creado")
      router.push("/admin/servicios")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
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
          defaultValue={servicio?.nombre}
          required
          disabled={isPending}
          data-gramm="false"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descripcion">Descripción</Label>
        <textarea
          id="descripcion"
          name="descripcion"
          defaultValue={servicio?.descripcion}
          rows={3}
          required
          disabled={isPending}
          data-gramm="false"
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium">Ícono</p>
        <IconSelector value={icono} onChange={setIcono} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="activo"
          name="activo"
          type="checkbox"
          defaultChecked={servicio?.activo ?? true}
          value="true"
          disabled={isPending}
          className="rounded border disabled:opacity-50"
          onChange={(e) => {
            const input = e.currentTarget.form?.elements.namedItem("activo") as HTMLInputElement
            if (input) input.value = e.currentTarget.checked ? "true" : "false"
          }}
        />
        <Label htmlFor="activo">Activo</Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
          {isEditing ? "Guardar cambios" : "Crear servicio"}
        </Button>
        <Button type="button" variant="ghost" disabled={isPending} onClick={() => router.push("/admin/servicios")}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
