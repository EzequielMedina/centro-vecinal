import type { Metadata } from "next"
import { getImagenesGaleria, countImagenes } from "@/lib/queries/galeria"
import { GaleriaGrid } from "@/components/galeria/GaleriaGrid"
import { GaleriaPagination } from "@/components/galeria/GaleriaPagination"
import { EmptyStateCard } from "@/components/home/EmptyStateCard"

export const revalidate = 30

export const metadata: Metadata = {
  title: "Galería — Centro Vecinal Centro América",
  description: "Fotos de las actividades y eventos del Centro Vecinal Centro América.",
}

const PAGE_SIZE = 20

type Props = {
  searchParams: Promise<{ pagina?: string }>
}

export default async function GaleriaPage({ searchParams }: Props) {
  const { pagina: paginaParam } = await searchParams
  const pagina = Math.max(1, parseInt(paginaParam ?? "1", 10) || 1)

  const [imagenes, total] = await Promise.all([
    getImagenesGaleria(pagina, PAGE_SIZE),
    countImagenes(),
  ])

  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const paginaSegura = Math.min(pagina, totalPaginas)

  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <div>
        <h1 className="font-heading font-bold text-3xl text-foreground">Galería</h1>
        <p className="text-muted-foreground mt-1">Fotos de nuestras actividades y eventos</p>
      </div>

      {imagenes.length === 0 ? (
        <EmptyStateCard mensaje="Próximamente fotos de nuestras actividades." />
      ) : (
        <>
          <GaleriaGrid imagenes={imagenes} />
          <GaleriaPagination paginaActual={paginaSegura} totalPaginas={totalPaginas} />
        </>
      )}
    </main>
  )
}
