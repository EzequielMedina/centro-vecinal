"use client"

import { useState } from "react"
import { ImageUploadZone } from "./ImageUploadZone"
import { GaleriaAdminGrid } from "./GaleriaAdminGrid"
import type { ImagenGaleria } from "@/lib/queries/galeria"

type Props = {
  initialImagenes: ImagenGaleria[]
}

export function GaleriaAdminContainer({ initialImagenes }: Props) {
  const [imagenes, setImagenes] = useState(initialImagenes)

  const handleUploaded = (nuevas: ImagenGaleria[]) => {
    setImagenes((prev) => [...nuevas, ...prev])
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-heading font-semibold text-lg mb-4">Subir imágenes</h2>
        <ImageUploadZone onUploaded={handleUploaded} />
      </section>

      <section>
        <h2 className="font-heading font-semibold text-lg mb-4">
          Imágenes ({imagenes.length})
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            Arrastrá para reordenar
          </span>
        </h2>
        <GaleriaAdminGrid initialImagenes={imagenes} />
      </section>
    </div>
  )
}
