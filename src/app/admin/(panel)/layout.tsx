import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar"
import { AdminNavbar } from "@/components/admin/layout/AdminNavbar"
import { countUnread } from "@/lib/queries/contacto"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

  // Verificar que el usuario existe en admin_users (no solo en Auth)
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!adminUser) redirect("/admin/login")

  const nombre = user.user_metadata?.nombre ?? user.email ?? "Admin"
  const unreadCount = await countUnread()

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar unreadContacto={unreadCount} />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminNavbar nombre={nombre} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
