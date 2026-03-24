import Link from "next/link"
import Image from "next/image"
import { CalendarDays } from "lucide-react"
import { stripHtml, truncate } from "@/lib/utils/stripHtml"
import type { Aviso } from "@/lib/queries/avisos"

type Props = Pick<Aviso, "titulo" | "slug" | "imagen_url" | "contenido" | "created_at" | "destacado">

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

export function AvisoCard({ titulo, slug, imagen_url, contenido, created_at, destacado }: Props) {
  const resumen = truncate(stripHtml(contenido), 150)
  const fecha = dateFormatter.format(new Date(created_at))

  return (
    <Link
      href={`/avisos/${slug}`}
      className="group flex flex-col bg-background rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Imagen */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {imagen_url ? (
          <Image
            src={imagen_url}
            alt={titulo}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
            <span className="text-4xl font-heading font-bold text-primary/20">CV</span>
          </div>
        )}
        {destacado && (
          <span className="absolute top-3 left-3 bg-highlight text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Destacado
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays size={13} />
          <time dateTime={created_at}>{fecha}</time>
        </div>
        <h3 className="font-heading font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {titulo}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{resumen}</p>
        <span className="text-sm font-medium text-primary mt-1">Leer más →</span>
      </div>
    </Link>
  )
}
