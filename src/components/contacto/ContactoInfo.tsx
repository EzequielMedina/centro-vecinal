import { MapPin, Clock, Phone, Mail } from "lucide-react"

const CONTACTO = {
  direccion: "Av. Centro América 1234, Córdoba",
  mapsUrl: "https://maps.google.com/?q=Centro+Vecinal+Centro+América+Córdoba",
  telefono: "(351) 123-4567",
  telefonoTel: "+543511234567",
  email: "info@centrovecinalcentroamerica.org.ar",
  horarios: [
    { dias: "Lunes a Viernes", horas: "9:00 – 18:00 hs" },
    { dias: "Sábados", horas: "9:00 – 13:00 hs" },
  ],
}

export function ContactoInfo() {
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Dirección</p>
          <a
            href={CONTACTO.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {CONTACTO.direccion}
          </a>
        </div>
      </div>

      <div className="flex gap-3">
        <Phone size={18} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Teléfono</p>
          <a
            href={`tel:${CONTACTO.telefonoTel}`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {CONTACTO.telefono}
          </a>
        </div>
      </div>

      <div className="flex gap-3">
        <Mail size={18} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Email</p>
          <a
            href={`mailto:${CONTACTO.email}`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {CONTACTO.email}
          </a>
        </div>
      </div>

      <div className="flex gap-3">
        <Clock size={18} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Horarios de atención</p>
          <div className="space-y-0.5 mt-0.5">
            {CONTACTO.horarios.map(({ dias, horas }) => (
              <p key={dias} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{dias}:</span> {horas}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
