import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { NuevoAdminForm } from "@/components/admin/usuarios/NuevoAdminForm"

export default async function NuevoUsuarioPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return notFound()

  const { data: currentAdmin } = await supabase
    .from("admin_users")
    .select("rol")
    .eq("id", user.id)
    .single()

  if (currentAdmin?.rol !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-lg font-semibold text-foreground">Acceso denegado</p>
        <p className="text-sm text-muted-foreground">
          Solo los superadmin pueden crear usuarios.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/usuarios"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={15} />
          Volver a usuarios
        </Link>
        <h2 className="font-heading font-semibold text-xl text-foreground">
          Nuevo usuario administrador
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          El usuario recibirá acceso inmediato al panel.
        </p>
      </div>

      <NuevoAdminForm />
    </div>
  )
}
