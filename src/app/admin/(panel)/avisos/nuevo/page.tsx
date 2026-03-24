import { AvisoForm } from "@/components/admin/avisos/AvisoForm"

export const metadata = { title: "Nuevo aviso — Admin" }

export default function NuevoAvisoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-xl text-foreground">Nuevo aviso</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Completá los campos y publicá el aviso.
        </p>
      </div>

      <AvisoForm />
    </div>
  )
}
