import { notFound } from "next/navigation"
import { getActividadByIdAdmin } from "@/lib/queries/actividades"
import { ActividadForm } from "@/components/admin/actividades/ActividadForm"

export const metadata = { title: "Editar actividad — Admin" }

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditarActividadPage({ params }: Props) {
  const { id } = await params
  const actividad = await getActividadByIdAdmin(id)

  if (!actividad) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-xl text-foreground">Editar actividad</h2>
        <p className="text-sm text-muted-foreground mt-0.5 truncate">{actividad.titulo}</p>
      </div>
      <ActividadForm actividad={actividad} />
    </div>
  )
}
