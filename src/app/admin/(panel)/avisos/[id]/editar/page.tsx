import { notFound } from "next/navigation"
import { getAvisoByIdAdmin } from "@/lib/queries/avisos"
import { AvisoForm } from "@/components/admin/avisos/AvisoForm"

export const metadata = { title: "Editar aviso — Admin" }

type Props = { params: Promise<{ id: string }> }

export default async function EditarAvisoPage({ params }: Props) {
  const { id } = await params
  const aviso = await getAvisoByIdAdmin(id)

  if (!aviso) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-xl text-foreground">Editar aviso</h2>
        <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-xs">{aviso.titulo}</p>
      </div>

      <AvisoForm aviso={aviso} />
    </div>
  )
}
