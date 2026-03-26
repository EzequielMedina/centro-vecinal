import { getContenidoInstitucional, getAllEquipoAdmin } from "@/lib/queries/institucional"
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import { EditorSeccion } from "@/components/admin/sobre-nosotros/EditorSeccion"
import { EquipoAdminList } from "@/components/admin/sobre-nosotros/EquipoAdminList"

export const metadata = { title: "Sobre Nosotros — Admin" }

export default async function SobreNosotrosAdminPage() {
  const [contenido, equipo] = await Promise.all([
    getContenidoInstitucional(),
    getAllEquipoAdmin(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading font-semibold text-xl text-foreground">Sobre Nosotros</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Editá el contenido institucional y el equipo directivo</p>
      </div>

      {/* Secciones de texto */}
      <Tabs defaultValue="historia">
        <TabsList>
          <TabsTrigger value="historia">Historia</TabsTrigger>
          <TabsTrigger value="mision">Misión y Visión</TabsTrigger>
          <TabsTrigger value="valores">Valores</TabsTrigger>
        </TabsList>

        <TabsContent value="historia" className="mt-4">
          <EditorSeccion
            seccion="historia"
            contenidoInicial={contenido.historia.contenido}
            updatedAt={contenido.historia.updated_at}
          />
        </TabsContent>

        <TabsContent value="mision" className="mt-4">
          <EditorSeccion
            seccion="mision"
            contenidoInicial={contenido.mision.contenido}
            updatedAt={contenido.mision.updated_at}
          />
        </TabsContent>

        <TabsContent value="valores" className="mt-4">
          <EditorSeccion
            seccion="valores"
            contenidoInicial={contenido.valores.contenido}
            updatedAt={contenido.valores.updated_at}
          />
        </TabsContent>
      </Tabs>

      {/* Equipo directivo */}
      <div className="space-y-4">
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground">Equipo Directivo</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Arrastrá para reordenar</p>
        </div>
        <EquipoAdminList initialMiembros={equipo} />
      </div>
    </div>
  )
}
