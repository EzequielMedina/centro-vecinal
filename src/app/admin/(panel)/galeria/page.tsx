import { getImagenesGaleria } from "@/lib/queries/galeria"
import { GaleriaAdminContainer } from "@/components/admin/galeria/GaleriaAdminContainer"

export const metadata = { title: "Galería — Admin" }

export default async function GaleriaAdminPage() {
  const imagenes = await getImagenesGaleria(1, 200)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-xl text-foreground">Galería</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gestioná las imágenes públicas del centro vecinal
        </p>
      </div>

      <GaleriaAdminContainer initialImagenes={imagenes} />
    </div>
  )
}
