"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import type { ImagenGaleria } from "@/lib/queries/galeria"

type Props = {
  imagenes: ImagenGaleria[]
}

const INTERVALO_MS = 4000

export function GaleriaPreviewSection({ imagenes }: Props) {
  const [indice, setIndice] = useState(0)

  const anterior = useCallback(() => {
    setIndice((i) => (i === 0 ? imagenes.length - 1 : i - 1))
  }, [imagenes.length])

  const siguiente = useCallback(() => {
    setIndice((i) => (i === imagenes.length - 1 ? 0 : i + 1))
  }, [imagenes.length])

  // Auto-play
  useEffect(() => {
    if (imagenes.length <= 1) return
    const id = setInterval(siguiente, INTERVALO_MS)
    return () => clearInterval(id)
  }, [siguiente, imagenes.length])

  if (imagenes.length === 0) return null

  const imagen = imagenes[indice]

  return (
    <section className="container mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-2xl text-foreground">Galería</h2>
        <Link
          href="/galeria"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver galería completa <ArrowRight size={14} />
        </Link>
      </div>

      <Link
        href="/galeria"
        className="group relative block w-full overflow-hidden rounded-xl bg-muted"
        style={{ aspectRatio: "16/7" }}
        aria-label="Ir a la galería"
      >
        {/* Imagen actual */}
        <Image
          key={imagen.id}
          src={imagen.url}
          alt={imagen.titulo || "Imagen de galería"}
          fill
          sizes="(min-width: 1024px) 80vw, 100vw"
          className="object-cover transition-opacity duration-500"
          unoptimized={process.env.NODE_ENV === "development"}
          priority={indice === 0}
        />

        {/* Overlay degradado */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Título de imagen */}
        {imagen.titulo && (
          <div className="absolute bottom-10 left-4 right-4">
            <p className="text-white font-medium text-sm drop-shadow">{imagen.titulo}</p>
          </div>
        )}

        {/* Indicadores */}
        {imagenes.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imagenes.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === indice ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </Link>

      {/* Controles externos (no dentro del Link para evitar anidamiento) */}
      {imagenes.length > 1 && (
        <div className="flex justify-center gap-3 -mt-2">
          <button
            type="button"
            onClick={anterior}
            className="p-2 rounded-full border hover:bg-muted transition-colors"
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={siguiente}
            className="p-2 rounded-full border hover:bg-muted transition-colors"
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  )
}
