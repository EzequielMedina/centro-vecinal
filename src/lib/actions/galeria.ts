"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type ActionResult = { success: true } | { error: string }

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")
  return supabase
}

/**
 * Elimina una imagen de la galería: borra el registro en DB y el archivo en Storage.
 * Nunca deja archivos huérfanos: si el borrado en Storage falla se loguea pero
 * la operación se considera exitosa (el archivo quedará sin referencia y puede
 * limpiarse manualmente).
 */
export async function deleteImagen(id: string, url: string): Promise<ActionResult> {
  let supabase: Awaited<ReturnType<typeof requireAuth>>
  try {
    supabase = await requireAuth()
  } catch {
    return { error: "No autorizado" }
  }

  // Extraer el nombre del archivo desde la URL pública
  const filename = url.split("/").pop()

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
  if (filename) {
    const { error: storageError } = await supabase.storage
      .from("galeria")
      .remove([filename])

    if (storageError) {
      console.error("[deleteImagen] Storage error:", storageError.message)
      // No retornamos error — el registro ya fue borrado
    }
  }

  revalidatePath("/galeria")
  revalidatePath("/admin/galeria")
  return { success: true }
}

/**
 * Actualiza el campo `orden` de cada imagen según su posición en el array ids[].
 * ids[0] recibe orden=0, ids[1] orden=1, etc.
 */
export async function updateOrden(ids: string[]): Promise<ActionResult> {
  let supabase: Awaited<ReturnType<typeof requireAuth>>
  try {
    supabase = await requireAuth()
  } catch {
    return { error: "No autorizado" }
  }

  // UPDATE masivo: una operación por imagen
  const updates = ids.map((id, index) =>
    supabase.from("galeria").update({ orden: index }).eq("id", id)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) {
    console.error("[updateOrden] error:", failed.error.message)
    return { error: "Error al actualizar el orden" }
  }

  revalidatePath("/galeria")
  revalidatePath("/admin/galeria")
  return { success: true }
}
