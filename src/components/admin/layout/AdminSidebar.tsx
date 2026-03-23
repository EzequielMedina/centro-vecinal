"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  ImageIcon,
  Wrench,
  Users,
  Info,
  Mail,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/avisos", label: "Avisos", icon: Megaphone },
  { href: "/admin/actividades", label: "Actividades", icon: CalendarDays },
  { href: "/admin/galeria", label: "Galería", icon: ImageIcon },
  { href: "/admin/servicios", label: "Servicios", icon: Wrench },
  { href: "/admin/sobre-nosotros", label: "Sobre Nosotros", icon: Info },
  { href: "/admin/contacto", label: "Contacto", icon: Mail },
]

const adminItems = [
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-primary text-primary-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-primary-foreground/10">
        <Image
          src="/logo.png"
          alt="Logo Centro Vecinal"
          width={36}
          height={36}
          className="rounded-full bg-white p-0.5"
        />
        <div className="leading-tight">
          <p className="font-heading font-semibold text-sm">Centro Vecinal</p>
          <p className="text-xs text-primary-foreground/70">Centro América</p>
        </div>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}

        <Separator className="my-3 bg-primary-foreground/10" />

        {adminItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-primary-foreground/10">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut size={17} />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  )
}
