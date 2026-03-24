import { AvisoCard } from "@/components/avisos/AvisoCard"
import type { Aviso } from "@/lib/queries/avisos"

type Props = {
  avisos: Aviso[]
}

export function AvisosGrid({ avisos }: Props) {
  if (avisos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-heading font-semibold text-foreground">Sin avisos por el momento</p>
        <p className="text-sm text-muted-foreground mt-1">Volvé pronto para ver las novedades del barrio.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {avisos.map((aviso) => (
        <AvisoCard key={aviso.id} {...aviso} />
      ))}
    </div>
  )
}
