import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

export type ContactoMensaje = Database["public"]["Tables"]["contacto_mensajes"]["Row"]

const PAGE_SIZE = 20

export async function getMensajes(page = 1): Promise<{ mensajes: ContactoMensaje[]; total: number }> {
  const supabase = await createClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error, count } = await supabase
    .from("contacto_mensajes")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("[getMensajes]", error.message)
    throw new Error("Error al obtener los mensajes")
  }

  return { mensajes: data, total: count ?? 0 }
}

export async function getMensajeById(id: string): Promise<ContactoMensaje | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("contacto_mensajes")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("[getMensajeById]", error.message)
    throw new Error("Error al obtener el mensaje")
  }
  return data
}

export async function countUnread(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("contacto_mensajes")
    .select("*", { count: "exact", head: true })
    .eq("leido", false)

  if (error) {
    console.error("[countUnread]", error.message)
    return 0
  }
  return count ?? 0
}
