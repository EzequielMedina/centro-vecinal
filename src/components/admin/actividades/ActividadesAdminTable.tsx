"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ConfirmDeleteDialog } from "@/components/admin/shared/ConfirmDeleteDialog"
import { deleteActividad, toggleActiva } from "@/lib/actions/actividades"
import { getCategoriaInfo } from "@/lib/utils/categorias"
import { cn } from "@/lib/utils"
import type { Actividad } from "@/lib/queries/actividades"

type Filtro = "todas" | "activas" | "inactivas"

type Props = { actividades: Actividad[] }

export function ActividadesAdminTable({ actividades }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>("todas")

  const filtradas = actividades.filter((a) => {
    if (filtro === "activas") return a.activa
    if (filtro === "inactivas") return !a.activa
    return true
  })

  function handleToggle(id: string, activa: boolean) {
    setError(null)
    startTransition(async () => {
      const result = await toggleActiva(id, activa)
      if ("error" in result) setError(result.error)
      else router.refresh()
    })
  }

  function handleDelete(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await deleteActividad(id)
      if ("error" in result) setError(result.error)
      else router.refresh()
    })
  }

  const filtros: { key: Filtro; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "activas", label: "Activas" },
    { key: "inactivas", label: "Inactivas" },
  ]

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md">{error}</p>
      )}

      {/* Filtros */}
      <div className="flex gap-2">
        {filtros.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFiltro(key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              filtro === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Fecha inicio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No hay actividades
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((actividad) => {
                const cat = getCategoriaInfo(actividad.categoria)
                const esPasada = new Date(actividad.fecha_inicio) < new Date()
                return (
                  <TableRow key={actividad.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {actividad.titulo}
                      {esPasada && (
                        <span className="ml-2 text-xs text-muted-foreground">(finalizada)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", cat.color)}>
                        {cat.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(actividad.fecha_inicio), "d MMM yyyy, HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={actividad.activa ? "default" : "secondary"}>
                        {actividad.activa ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* Toggle activa */}
                        <button
                          onClick={() => handleToggle(actividad.id, !actividad.activa)}
                          disabled={isPending}
                          aria-label={actividad.activa ? "Desactivar" : "Activar"}
                          title={actividad.activa ? "Desactivar" : "Activar"}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          {actividad.activa ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>

                        {/* Editar */}
                        <Link
                          href={`/admin/actividades/${actividad.id}/editar`}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil size={15} />
                        </Link>

                        {/* Eliminar */}
                        <ConfirmDeleteDialog
                          trigger={
                            <button
                              disabled={isPending}
                              aria-label="Eliminar"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          }
                          description={`Se eliminará "${actividad.titulo}". Esta acción no se puede deshacer.`}
                          onConfirm={() => handleDelete(actividad.id)}
                          disabled={isPending}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
