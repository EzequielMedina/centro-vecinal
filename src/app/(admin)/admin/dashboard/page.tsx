import type { Metadata } from "next"
import { Megaphone, CalendarDays, Mail, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Dashboard — Panel Admin | Centro Vecinal Centro América",
}

// Placeholder hasta que estén implementados los módulos de avisos, actividades y contacto
const stats = [
  { label: "Avisos activos", value: "—", icon: Megaphone, color: "text-primary" },
  { label: "Actividades próximas", value: "—", icon: CalendarDays, color: "text-[#F59E0B]" },
  { label: "Mensajes sin leer", value: "—", icon: Mail, color: "text-[#D32F2F]" },
  { label: "Administradores", value: "—", icon: Users, color: "text-[#6B8C7A]" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Bienvenido</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Desde acá podés gestionar todo el contenido del sitio.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon size={18} className={color} />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground text-sm py-12">
          Los módulos de contenido se irán habilitando a medida que se implementen.
        </CardContent>
      </Card>
    </div>
  )
}
