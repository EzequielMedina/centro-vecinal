import { getDynamicIcon } from "@/lib/utils/icons"
import type { Servicio } from "@/lib/queries/servicios"

type Props = {
  servicio: Servicio
}

export function ServicioCard({ servicio }: Props) {
  const Icon = getDynamicIcon(servicio.icono)

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-xl border bg-card text-center hover:shadow-md transition-shadow">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Icon size={28} className="text-primary" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-heading font-semibold text-foreground">{servicio.nombre}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{servicio.descripcion}</p>
      </div>
    </div>
  )
}
