import type { Metadata } from "next"
import { ContactoForm } from "@/components/contacto/ContactoForm"
import { ContactoInfo } from "@/components/contacto/ContactoInfo"
import { GoogleMapEmbed } from "@/components/contacto/GoogleMapEmbed"

export const metadata: Metadata = {
  title: "Contacto — Centro Vecinal Centro América",
  description: "Contactate con nosotros. Enviá tu consulta o visitanos en nuestra sede.",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Centro Vecinal Centro América",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Centro América 1234",
    addressLocality: "Córdoba",
    addressCountry: "AR",
  },
  telephone: "+543511234567",
  email: "info@centrovecinalcentroamerica.org.ar",
  openingHours: ["Mo-Fr 09:00-18:00", "Sa 09:00-13:00"],
}

export default function ContactoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground">Contacto</h1>
          <p className="mt-2 text-muted-foreground">
            ¿Tenés alguna consulta? Completá el formulario o acercate a nuestra sede.
          </p>
        </div>

        {/* Layout: 1 col mobile, 2 col desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Info + Mapa (primero en mobile) */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-heading font-semibold text-lg mb-5">Información</h2>
              <ContactoInfo />
            </div>
            <GoogleMapEmbed />
          </div>

          {/* Formulario */}
          <div className="order-2 lg:order-1">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-heading font-semibold text-lg mb-5">Envianos un mensaje</h2>
              <ContactoForm />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
