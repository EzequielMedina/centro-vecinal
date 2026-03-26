"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ImagenGaleria } from "@/lib/queries/galeria"

type Props = { imagenes: ImagenGaleria[] }

const INTERVALO_MS = 4500
// Cada slide ocupa este % del contenedor. El resto asoma a los costados.
const SLIDE_W = 62

export function GaleriaPreviewSection({ imagenes }: Props) {
  const [indice, setIndice] = useState(0)
  const blockedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const go = useCallback(
    (next: number) => {
      if (blockedRef.current) return
      blockedRef.current = true
      setIndice(next)
      timerRef.current = setTimeout(() => { blockedRef.current = false }, 650)
    },
    []
  )

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const anterior = useCallback(() => go((indice - 1 + imagenes.length) % imagenes.length), [go, indice, imagenes.length])
  const siguiente = useCallback(() => go((indice + 1) % imagenes.length), [go, indice, imagenes.length])

  useEffect(() => {
    if (imagenes.length <= 1) return
    const id = setInterval(siguiente, INTERVALO_MS)
    return () => clearInterval(id)
  }, [siguiente, imagenes.length])

  if (imagenes.length === 0) return null

  // El track se desplaza para centrar el slide activo.
  // offset inicial centra el primer slide: (100 - SLIDE_W) / 2
  const offset = (100 - SLIDE_W) / 2
  const translateX = offset - indice * SLIDE_W

  return (
    <section className="container mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-2xl text-foreground">Galería</h2>
        <Link href="/galeria" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Ver galería completa <ArrowRight size={14} />
        </Link>
      </div>

      <div className="relative group">
        {/* Viewport — oculta lo que sale del contenedor */}
        <div className="overflow-hidden">
          {/* Track — se desliza con translateX */}
          <div
            className="flex transition-transform duration-[600ms] ease-in-out"
            style={{ transform: `translateX(${translateX}%)` }}
          >
            {imagenes.map((img, i) => {
              const isCurrent = i === indice
              const isPrev   = i < indice
              const isNext   = i > indice
              return (
                <div
                  key={img.id}
                  style={{ width: `${SLIDE_W}%`, flexShrink: 0 }}
                  className={cn(
                    "relative aspect-[16/9] rounded-xl overflow-hidden transition-all duration-[600ms] ease-in-out px-1.5",
                    isCurrent && "scale-100 opacity-100 z-10",
                    isPrev    && "scale-50 opacity-50 translate-x-[50%]",
                    isNext    && "scale-50 opacity-50 -translate-x-[50%]",
                  )}
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <Image
                      src={img.url}
                      alt={img.titulo || "Imagen de galería"}
                      fill
                      sizes="(min-width: 640px) 70vw, 80vw"
                      className="object-cover"
                      unoptimized={process.env.NODE_ENV === "development"}
                      priority={isCurrent}
                    />
                    {isCurrent && img.titulo && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-4">
                        <p className="text-sm text-white font-medium truncate">{img.titulo}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Flechas */}
        {imagenes.length > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              aria-label="Imagen anterior"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-background/80 border shadow-sm hover:bg-background transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={siguiente}
              aria-label="Imagen siguiente"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-background/80 border shadow-sm hover:bg-background transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {(imagenes[indice].titulo || imagenes[indice].descripcion) && (
        <div className="text-center space-y-1 px-4">
          {imagenes[indice].titulo && <p className="font-medium text-foreground">{imagenes[indice].titulo}</p>}
          {imagenes[indice].descripcion && <p className="text-sm text-muted-foreground">{imagenes[indice].descripcion}</p>}
        </div>
      )}

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
    </section>
  )
}
