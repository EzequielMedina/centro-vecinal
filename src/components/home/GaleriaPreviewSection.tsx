"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ImagenGaleria } from "@/lib/queries/galeria"

type Props = { imagenes: ImagenGaleria[] }

const INTERVALO_MS = 4500
const SLIDE_W      = 62   // % del contenedor que ocupa cada slide
const ANIM_MS      = 600  // duración de la transición

export function GaleriaPreviewSection({ imagenes }: Props) {
  // Infinite loop: se clonan el primer y último slide en los extremos del track.
  // realSlides = [clone_last, ...imagenes, clone_first]
  // trackIndex va de 0 a realSlides.length-1; índice 1 = primer slide real.
  const [trackIndex, setTrackIndex]         = useState(1)
  const [withTransition, setWithTransition] = useState(true)
  // interactionCount se incrementa en cada navegación manual para reiniciar
  // el autoplay y que no se superponga con la acción del usuario.
  const [interactionCount, setInteractionCount] = useState(0)
  const blockedRef    = useRef(false)
  const trackIndexRef = useRef(1)           // ref para el autoplay (sin stale closure)
  const t1Ref = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t2Ref = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { trackIndexRef.current = trackIndex }, [trackIndex])

  const n = imagenes.length
  // Índice real del slide visible (para dots, título y descripción)
  const realIndex =
    trackIndex === 0     ? n - 1 :
    trackIndex === n + 1 ? 0     :
    trackIndex - 1

  const snapIfClone = useCallback((nextTrack: number) => {
    if (nextTrack === 0) {
      setWithTransition(false)
      setTrackIndex(n)
      t2Ref.current = setTimeout(() => setWithTransition(true), 20)
    } else if (nextTrack === n + 1) {
      setWithTransition(false)
      setTrackIndex(1)
      t2Ref.current = setTimeout(() => setWithTransition(true), 20)
    }
  }, [n])

  const go = useCallback((nextTrack: number, isManual = false) => {
    if (blockedRef.current) return
    blockedRef.current = true
    setWithTransition(true)
    setTrackIndex(nextTrack)
    // Reiniciar el timer del autoplay cuando el usuario navega manualmente
    if (isManual) setInteractionCount(c => c + 1)
    t1Ref.current = setTimeout(() => {
      blockedRef.current = false
      snapIfClone(nextTrack)
    }, ANIM_MS + 50)
  }, [snapIfClone])

  useEffect(() => () => {
    if (t1Ref.current) clearTimeout(t1Ref.current)
    if (t2Ref.current) clearTimeout(t2Ref.current)
  }, [])

  const anterior = useCallback(() => go(trackIndexRef.current - 1, true), [go])
  const siguiente = useCallback(() => go(trackIndexRef.current + 1, true), [go])

  // Autoplay: se reinicia cuando el usuario interactúa (interactionCount)
  useEffect(() => {
    if (n <= 1) return
    const id = setInterval(
      () => go(trackIndexRef.current + 1),
      INTERVALO_MS
    )
    return () => clearInterval(id)
  }, [go, n, interactionCount])

  if (n === 0) return null

  const realSlides = [imagenes[n - 1], ...imagenes, imagenes[0]]

  const offset     = (100 - SLIDE_W) / 2
  const translateX = offset - trackIndex * SLIDE_W

  return (
    <section className="container mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-2xl text-foreground">Galería</h2>
        <Link href="/galeria" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Ver galería completa <ArrowRight size={14} />
        </Link>
      </div>

      <div className="relative">
        {/* Viewport */}
        <div className="overflow-hidden">
          {/* Track */}
          <div
            className="flex"
            style={{
              transform:  `translateX(${translateX}%)`,
              transition: withTransition ? `transform ${ANIM_MS}ms ease-in-out` : "none",
            }}
          >
            {realSlides.map((img, i) => {
              // Posición en el track determina el rol visual de cada slide.
              // slotReal solo se usa para mapear a imagen lógica (ya resuelto por realSlides[i]).
              const isCurrent = i === trackIndex
              const isPrev    = i === trackIndex - 1
              const isNext    = i === trackIndex + 1

              return (
                <div
                  key={i}
                  style={{ width: `${SLIDE_W}%`, flexShrink: 0 }}
                  className={cn(
                    "relative aspect-[16/9] rounded-xl overflow-hidden px-1.5",
                    "transition-all duration-[600ms] ease-in-out",
                    isCurrent && "scale-100 opacity-100 z-10",
                    isPrev    && "scale-50 opacity-50 translate-x-[50%]",
                    isNext    && "scale-50 opacity-50 -translate-x-[50%]",
                    !isCurrent && !isPrev && !isNext && "scale-50 opacity-0",
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
        {n > 1 && (
          <>
            <button type="button" onClick={anterior} aria-label="Imagen anterior"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-background/80 border shadow-sm hover:bg-background transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={siguiente} aria-label="Imagen siguiente"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-background/80 border shadow-sm hover:bg-background transition-colors">
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {(imagenes[realIndex].titulo || imagenes[realIndex].descripcion) && (
        <div className="text-center space-y-1 px-4">
          {imagenes[realIndex].titulo && <p className="font-medium text-foreground">{imagenes[realIndex].titulo}</p>}
          {imagenes[realIndex].descripcion && <p className="text-sm text-muted-foreground">{imagenes[realIndex].descripcion}</p>}
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5">
        {imagenes.map((_, i) => (
          <button key={i} type="button" onClick={() => go(i + 1)} aria-label={`Ir a imagen ${i + 1}`}
            className={cn(
              "rounded-full transition-all duration-300",
              i === realIndex ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            )}
          />
        ))}
      </div>
    </section>
  )
}
