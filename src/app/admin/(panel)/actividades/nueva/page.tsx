import { ActividadForm } from "@/components/admin/actividades/ActividadForm"

export const metadata = { title: "Nueva actividad — Admin" }

export default function NuevaActividadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-xl text-foreground">Nueva actividad</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Completá los datos para publicar una actividad.</p>
      </div>
      <ActividadForm />
    </div>
  )
}
