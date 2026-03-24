import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith("/admin")
  const isLoginRoute = pathname === "/admin/login"

  // Ruta admin sin sesión → redirigir al login guardando la URL original (con querystring)
  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/admin/login"
    const destination = pathname + request.nextUrl.search
    loginUrl.searchParams.set("redirect", destination)
    return NextResponse.redirect(loginUrl)
  }

  // No redirigir automáticamente desde /admin/login si hay sesión:
  // el layout del panel ya verifica membresía en admin_users y maneja la redirección,
  // evitando un loop si el usuario existe en Auth pero no en admin_users.

  return supabaseResponse
}

export const config = {
  // Solo ejecutar el middleware en rutas del panel admin
  matcher: ["/admin/:path*"],
}
