import { Suspense } from "react"
import Image from "next/image"
import type { Metadata } from "next"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LoginForm } from "@/components/admin/auth/LoginForm"

export const metadata: Metadata = {
  title: "Ingresar — Panel Admin | Centro Vecinal Centro América",
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-sm">
        {/* Logo + nombre */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Image
            src="/logo.png"
            alt="Logo Centro Vecinal Centro América"
            width={96}
            height={96}
            priority
            className="mb-4 drop-shadow-sm"
          />
          <h1 className="font-heading text-2xl font-bold text-primary leading-tight">
            Centro Vecinal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Centro América</p>
        </div>

        {/* Card de login */}
        <Card className="shadow-lg border-border/50">
          <CardHeader className="pb-4">
            <h2 className="font-heading text-lg font-semibold text-center">
              Panel de Administración
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Ingresá con tu cuenta para continuar
            </p>
          </CardHeader>
          <CardContent>
            {/* Suspense requerido por useSearchParams */}
            <Suspense>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          ¿Problemas para ingresar? Contactá al administrador del sistema.
        </p>
      </div>
    </main>
  )
}
