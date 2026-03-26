import type { Metadata } from "next"
import { getContenidoInstitucional, getEquipoActivo } from "@/lib/queries/institucional"
import { SeccionInstitucional } from "@/components/sobre-nosotros/SeccionInstitucional"
import { EquipoGrid } from "@/components/sobre-nosotros/EquipoGrid"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Sobre Nosotros — Centro Vecinal Centro América",
  description: "Conocé la historia, misión, valores y el equipo directivo del Centro Vecinal Centro América.",
}

export default async function SobreNosotrosPage() {
  const [contenido, equipo] = await Promise.all([
    getContenidoInstitucional(),
    getEquipoActivo(),
  ])

  return (
    <main className="container max-w-3xl mx-auto px-4 py-12 space-y-12">
      <div>
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground">Sobre Nosotros</h1>
        <p className="text-muted-foreground mt-2">Conocé nuestra historia y quiénes somos.</p>
      </div>

      <SeccionInstitucional titulo="Nuestra Historia" contenido={contenido.historia.contenido} />
      <SeccionInstitucional titulo="Misión y Visión" contenido={contenido.mision.contenido} />
      <SeccionInstitucional titulo="Nuestros Valores" contenido={contenido.valores.contenido} />
      <EquipoGrid miembros={equipo} />
    </main>
  )
}
