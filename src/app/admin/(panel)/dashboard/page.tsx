import type { Metadata } from "next"
import Link from "next/link"
import { Megaphone, CalendarDays, Mail, Users, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { countAvisosActivos } from "@/lib/queries/avisos"
import { countActividadesProximas } from "@/lib/queries/actividades"
import { countUnread } from "@/lib/queries/contacto"
import { countAdminUsers } from "@/lib/queries/usuarios"

export const metadata: Metadata = {
  title: "Dashboard — Panel Admin | Centro Vecinal Centro América",
}

const accesosRapidos = [
  {
    href: "/admin/avisos/nuevo",
    label: "Nuevo aviso",
    description: "Publicar una novedad para el barrio",
    icon: Megaphone,
    color: "text-primary",
  },
  {
    href: "/admin/actividades/nueva",
    label: "Nueva actividad",
    description: "Crear un evento o taller",
    icon: CalendarDays,
    color: "text-[#F59E0B]",
  },
  {
    href: "/admin/contacto",
    label: "Ver mensajes",
    description: "Revisar consultas de vecinos",
    icon: Mail,
    color: "text-[#D32F2F]",
  },
  {
    href: "/admin/galeria",
    label: "Gestionar galería",
    description: "Subir y organizar fotos",
    icon: Users,
    color: "text-[#6B8C7A]",
  },
]

export default async function DashboardPage() {
  const [avisosActivos, actividadesProximas, mensajesSinLeer, administradores] =
    await Promise.all([
      countAvisosActivos(),
      countActividadesProximas(),
      countUnread(),
      countAdminUsers(),
    ])

  const stats = [
    {
      label: "Avisos activos",
      value: avisosActivos,
      icon: Megaphone,
      color: "text-primary",
      href: "/admin/avisos",
    },
    {
      label: "Actividades próximas",
      value: actividadesProximas,
      icon: CalendarDays,
      color: "text-[#F59E0B]",
      href: "/admin/actividades",
    },
    {
      label: "Mensajes sin leer",
      value: mensajesSinLeer,
      icon: Mail,
      color: "text-[#D32F2F]",
      href: "/admin/contacto",
    },
    {
      label: "Administradores",
      value: administradores,
      icon: Users,
      color: "text-[#6B8C7A]",
      href: "/admin/usuarios",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Bienvenido</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Desde acá podés gestionar todo el contenido del sitio.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
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
          </Link>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div>
        <h3 className="font-heading font-semibold text-lg mb-3">Accesos rápidos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accesosRapidos.map(({ href, label, description, icon: Icon, color }) => (
            <Link key={href} href={href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="flex items-center gap-4 pt-5 pb-5">
                  <div className={`shrink-0 ${color}`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground truncate">{description}</p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
