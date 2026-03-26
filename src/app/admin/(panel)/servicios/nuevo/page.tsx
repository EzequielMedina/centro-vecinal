import { ServicioForm } from "@/components/admin/servicios/ServicioForm"

export const metadata = { title: "Nuevo servicio — Admin" }

export default function NuevoServicioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-xl text-foreground">Nuevo servicio</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Completá los datos del servicio</p>
      </div>
      <ServicioForm />
    </div>
  )
}
