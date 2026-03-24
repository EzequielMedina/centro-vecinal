import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar"
import { AdminNavbar } from "@/components/admin/layout/AdminNavbar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Verificar que el usuario existe en admin_users (no solo en Auth)
  if (user) {
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .single()

    if (!adminUser) redirect("/admin/login")
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminNavbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
