import { redirect } from "next/navigation"
import Link from "next/link"
import { UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getAdminUsers } from "@/lib/queries/usuarios"
import { UsuariosTable } from "@/components/admin/usuarios/UsuariosTable"

export default async function UsuariosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

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
          Solo los superadmin pueden gestionar usuarios.
        </p>
      </div>
    )
  }

  const usuarios = await getAdminUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-xl text-foreground">
            Usuarios administradores
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          className="inline-flex items-center gap-2 h-8 px-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/80"
        >
          <UserPlus size={16} />
          Nuevo usuario
        </Link>
      </div>

      <UsuariosTable usuarios={usuarios} currentUserId={user.id} />
    </div>
  )
}
