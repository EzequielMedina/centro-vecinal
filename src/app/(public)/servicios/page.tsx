import type { Metadata } from "next"
import { getServiciosActivos } from "@/lib/queries/servicios"
import { ServiciosGrid } from "@/components/servicios/ServiciosGrid"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Servicios — Centro Vecinal Centro América",
  description:
    "Conocé todos los servicios que ofrece el Centro Vecinal Centro América para los vecinos del barrio.",
}

export default async function ServiciosPage() {
  const servicios = await getServiciosActivos()

  return (
    <main className="container mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="font-heading font-bold text-3xl text-foreground">Nuestros servicios</h1>
        <p className="text-muted-foreground mt-1">
          Todo lo que el Centro Vecinal tiene para ofrecerte
        </p>
      </div>
      <ServiciosGrid servicios={servicios} />
    </main>
  )
}
