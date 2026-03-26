import { ServicioCard } from "./ServicioCard"
import { EmptyStateCard } from "@/components/home/EmptyStateCard"
import type { Servicio } from "@/lib/queries/servicios"

type Props = {
  servicios: Servicio[]
}

export function ServiciosGrid({ servicios }: Props) {
  if (servicios.length === 0) {
    return <EmptyStateCard mensaje="Próximamente información sobre nuestros servicios." />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {servicios.map((servicio) => (
        <ServicioCard key={servicio.id} servicio={servicio} />
      ))}
    </div>
  )
}
