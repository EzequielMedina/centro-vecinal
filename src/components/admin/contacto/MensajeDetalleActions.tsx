"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ConfirmDeleteDialog } from "@/components/admin/shared/ConfirmDeleteDialog"
import { Button } from "@/components/ui/button"
import { deleteMensaje } from "@/lib/actions/contacto"

type Props = { mensajeId: string; nombreVecino: string }

export function MensajeDetalleActions({ mensajeId, nombreVecino }: Props) {
  const router = useRouter()

  const handleDelete = async () => {
    const result = await deleteMensaje(mensajeId)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    toast.success("Mensaje eliminado")
    router.push("/admin/contacto")
  }

  return (
    <ConfirmDeleteDialog
      trigger={<Button variant="destructive" size="sm">Eliminar</Button>}
      description={`¿Eliminar este mensaje de "${nombreVecino}"? Esta acción no se puede deshacer.`}
      onConfirm={handleDelete}
    />
  )
}
