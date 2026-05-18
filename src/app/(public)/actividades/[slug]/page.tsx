import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { MapPin, Users, Calendar, ArrowLeft } from "lucide-react"
import { getActividadBySlug } from "@/lib/queries/actividades"
import { getCategoriaInfo } from "@/lib/utils/categorias"
import { cn } from "@/lib/utils"

export const revalidate = 30

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ categoria?: string }>
}


export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const actividad = await getActividadBySlug(slug)
  if (!actividad) return {}
  return {
    title: actividad.titulo,
    description: actividad.descripcion.replace(/<[^>]+>/g, " ").slice(0, 160),
  }
}

export default async function ActividadDetallePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { categoria } = await searchParams
  const actividad = await getActividadBySlug(slug)

  if (!actividad) notFound()

  const cat = getCategoriaInfo(actividad.categoria)
  const esPasada = new Date(actividad.fecha_fin ?? actividad.fecha_inicio) < new Date()
  const fechaInicio = format(new Date(actividad.fecha_inicio), "d 'de' MMMM 'de' yyyy, HH:mm 'hs'", { locale: es })
  const fechaFin = actividad.fecha_fin
    ? format(new Date(actividad.fecha_fin), "d 'de' MMMM 'de' yyyy, HH:mm 'hs'", { locale: es })
    : null

  // JSON-LD Event para SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: actividad.titulo,
    startDate: actividad.fecha_inicio,
    endDate: actividad.fecha_fin ?? undefined,
    location: actividad.ubicacion
      ? { "@type": "Place", name: actividad.ubicacion }
      : undefined,
    image: actividad.imagen_url ?? undefined,
    description: actividad.descripcion.replace(/<[^>]+>/g, " ").slice(0, 300),
    eventStatus: esPasada
      ? "https://schema.org/EventCompleted"
      : "https://schema.org/EventScheduled",
    organizer: { "@type": "Organization", name: "Centro Vecinal Centro América" },
  }

  const volverHref = categoria ? `/actividades?categoria=${categoria}` : "/actividades"

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
        {/* Volver */}
        <Link
          href={volverHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} />
          Volver a actividades
        </Link>

        {/* Imagen */}
        {actividad.imagen_url && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <Image src={actividad.imagen_url} alt={actividad.titulo} fill className="object-cover" />
          </div>
        )}

        {/* Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", cat.color)}>
              {cat.label}
            </span>
            {esPasada && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600">
                Finalizada
              </span>
            )}
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">{actividad.titulo}</h1>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-muted/40 border text-sm">
          <div className="flex items-start gap-2">
            <Calendar size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">Inicio</p>
              <p className="text-muted-foreground capitalize">{fechaInicio}</p>
            </div>
          </div>
          {fechaFin && (
            <div className="flex items-start gap-2">
              <Calendar size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">Fin</p>
                <p className="text-muted-foreground capitalize">{fechaFin}</p>
              </div>
            </div>
          )}
          {actividad.ubicacion && (
            <div className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">Ubicación</p>
                <p className="text-muted-foreground">{actividad.ubicacion}</p>
              </div>
            </div>
          )}
          {actividad.capacidad && (
            <div className="flex items-start gap-2">
              <Users size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">Capacidad</p>
                <p className="text-muted-foreground">{actividad.capacidad} personas</p>
              </div>
            </div>
          )}
        </div>

        {/* Descripción */}
        {/* El contenido viene sanitizado de la DB */}
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: actividad.descripcion }}
        />
      </div>
    </>
  )
}
