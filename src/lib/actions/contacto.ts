"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ContactoSchema } from "@/lib/validations/contacto"
import { checkRateLimit } from "@/lib/utils/rateLimit"
import { NotificacionContactoEmail } from "@/lib/email/notificacion-contacto"
import { Resend } from "resend"

type ActionResult = { success: true } | { error: string }

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")
  const { data: adminRow } = await supabase
    .from("admin_users").select("id").eq("id", user.id).single()
  if (!adminRow) throw new Error("No autorizado")
  return supabase
}

export async function enviarMensaje(formData: FormData): Promise<ActionResult> {
  const parsed = ContactoSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { error: first ?? "Datos inválidos" }
  }

  // Obtener IP del request
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  // Rate limiting
  const { allowed } = await checkRateLimit(ip)
  if (!allowed) {
    return { error: "Demasiados intentos. Intentá de nuevo en 10 minutos." }
  }

  // INSERT con service_role: la policy pública fue reemplazada por una
  // de service_role para evitar que se bypass-ee el rate limiting vía anon key.
  const adminSupabase = createAdminClient()
  const { data: inserted, error } = await adminSupabase
    .from("contacto_mensajes")
    .insert({ ...parsed.data, ip })
    .select("id")
    .single()

  if (error) {
    console.error("[enviarMensaje]", error.message)
    return { error: "Hubo un error al enviar el mensaje. Intentá de nuevo." }
  }

  // Email de notificación — fallo no bloquea la respuesta al vecino
  try {
    const apiKey = process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM
    const emailTo = process.env.EMAIL_TO

    if (apiKey && emailFrom && emailTo) {
      const resend = new Resend(apiKey)
      await resend.emails.send({
        from: emailFrom,
        to: emailTo,
        subject: `Nuevo mensaje: ${parsed.data.asunto}`,
        react: NotificacionContactoEmail({
          nombre:    parsed.data.nombre,
          email:     parsed.data.email,
          asunto:    parsed.data.asunto,
          mensaje:   parsed.data.mensaje,
          mensajeId: inserted.id,
        }),
      })
    }
  } catch (emailError) {
    console.error("[enviarMensaje] Error al enviar email de notificación:", emailError)
  }

  return { success: true }
}

export async function marcarLeido(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("contacto_mensajes")
    .update({ leido: true })
    .eq("id", id)

  if (error) {
    console.error("[marcarLeido]", error.message)
    return { error: "Error al marcar el mensaje" }
  }

  revalidatePath("/admin/contacto")
  return { success: true }
}

export async function deleteMensaje(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("contacto_mensajes")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[deleteMensaje]", error.message)
    return { error: "Error al eliminar el mensaje" }
  }

  revalidatePath("/admin/contacto")
  revalidatePath("/admin/dashboard")
  return { success: true }
}
