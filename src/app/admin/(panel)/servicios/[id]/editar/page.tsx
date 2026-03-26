import { notFound } from "next/navigation"
import { getServicioById } from "@/lib/queries/servicios"
import { ServicioForm } from "@/components/admin/servicios/ServicioForm"

export const metadata = { title: "Editar servicio — Admin" }

type Props = { params: Promise<{ id: string }> }

export default async function EditarServicioPage({ params }: Props) {
  const { id } = await params
  const servicio = await getServicioById(id)

  if (!servicio) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-xl text-foreground">Editar servicio</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{servicio.nombre}</p>
      </div>
      <ServicioForm servicio={servicio} />
    </div>
  )
}
