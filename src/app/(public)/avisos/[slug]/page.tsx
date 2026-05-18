import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { ChevronLeft, CalendarDays } from "lucide-react"
import { getAvisoBySlug } from "@/lib/queries/avisos"
import { createBuildClient } from "@/lib/supabase/build"
import { stripHtml, truncate } from "@/lib/utils/stripHtml"

type Props = {
  params: Promise<{ slug: string }>
}

export const revalidate = 30

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  const supabase = createBuildClient()
  const { data } = await supabase
    .from("avisos")
    .select("slug")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(10)
  return (data ?? []).map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const aviso = await getAvisoBySlug(slug)
  if (!aviso) return {}

  const descripcion = truncate(stripHtml(aviso.contenido), 160)

  return {
    title: `${aviso.titulo} | Centro Vecinal Centro América`,
    description: descripcion,
    openGraph: {
      title: aviso.titulo,
      description: descripcion,
      images: aviso.imagen_url ? [aviso.imagen_url] : [],
    },
  }
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

export default async function AvisoPage({ params }: Props) {
  const { slug } = await params
  const aviso = await getAvisoBySlug(slug)

  if (!aviso) notFound()

  const fecha = dateFormatter.format(new Date(aviso.created_at))

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/avisos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <ChevronLeft size={15} />
        Volver a avisos
      </Link>

      <article>
        {/* Imagen */}
        {aviso.imagen_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-muted">
            <Image
              src={aviso.imagen_url}
              alt={aviso.titulo}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          {aviso.destacado && (
            <span className="inline-block bg-highlight/15 text-highlight text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
              Destacado
            </span>
          )}
          <h1 className="font-heading text-3xl font-bold text-foreground leading-tight mb-3">
            {aviso.titulo}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays size={14} />
            <time dateTime={aviso.created_at}>{fecha}</time>
          </div>
        </header>

        {/* Contenido — sanitizado al guardar, seguro renderizar */}
        <div
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: aviso.contenido }}
        />
      </article>
    </main>
  )
}
