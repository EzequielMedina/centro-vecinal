import { Suspense } from "react"
import { getActividades } from "@/lib/queries/actividades"
import { ActividadesGrid } from "@/components/actividades/ActividadesGrid"
import { FiltrosCategorias } from "@/components/actividades/FiltrosCategorias"
import { CATEGORIAS } from "@/lib/utils/categorias"

export const revalidate = 30

type Props = {
  searchParams: Promise<{ categoria?: string }>
}

export async function generateMetadata({ searchParams }: Props) {
  const { categoria } = await searchParams
  const cat = CATEGORIAS.find((c) => c.value === categoria)
  return {
    title: cat ? `Actividades — ${cat.label}` : "Actividades",
    description: "Conocé todas las actividades del Centro Vecinal Centro América.",
  }
}

export default async function ActividadesPage({ searchParams }: Props) {
  const { categoria } = await searchParams
  const actividades = await getActividades(categoria)

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Actividades</h1>
        <p className="text-muted-foreground mt-1">
          Talleres, deportes, cultura y más para toda la comunidad.
        </p>
      </div>

      <Suspense>
        <FiltrosCategorias />
      </Suspense>

      <ActividadesGrid
        actividades={actividades}
        mensajeVacio={categoria ? "No hay actividades en esta categoría." : "No hay actividades disponibles."}
      />
    </div>
  )
}
