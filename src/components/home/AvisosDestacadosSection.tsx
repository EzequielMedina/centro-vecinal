import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowRight } from "lucide-react"
import { EmptyStateCard } from "@/components/home/EmptyStateCard"
import type { Aviso } from "@/lib/queries/avisos"

type Props = {
  avisos: Aviso[]
}

export function AvisosDestacadosSection({ avisos }: Props) {
  return (
    <section className="container mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-2xl text-foreground">Avisos destacados</h2>
        <Link
          href="/avisos"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver todos <ArrowRight size={14} />
        </Link>
      </div>

      {avisos.length === 0 ? (
        <EmptyStateCard mensaje="Próximamente nuevos avisos." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {avisos.map((aviso) => {
            const resumen = aviso.contenido
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 150)

            return (
              <Link
                key={aviso.id}
                href={`/avisos/${aviso.slug}`}
                className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                {aviso.imagen_url && (
                  <div className="relative w-full aspect-video bg-muted overflow-hidden">
                    <Image
                      src={aviso.imagen_url}
                      alt={aviso.titulo}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-1 p-4 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(aviso.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                  <h3 className="font-heading font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {aviso.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{resumen}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
