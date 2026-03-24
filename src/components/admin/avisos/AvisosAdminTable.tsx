"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ConfirmDeleteDialog } from "@/components/admin/shared/ConfirmDeleteDialog"
import { deleteAviso, toggleActivo } from "@/lib/actions/avisos"
import type { Aviso } from "@/lib/queries/avisos"

type Filtro = "todos" | "activos" | "inactivos"

type Props = { avisos: Aviso[] }

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric", month: "short", year: "numeric",
})

export function AvisosAdminTable({ avisos }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>("todos")

  const filtrados = avisos.filter((a) => {
    if (filtro === "activos") return a.activo
    if (filtro === "inactivos") return !a.activo
    return true
  })

  function handleToggle(id: string, activo: boolean) {
    setError(null)
    startTransition(async () => {
      const result = await toggleActivo(id, activo)
      if ("error" in result) setError(result.error)
      else router.refresh()
    })
  }

  function handleDelete(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await deleteAviso(id)
      if ("error" in result) setError(result.error)
      else router.refresh()
    })
  }

  const filtros: { key: Filtro; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "activos", label: "Activos" },
    { key: "inactivos", label: "Inactivos" },
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
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
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
              <TableHead>Estado</TableHead>
              <TableHead>Destacado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No hay avisos
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((aviso) => (
                <TableRow key={aviso.id}>
                  <TableCell className="font-medium max-w-xs truncate">{aviso.titulo}</TableCell>

                  <TableCell>
                    <Badge variant={aviso.activo ? "default" : "secondary"}>
                      {aviso.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {aviso.destacado && <Badge variant="outline">Destacado</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {dateFormatter.format(new Date(aviso.created_at))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* Toggle activo */}
                      <button
                        onClick={() => handleToggle(aviso.id, !aviso.activo)}
                        disabled={isPending}
                        aria-label={aviso.activo ? "Desactivar" : "Activar"}
                        title={aviso.activo ? "Desactivar" : "Activar"}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {aviso.activo ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>

                      {/* Editar */}
                      <Link
                        href={`/admin/avisos/${aviso.id}/editar`}
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
                        description={`Se eliminará "${aviso.titulo}". Esta acción no se puede deshacer.`}
                        onConfirm={() => handleDelete(aviso.id)}
                        disabled={isPending}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
