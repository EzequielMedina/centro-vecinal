import { AdminSidebar } from "@/components/admin/layout/AdminSidebar"
import { AdminNavbar } from "@/components/admin/layout/AdminNavbar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
