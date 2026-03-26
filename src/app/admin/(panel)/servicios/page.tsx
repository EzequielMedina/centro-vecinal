import Link from "next/link"
import { Plus } from "lucide-react"
import { getAllServiciosAdmin } from "@/lib/queries/servicios"
import { ServiciosAdminList } from "@/components/admin/servicios/ServiciosAdminList"

export const metadata = { title: "Servicios — Admin" }

export default async function ServiciosAdminPage() {
  const servicios = await getAllServiciosAdmin()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-xl text-foreground">Servicios</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {servicios.length} servicio{servicios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/servicios/nuevo"
          className="inline-flex items-center gap-2 h-8 px-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/80"
        >
          <Plus size={16} />
          Nuevo servicio
        </Link>
      </div>

      <ServiciosAdminList initialServicios={servicios} />
    </div>
  )
}
