import Link from "next/link"
import { ArrowRight } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { EmptyStateCard } from "@/components/home/EmptyStateCard"
import type { Servicio } from "@/lib/queries/servicios"

type Props = {
  servicios: Servicio[]
}

function ServicioIcon({ nombre }: { nombre: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as Record<string, any>)[nombre] as React.ComponentType<{ size?: number; className?: string }> | undefined
  if (!Icon) return <LucideIcons.Circle size={24} className="text-primary" />
  return <Icon size={24} className="text-primary" />
}

export function ServiciosResumenSection({ servicios }: Props) {
  return (
    <section className="container mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-2xl text-foreground">Nuestros servicios</h2>
        <Link
          href="/servicios"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver todos <ArrowRight size={14} />
        </Link>
      </div>

      {servicios.length === 0 ? (
        <EmptyStateCard mensaje="Próximamente información sobre nuestros servicios." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              className="flex flex-col items-center gap-3 p-5 rounded-xl border bg-card text-center hover:shadow-sm transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ServicioIcon nombre={servicio.icono} />
              </div>
              <p className="text-sm font-medium text-foreground leading-tight">{servicio.nombre}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
