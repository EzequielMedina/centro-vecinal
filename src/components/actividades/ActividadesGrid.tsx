import { ActividadCard } from "@/components/actividades/ActividadCard"
import type { Actividad } from "@/lib/queries/actividades"

type Props = {
  actividades: Actividad[]
  mensajeVacio?: string
}

export function ActividadesGrid({ actividades, mensajeVacio = "No hay actividades" }: Props) {
  if (actividades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">{mensajeVacio}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {actividades.map((actividad) => (
        <ActividadCard key={actividad.id} actividad={actividad} />
      ))}
    </div>
  )
}
