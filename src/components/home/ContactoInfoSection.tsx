import { MapPin, Phone, Mail, Clock } from "lucide-react"

const MAPS_URL = "https://maps.google.com/?q=Centro+Vecinal+Centro+América+Córdoba"

export function ContactoInfoSection() {
  return (
    <section className="bg-muted/40 py-12">
      <div className="container mx-auto px-4 space-y-6">
        <h2 className="font-heading font-bold text-2xl text-foreground">¿Dónde encontrarnos?</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Dirección */}
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-5 rounded-xl border bg-card hover:shadow-sm transition-shadow group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Dirección</p>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Av. Centro América 1234, Córdoba
              </p>
            </div>
          </a>

          {/* Teléfono */}
          <a
            href="tel:+543511234567"
            className="flex items-start gap-4 p-5 rounded-xl border bg-card hover:shadow-sm transition-shadow group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Teléfono</p>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                (351) 123-4567
              </p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:info@centrovecinalcentroamerica.org.ar"
            className="flex items-start gap-4 p-5 rounded-xl border bg-card hover:shadow-sm transition-shadow group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors break-all">
                info@centrovecinalcentroamerica.org.ar
              </p>
            </div>
          </a>

          {/* Horarios */}
          <div className="flex items-start gap-4 p-5 rounded-xl border bg-card">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Horarios</p>
              <p className="text-sm text-foreground">Lun–Vie: 9 a 18 hs</p>
              <p className="text-sm text-foreground">Sáb: 9 a 13 hs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
