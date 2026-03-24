"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, ShieldCheck, Shield } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteAdmin } from "@/lib/actions/usuarios"
import type { AdminUser } from "@/lib/queries/usuarios"

type Props = {
  usuarios: AdminUser[]
  currentUserId: string
}

export function UsuariosTable({ usuarios, currentUserId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await deleteAdmin(id)
      if ("error" in result) {
        setError(result.error)
      } else {
        setError(null)
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md">
          {error}
        </p>
      )}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nombre}</TableCell>
                <TableCell className="text-muted-foreground">
                  {u.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={u.rol === "superadmin" ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {u.rol === "superadmin" ? (
                      <ShieldCheck size={12} />
                    ) : (
                      <Shield size={12} />
                    )}
                    {u.rol}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(u.created_at).toLocaleDateString("es-AR")}
                </TableCell>
                <TableCell>
                  {u.id !== currentUserId && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:pointer-events-none disabled:opacity-50"
                        disabled={isPending}
                      >
                        <Trash2 size={15} />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Eliminar usuario?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará <strong>{u.nombre}</strong> (
                            {u.email}). Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(u.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
