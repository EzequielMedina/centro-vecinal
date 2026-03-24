import Link from "next/link"
import { Plus } from "lucide-react"
import { getAllAvisosAdmin } from "@/lib/queries/avisos"
import { AvisosAdminTable } from "@/components/admin/avisos/AvisosAdminTable"

export const metadata = { title: "Avisos — Admin" }

export default async function AvisosAdminPage() {
  const avisos = await getAllAvisosAdmin()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-xl text-foreground">Avisos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {avisos.length} aviso{avisos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/avisos/nuevo"
          className="inline-flex items-center gap-2 h-8 px-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/80"
        >
          <Plus size={16} />
          Nuevo aviso
        </Link>
      </div>

      <AvisosAdminTable avisos={avisos} />
    </div>
  )
}
