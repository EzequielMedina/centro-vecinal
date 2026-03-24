import Link from "next/link"
import { Plus } from "lucide-react"
import { getAllActividadesAdmin } from "@/lib/queries/actividades"
import { ActividadesAdminTable } from "@/components/admin/actividades/ActividadesAdminTable"

export const metadata = { title: "Actividades — Admin" }

export default async function ActividadesAdminPage() {
  const actividades = await getAllActividadesAdmin()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-xl text-foreground">Actividades</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {actividades.length} actividad{actividades.length !== 1 ? "es" : ""}
          </p>
        </div>
        <Link
          href="/admin/actividades/nueva"
          className="inline-flex items-center gap-2 h-8 px-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/80"
        >
          <Plus size={16} />
          Nueva actividad
        </Link>
      </div>

      <ActividadesAdminTable actividades={actividades} />
    </div>
  )
}
