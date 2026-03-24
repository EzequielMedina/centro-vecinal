import Link from "next/link"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

const MAPS_URL = "https://maps.google.com/?q=Centro+Vecinal+Centro+América+Córdoba"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Identidad */}
          <div className="space-y-2">
            <h3 className="font-heading font-semibold text-base">Centro Vecinal Centro América</h3>
            <p className="text-sm text-primary-foreground/70">
              Tu espacio vecinal de encuentro, cultura y participación comunitaria.
            </p>
          </div>

          {/* Contacto */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wide text-primary-foreground/70">
              Contacto
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  <MapPin size={15} className="mt-0.5 shrink-0" />
                  Av. Centro América 1234, Córdoba
                </a>
              </li>
              <li>
                <a
                  href="tel:+543511234567"
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  <Phone size={15} className="shrink-0" />
                  (351) 123-4567
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@centrovecinalcentroamerica.org.ar"
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  <Mail size={15} className="shrink-0" />
                  info@centrovecinalcentroamerica.org.ar
                </a>
              </li>
            </ul>
          </div>

          {/* Horarios */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wide text-primary-foreground/70">
              Horarios
            </h4>
            <ul className="space-y-1.5 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-2">
                <Clock size={15} className="mt-0.5 shrink-0" />
                <div>
                  <p>Lunes a Viernes</p>
                  <p className="text-primary-foreground/60">9:00 – 18:00 hs</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={15} className="mt-0.5 shrink-0" />
                <div>
                  <p>Sábados</p>
                  <p className="text-primary-foreground/60">9:00 – 13:00 hs</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Centro Vecinal Centro América. Todos los derechos reservados.</p>
          <Link href="/admin/login" className="hover:text-primary-foreground/70 transition-colors">
            Acceso administradores
          </Link>
        </div>
      </div>
    </footer>
  )
}
