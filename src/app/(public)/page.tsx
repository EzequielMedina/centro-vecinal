import type { Metadata } from "next"
import { getAvisosDestacados } from "@/lib/queries/avisos"
import { getProximasActividades } from "@/lib/queries/actividades"
import { getServiciosActivos } from "@/lib/queries/servicios"
import { HeroSection } from "@/components/home/HeroSection"
import { AvisosDestacadosSection } from "@/components/home/AvisosDestacadosSection"
import { ProximasActividadesSection } from "@/components/home/ProximasActividadesSection"
import { ServiciosResumenSection } from "@/components/home/ServiciosResumenSection"
import { SectionReveal } from "@/components/home/SectionReveal"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Centro Vecinal Centro América — Inicio",
  description:
    "Sitio oficial del Centro Vecinal Centro América. Actividades, avisos, servicios y más para los vecinos del barrio.",
  openGraph: {
    title: "Centro Vecinal Centro América",
    description: "Tu espacio de encuentro, cultura y participación comunitaria en el barrio.",
    url: "/",
    siteName: "Centro Vecinal Centro América",
    locale: "es_AR",
    type: "website",
  },
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
  url: "/",
}

export default async function HomePage() {
  const [avisos, actividades, servicios] = await Promise.all([
    getAvisosDestacados(),
    getProximasActividades(),
    getServiciosActivos(),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <HeroSection />
      <SectionReveal delay={0.1}>
        <AvisosDestacadosSection avisos={avisos} />
      </SectionReveal>
      <SectionReveal delay={0.1}>
        <ProximasActividadesSection actividades={actividades} />
      </SectionReveal>
      <SectionReveal delay={0.1}>
        <ServiciosResumenSection servicios={servicios} />
      </SectionReveal>
    </>
  )
}
