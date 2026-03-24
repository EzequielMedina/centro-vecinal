import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #F59E0B 0%, transparent 60%), radial-gradient(circle at 10% 80%, #6B8C7A 0%, transparent 50%)" }}
      />

      <div className="relative container mx-auto px-4 py-16 sm:py-24 flex flex-col sm:flex-row items-center gap-8">
        {/* Logo */}
        <div className="shrink-0">
          <Image
            src="/logo.png"
            alt="Logo Centro Vecinal Centro América"
            width={140}
            height={140}
            className="rounded-full bg-white p-2 shadow-xl"
            priority
          />
        </div>

        {/* Texto */}
        <div className="text-center sm:text-left space-y-4 max-w-xl">
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Centro Vecinal<br />
            <span className="text-primary-foreground/80">Centro América</span>
          </h1>
          <p className="text-primary-foreground/75 text-lg">
            Tu espacio de encuentro, cultura y participación comunitaria en el barrio.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start pt-2">
            <Link
              href="/actividades"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-colors shadow-sm"
            >
              Ver actividades
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl border border-primary-foreground/30 text-primary-foreground font-semibold text-sm hover:bg-primary-foreground/10 transition-colors"
            >
              Contactanos
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
