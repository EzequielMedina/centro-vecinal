import { notFound } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getMensajeById } from "@/lib/queries/contacto"
import { createClient } from "@/lib/supabase/server"
import { MensajeDetalleActions } from "@/components/admin/contacto/MensajeDetalleActions"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Detalle de Mensaje — Admin" }

type Props = { params: Promise<{ id: string }> }

export default async function MensajeDetallePage({ params }: Props) {
  const { id } = await params
  const mensaje = await getMensajeById(id)
  if (!mensaje) notFound()

  // Marcar como leído automáticamente al abrir.
  // Se hace directo (sin Server Action) porque revalidatePath no puede
  // llamarse durante el render de un Server Component.
  if (!mensaje.leido) {
    const supabase = await createClient()
    await supabase.from("contacto_mensajes").update({ leido: true }).eq("id", id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/contacto">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={15} className="mr-1.5" />
            Volver
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading font-semibold text-xl">{mensaje.asunto}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {format(new Date(mensaje.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
            </p>
          </div>
          <MensajeDetalleActions mensajeId={mensaje.id} nombreVecino={mensaje.nombre} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Nombre</p>
            <p className="font-medium">{mensaje.nombre}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
            <a href={`mailto:${mensaje.email}`} className="font-medium text-primary hover:underline">
              {mensaje.email}
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Mensaje</p>
          <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap">
            {mensaje.mensaje}
          </div>
        </div>
      </div>
    </div>
  )
}
