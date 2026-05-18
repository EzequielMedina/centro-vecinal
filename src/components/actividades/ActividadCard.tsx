import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { MapPin, Users } from "lucide-react"
import { getCategoriaInfo } from "@/lib/utils/categorias"
import { cn } from "@/lib/utils"
import type { Actividad } from "@/lib/queries/actividades"

type Props = {
  actividad: Actividad
}

export function ActividadCard({ actividad }: Props) {
  const { titulo, slug, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad, categoria, imagen_url } = actividad
  const cat = getCategoriaInfo(categoria)
  const esPasada = new Date(fecha_fin ?? fecha_inicio) < new Date()

  const resumen = descripcion
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120)

  const fechaFormateada = format(new Date(fecha_inicio), "d 'de' MMMM, HH:mm 'hs'", { locale: es })

  return (
    <Link href={`/actividades/${slug}`} className="group block rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* Imagen */}
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        {imagen_url ? (
          <Image
            src={imagen_url}
            alt={titulo}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={cn("absolute inset-0 flex items-center justify-center text-2xl font-bold opacity-20", cat.color)}>
            {cat.label}
          </div>
        )}
        {/* Badge categoría */}
        <span className={cn("absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold", cat.color)}>
          {cat.label}
        </span>
        {/* Badge finalizada */}
        {esPasada && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800/80 text-zinc-200">
            Finalizada
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-2">
        <h3 className="font-heading font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {titulo}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{resumen}</p>

        <div className="flex flex-col gap-1 pt-1">
          <span className="text-xs text-muted-foreground capitalize">{fechaFormateada}</span>
          {ubicacion && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={11} /> {ubicacion}
            </span>
          )}
          {capacidad && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users size={11} /> Capacidad: {capacidad} personas
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
