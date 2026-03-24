import type { Metadata } from "next"
import { getAvisos } from "@/lib/queries/avisos"
import { AvisosGrid } from "@/components/avisos/AvisosGrid"

export const revalidate = 30

export const metadata: Metadata = {
  title: "Avisos | Centro Vecinal Centro América",
  description: "Novedades, comunicados y avisos importantes del Centro Vecinal Centro América.",
}

export default async function AvisosPage() {
  const avisos = await getAvisos()

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-primary">Avisos</h1>
        <p className="text-muted-foreground mt-2">
          Novedades y comunicados del barrio.
        </p>
      </div>
      <AvisosGrid avisos={avisos} />
    </main>
  )
}
