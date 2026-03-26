"use server"

import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { SeccionSchema, MiembroSchema } from "@/lib/validations/institucional"
import { sanitizeHtml } from "@/lib/utils/sanitize"
import { isAllowedMimeType } from "@/lib/utils/imageProcessing"
import sharp from "sharp"

type ActionResult = { success: true } | { error: string }

const MAX_FOTO_BYTES = 2 * 1024 * 1024 // 2 MB

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

function revalidateAll() {
  revalidatePath("/")
  revalidatePath("/sobre-nosotros")
  revalidatePath("/admin/sobre-nosotros")
}

// ── Secciones de texto ────────────────────────────────────

export async function updateSeccion(seccion: string, contenido: string): Promise<ActionResult> {
  try {
    await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const parsed = SeccionSchema.safeParse({ seccion, contenido })
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { error: first ?? "Datos inválidos" }
  }

  const supabase = await createClient()
  const contenidoSeguro = sanitizeHtml(parsed.data.contenido)

  const { error } = await supabase
    .from("contenido_institucional")
    .update({ contenido: contenidoSeguro })
    .eq("seccion", parsed.data.seccion)

  if (error) {
    console.error("[updateSeccion]", error.message)
    return { error: "Error al guardar la sección" }
  }

  revalidateAll()
  return { success: true }
}

// ── Equipo ────────────────────────────────────────────────

async function uploadFoto(file: File): Promise<string> {
  if (!isAllowedMimeType(file.type)) {
    throw new Error("Tipo de archivo no permitido. Solo JPG, PNG y WebP.")
  }
  if (file.size > MAX_FOTO_BYTES) {
    throw new Error("La foto supera el límite de 2 MB.")
  }

  const arrayBuffer = await file.arrayBuffer()
  const processed = await sharp(Buffer.from(arrayBuffer))
    .resize(200, 200, { fit: "cover" })
    .webp({ quality: 85 })
    .toBuffer()

  const filename = `${randomUUID()}.webp`
  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase.storage
    .from("equipo")
    .upload(filename, processed, { contentType: "image/webp", cacheControl: "3600" })

  if (error) throw new Error("Error al subir la foto")

  const { data: { publicUrl } } = adminSupabase.storage.from("equipo").getPublicUrl(filename)
  return publicUrl
}

async function deleteFotoFromStorage(fotoUrl: string) {
  const path = fotoUrl.split("/equipo/")[1]
  if (!path) return
  const adminSupabase = createAdminClient()
  await adminSupabase.storage.from("equipo").remove([path])
}

export async function createMiembro(formData: FormData): Promise<ActionResult> {
  let supabase: Awaited<ReturnType<typeof requireAdmin>>
  try {
    supabase = await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const parsed = MiembroSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { error: first ?? "Datos inválidos" }
  }

  let foto_url: string | null = null
  const fotoFile = formData.get("foto")
  if (fotoFile instanceof File && fotoFile.size > 0) {
    try {
      foto_url = await uploadFoto(fotoFile)
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Error al subir la foto" }
    }
  }

  // orden = MAX(orden) + 1 — concurrencia aceptable (único admin por sesión)
  const { data: maxRow } = await supabase
    .from("equipo_miembros")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1)
    .single()

  const orden = (maxRow?.orden ?? -1) + 1

  const { error } = await supabase
    .from("equipo_miembros")
    .insert({ ...parsed.data, foto_url, orden })

  if (error) {
    console.error("[createMiembro]", error.message)
    if (foto_url) await deleteFotoFromStorage(foto_url)
    return { error: "Error al crear el miembro" }
  }

  revalidateAll()
  return { success: true }
}

export async function updateMiembro(id: string, formData: FormData): Promise<ActionResult> {
  let supabase: Awaited<ReturnType<typeof requireAdmin>>
  try {
    supabase = await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const parsed = MiembroSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { error: first ?? "Datos inválidos" }
  }

  const removeFoto = formData.get("remove_foto") === "true"
  let fotoUpdate: { foto_url: string | null } | undefined

  const fotoFile = formData.get("foto")
  if (fotoFile instanceof File && fotoFile.size > 0) {
    // Nueva foto: subir y eliminar la anterior
    const { data: existing } = await supabase
      .from("equipo_miembros")
      .select("foto_url")
      .eq("id", id)
      .single()

    let newUrl: string
    try {
      newUrl = await uploadFoto(fotoFile)
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Error al subir la foto" }
    }

    if (existing?.foto_url) await deleteFotoFromStorage(existing.foto_url)
    fotoUpdate = { foto_url: newUrl }
  } else if (removeFoto) {
    // Quitar foto existente: eliminar de Storage y setear null en DB
    const { data: existing } = await supabase
      .from("equipo_miembros")
      .select("foto_url")
      .eq("id", id)
      .single()

    if (existing?.foto_url) await deleteFotoFromStorage(existing.foto_url)
    fotoUpdate = { foto_url: null }
  }

  const { error } = await supabase
    .from("equipo_miembros")
    .update({ ...parsed.data, ...fotoUpdate })
    .eq("id", id)

  if (error) {
    console.error("[updateMiembro]", error.message)
    if (fotoUpdate?.foto_url) await deleteFotoFromStorage(fotoUpdate.foto_url)
    return { error: "Error al actualizar el miembro" }
  }

  revalidateAll()
  return { success: true }
}

export async function deleteMiembro(id: string): Promise<ActionResult> {
  let supabase: Awaited<ReturnType<typeof requireAdmin>>
  try {
    supabase = await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const { data: existing } = await supabase
    .from("equipo_miembros")
    .select("foto_url")
    .eq("id", id)
    .single()

  const { error } = await supabase
    .from("equipo_miembros")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[deleteMiembro]", error.message)
    return { error: "Error al eliminar el miembro" }
  }

  if (existing?.foto_url) {
    await deleteFotoFromStorage(existing.foto_url)
  }

  revalidateAll()
  return { success: true }
}

export async function toggleActivoMiembro(id: string, activo: boolean): Promise<ActionResult> {
  try {
    await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("equipo_miembros")
    .update({ activo })
    .eq("id", id)

  if (error) {
    console.error("[toggleActivoMiembro]", error.message)
    return { error: "Error al actualizar el miembro" }
  }

  revalidateAll()
  return { success: true }
}

export async function updateOrdenEquipo(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const supabase = await createClient()
  const payload = ids.map((id, index) => ({ id, orden: index }))

  const { error } = await supabase
    .from("equipo_miembros")
    .upsert(payload, { onConflict: "id" })

  if (error) {
    console.error("[updateOrdenEquipo]", error.message)
    return { error: "Error al actualizar el orden" }
  }

  revalidateAll()
  return { success: true }
}
