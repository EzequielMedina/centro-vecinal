import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ActividadCard } from "@/components/actividades/ActividadCard"
import { EmptyStateCard } from "@/components/home/EmptyStateCard"
import type { Actividad } from "@/lib/queries/actividades"

type Props = {
  actividades: Actividad[]
}

export function ProximasActividadesSection({ actividades }: Props) {
  return (
    <section className="bg-muted/40 py-12">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-2xl text-foreground">Próximas actividades</h2>
          <Link
            href="/actividades"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {actividades.length === 0 ? (
          <EmptyStateCard mensaje="No hay actividades programadas por el momento." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {actividades.map((actividad) => (
              <ActividadCard key={actividad.id} actividad={actividad} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
