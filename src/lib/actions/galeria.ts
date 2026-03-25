"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type ActionResult = { success: true } | { error: string }

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!adminRow) throw new Error("No autorizado")
  return supabase
}

/**
 * Elimina una imagen de la galería: borra el registro en DB y, en lo posible, el archivo en Storage.
 * Primero elimina el registro en DB; luego intenta borrar el archivo en Storage. Si el borrado en
 * Storage falla, se loguea el error pero la operación se considera exitosa y el archivo quedará
 * sin referencia en la base de datos (podrá limpiarse manualmente más adelante).
 */
export async function deleteImagen(id: string, url: string): Promise<ActionResult> {
  let supabase: Awaited<ReturnType<typeof requireAdmin>>
  try {
    supabase = await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  // Extraer el path del archivo desde la URL pública (e.g. ".../galeria/uuid.webp" → "uuid.webp")
  const storagePath = url.split("/galeria/")[1]

  // 1. Eliminar de DB
  const { error: dbError } = await supabase
    .from("galeria")
    .delete()
    .eq("id", id)

  if (dbError) {
    console.error("[deleteImagen] DB error:", dbError.message)
    return { error: "Error al eliminar la imagen" }
  }

  // 2. Eliminar de Storage (no crítico para el retorno)
  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from("galeria")
      .remove([storagePath])

    if (storageError) {
      console.error("[deleteImagen] Storage error:", storageError.message)
    }
  }

  revalidatePath("/")
  revalidatePath("/galeria")
  revalidatePath("/admin/galeria")
  return { success: true }
}

/**
 * Actualiza el campo `orden` de cada imagen según su posición en el array ids[].
 * ids[0] recibe orden=0, ids[1] orden=1, etc.
 * Usa upsert para reducir roundtrips y mejorar la atomicidad.
 */
export async function updateOrden(ids: string[]): Promise<ActionResult> {
  let supabase: Awaited<ReturnType<typeof requireAdmin>>
  try {
    supabase = await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const payload = ids.map((id, index) => ({ id, orden: index }))

  const { error } = await supabase
    .from("galeria")
    .upsert(payload, { onConflict: "id" })

  if (error) {
    console.error("[updateOrden] error:", error.message)
    return { error: "Error al actualizar el orden" }
  }

  revalidatePath("/")
  revalidatePath("/galeria")
  revalidatePath("/admin/galeria")
  return { success: true }
}
