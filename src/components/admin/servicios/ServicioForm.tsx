"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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

  const [icono, setIcono] = useState(servicio?.icono ?? "Star")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set("icono", icono)

    const result = isEditing
      ? await updateServicio(servicio.id, formData)
      : await createServicio(formData)

    setLoading(false)

    if ("error" in result) {
      setError(result.error)
      return
    }

    toast.success(isEditing ? "Servicio actualizado" : "Servicio creado")
    router.push("/admin/servicios")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="nombre" className="text-sm font-medium">Nombre</label>
        <input
          id="nombre"
          name="nombre"
          defaultValue={servicio?.nombre}
          required
          data-gramm="false"
          className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="descripcion" className="text-sm font-medium">Descripción</label>
        <textarea
          id="descripcion"
          name="descripcion"
          defaultValue={servicio?.descripcion}
          rows={3}
          required
          data-gramm="false"
          className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
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
          className="rounded border"
          onChange={(e) => {
            const input = e.currentTarget.form?.elements.namedItem("activo") as HTMLInputElement
            if (input) input.value = e.currentTarget.checked ? "true" : "false"
          }}
        />
        <label htmlFor="activo" className="text-sm font-medium">Activo</label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear servicio"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/servicios")}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
