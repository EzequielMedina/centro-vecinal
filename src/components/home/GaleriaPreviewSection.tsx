"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ImagenGaleria } from "@/lib/queries/galeria"

type Props = {
  imagenes: ImagenGaleria[]
}

const INTERVALO_MS = 4000

export function GaleriaPreviewSection({ imagenes }: Props) {
  const [indice, setIndice] = useState(0)
  const [animating, setAnimating] = useState(false)

  const go = useCallback(
    (next: number) => {
      if (animating) return
      setAnimating(true)
      setIndice(next)
      setTimeout(() => setAnimating(false), 400)
    },
    [animating]
  )

  const anterior = useCallback(() => {
    go((indice - 1 + imagenes.length) % imagenes.length)
  }, [go, indice, imagenes.length])

  const siguiente = useCallback(() => {
    go((indice + 1) % imagenes.length)
  }, [go, indice, imagenes.length])

  useEffect(() => {
    if (imagenes.length <= 1) return
    const id = setInterval(siguiente, INTERVALO_MS)
    return () => clearInterval(id)
  }, [siguiente, imagenes.length])

  if (imagenes.length === 0) return null

  const prevIdx = (indice - 1 + imagenes.length) % imagenes.length
  const nextIdx = (indice + 1) % imagenes.length

  const slides = [
    { img: imagenes[prevIdx], role: "prev" as const },
    { img: imagenes[indice],   role: "current" as const },
    { img: imagenes[nextIdx],  role: "next" as const },
  ]

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

      {/* Carrusel peek */}
      <div className="relative flex items-center justify-center gap-3 overflow-hidden px-2 py-4">
        {slides.map(({ img, role }) => {
          const isCurrent = role === "current"
          return (
            <div
              key={`${role}-${img.id}`}
              className={cn(
                "relative shrink-0 overflow-hidden rounded-xl transition-all duration-400",
                isCurrent
                  ? "w-[50%] sm:w-[52%] aspect-[4/3] z-10 shadow-xl ring-2 ring-primary/20"
                  : "w-[22%] sm:w-[21%] aspect-[4/3] opacity-50 scale-95 cursor-pointer"
              )}
              onClick={role === "prev" ? anterior : role === "next" ? siguiente : undefined}
            >
              <Image
                src={img.url}
                alt={img.titulo || "Imagen de galería"}
                fill
                sizes={isCurrent ? "(min-width: 640px) 60vw, 58vw" : "20vw"}
                className="object-cover"
                unoptimized={process.env.NODE_ENV === "development"}
                priority={isCurrent}
              />
              {/* Overlay en imágenes laterales */}
              {!isCurrent && (
                <div className="absolute inset-0 bg-background/30" />
              )}
              {/* Título en imagen central */}
              {isCurrent && img.titulo && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-4">
                  <p className="text-sm text-white font-medium truncate">{img.titulo}</p>
                </div>
              )}
            </div>
          )
        })}

        {/* Botones de navegación sobre el carrusel */}
        {imagenes.length > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              className="absolute left-0 z-20 p-2 rounded-full bg-background/80 border shadow-sm hover:bg-background transition-colors"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={siguiente}
              className="absolute right-0 z-20 p-2 rounded-full bg-background/80 border shadow-sm hover:bg-background transition-colors"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Indicadores y link */}
      <div className="flex items-center justify-center gap-1.5">
        {imagenes.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Ir a imagen ${i + 1}`}
            className={cn(
              "rounded-full transition-all duration-300",
              i === indice ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            )}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/galeria"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
        >
          Ver todas las fotos <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}
