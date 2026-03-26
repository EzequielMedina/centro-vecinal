import { getMensajes } from "@/lib/queries/contacto"
import { MensajesTable } from "@/components/admin/contacto/MensajesTable"

export const metadata = { title: "Mensajes de Contacto — Admin" }

export default async function ContactoAdminPage() {
  const { mensajes, total } = await getMensajes()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-xl text-foreground">Mensajes de Contacto</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{total} mensaje{total !== 1 ? "s" : ""} en total</p>
      </div>

      <MensajesTable mensajes={mensajes} />
    </div>
  )
}
