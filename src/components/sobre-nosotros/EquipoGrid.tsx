import Image from "next/image"
import type { MiembroEquipo } from "@/lib/queries/institucional"

function AvatarFallback({ nombre }: { nombre: string }) {
  const inicial = nombre.trim()[0]?.toUpperCase() ?? "?"
  return (
    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <span className="text-2xl font-semibold text-primary">{inicial}</span>
    </div>
  )
}

function MiembroCard({ miembro }: { miembro: MiembroEquipo }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 p-4">
      {miembro.foto_url ? (
        <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0">
          <Image
            src={miembro.foto_url}
            alt={miembro.nombre}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      ) : (
        <AvatarFallback nombre={miembro.nombre} />
      )}
      <div>
        <p className="font-semibold text-foreground text-sm">{miembro.nombre}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{miembro.cargo}</p>
      </div>
    </div>
  )
}

type Props = {
  miembros: MiembroEquipo[]
}

export function EquipoGrid({ miembros }: Props) {
  if (miembros.length === 0) return null

  return (
    <section>
      <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">Equipo Directivo</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {miembros.map((miembro) => (
          <MiembroCard key={miembro.id} miembro={miembro} />
        ))}
      </div>
    </section>
  )
}
