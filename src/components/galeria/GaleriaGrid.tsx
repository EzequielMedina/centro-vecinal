"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import type { ImagenGaleria } from "@/lib/queries/galeria"

// Lightbox cargado solo cuando se abre (evita CSS extra en el bundle inicial)
const GaleriaLightbox = dynamic(() => import("./GaleriaLightbox").then((m) => m.GaleriaLightbox), {
  ssr: false,
})

type Props = {
  imagenes: ImagenGaleria[]
}

export function GaleriaGrid({ imagenes }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const slides = imagenes.map((img) => ({
    src: img.url,
    alt: img.titulo || "Imagen de galería",
  }))

  const handleOpen = useCallback((index: number) => setLightboxIndex(index), [])
  const handleClose = useCallback(() => setLightboxIndex(null), [])

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {imagenes.map((imagen, index) => (
          <button
            key={imagen.id}
            type="button"
            onClick={() => handleOpen(index)}
            className="relative aspect-square overflow-hidden rounded-lg bg-muted hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Abrir imagen${imagen.titulo ? `: ${imagen.titulo}` : ""}`}
          >
            <Image
              src={imagen.url}
              alt={imagen.titulo || "Imagen de galería"}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover hover:scale-105 transition-transform duration-300"
              unoptimized={process.env.NODE_ENV === "development"}
            />
            {imagen.titulo && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-3">
                <p className="text-xs text-white truncate">{imagen.titulo}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <GaleriaLightbox
          slides={slides}
          index={lightboxIndex}
          onClose={handleClose}
        />
      )}
    </>
  )
}
