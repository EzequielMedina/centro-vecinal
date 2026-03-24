"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { AvisoCreateSchema, AvisoUpdateSchema } from "@/lib/validations/avisos"
import { uniqueSlug } from "@/lib/utils/slugify"
import { sanitizeHtml } from "@/lib/utils/sanitize"

type ActionResult = { success: true } | { error: string }

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")
  return { supabase, userId: user.id }
}

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  oldUrl?: string | null
): Promise<string> {
  // Validar en servidor (el cliente puede mentir)
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Tipo de archivo no permitido. Usá JPG, PNG o WebP.")
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("La imagen no puede superar los 5 MB.")
  }

  // Eliminar imagen anterior si existía
  if (oldUrl) {
    const path = oldUrl.split("/avisos/")[1]
    if (path) await supabase.storage.from("avisos").remove([path])
  }

  const ext = file.type.split("/")[1]
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from("avisos")
    .upload(filename, file, { contentType: file.type })

  if (error) throw new Error("Error al subir la imagen")

  const { data } = supabase.storage.from("avisos").getPublicUrl(filename)
  return data.publicUrl
}

async function checkMaxDestacados(
  supabase: Awaited<ReturnType<typeof createClient>>,
  excludeId?: string
): Promise<boolean> {
  const query = supabase
    .from("avisos")
    .select("id", { count: "exact" })
    .eq("destacado", true)
    .eq("activo", true)

  if (excludeId) query.neq("id", excludeId)

  const { count } = await query
  return (count ?? 0) < 3
}

export async function createAviso(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAuth()

    const parsed = AvisoCreateSchema.safeParse({
      titulo: formData.get("titulo"),
      contenido: formData.get("contenido"),
      destacado: formData.get("destacado") === "true",
      activo: formData.get("activo") === "true",
      imagen_url: formData.get("imagen_url") ?? "",
    })

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
      return { error: firstError ?? "Datos inválidos" }
    }

    const { titulo, contenido, destacado, activo } = parsed.data

    if (destacado) {
      const canDestacado = await checkMaxDestacados(supabase)
      if (!canDestacado) {
        return { error: "Ya hay 3 avisos destacados activos. Desactivá uno antes de destacar otro." }
      }
    }

    const slug = await uniqueSlug(titulo, supabase)
    const contenidoSeguro = sanitizeHtml(contenido)

    let imagen_url: string | null = null
    const imageFile = formData.get("imagen") as File | null
    if (imageFile && imageFile.size > 0) {
      imagen_url = await uploadImage(supabase, imageFile)
    }

    const { error } = await supabase.from("avisos").insert({
      titulo,
      slug,
      contenido: contenidoSeguro,
      imagen_url,
      destacado,
      activo,
    })

    if (error) {
      console.error("[createAviso]", error.message)
      return { error: "Error al guardar el aviso" }
    }

    revalidatePath("/avisos")
    revalidatePath("/admin/avisos")
    revalidatePath("/")
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ""
    if (msg === "No autorizado") return { error: msg }
    if (msg.includes("permitido") || msg.includes("superar")) return { error: msg }
    return { error: "Error al guardar el aviso" }
  }
}

export async function updateAviso(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAuth()

    const parsed = AvisoUpdateSchema.safeParse({
      titulo: formData.get("titulo"),
      contenido: formData.get("contenido"),
      destacado: formData.get("destacado") === "true",
      activo: formData.get("activo") === "true",
      imagen_url: formData.get("imagen_url") ?? "",
    })

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
      return { error: firstError ?? "Datos inválidos" }
    }

    const { titulo, contenido, destacado, activo } = parsed.data

    if (destacado) {
      const canDestacado = await checkMaxDestacados(supabase, id)
      if (!canDestacado) {
        return { error: "Ya hay 3 avisos destacados activos. Desactivá uno antes de destacar otro." }
      }
    }

    // Obtener el aviso actual para comparar título y obtener imagen_url vieja
    const { data: current } = await supabase
      .from("avisos")
      .select("titulo, slug, imagen_url")
      .eq("id", id)
      .single()

    if (!current) return { error: "Aviso no encontrado" }

    // Regenerar slug solo si cambió el título
    const slug =
      current.titulo === titulo
        ? current.slug
        : await uniqueSlug(titulo, supabase, id)

    const contenidoSeguro = sanitizeHtml(contenido)

    let imagen_url = current.imagen_url
    const imageFile = formData.get("imagen") as File | null
    if (imageFile && imageFile.size > 0) {
      imagen_url = await uploadImage(supabase, imageFile, current.imagen_url)
    }

    const { error } = await supabase
      .from("avisos")
      .update({ titulo, slug, contenido: contenidoSeguro, imagen_url, destacado, activo })
      .eq("id", id)

    if (error) {
      console.error("[updateAviso]", error.message)
      return { error: "Error al actualizar el aviso" }
    }

    revalidatePath("/avisos")
    revalidatePath(`/avisos/${slug}`)
    revalidatePath("/admin/avisos")
    revalidatePath("/")
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ""
    if (msg === "No autorizado") return { error: msg }
    if (msg.includes("permitido") || msg.includes("superar")) return { error: msg }
    return { error: "Error al actualizar el aviso" }
  }
}

export async function deleteAviso(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAuth()

    const { data: aviso } = await supabase
      .from("avisos")
      .select("imagen_url, slug")
      .eq("id", id)
      .single()

    const { error } = await supabase.from("avisos").delete().eq("id", id)

    if (error) {
      console.error("[deleteAviso]", error.message)
      return { error: "Error al eliminar el aviso" }
    }

    // Eliminar imagen de Storage si existía
    if (aviso?.imagen_url) {
      const path = aviso.imagen_url.split("/avisos/")[1]
      if (path) await supabase.storage.from("avisos").remove([path])
    }

    revalidatePath("/avisos")
    revalidatePath("/admin/avisos")
    revalidatePath("/")
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ""
    if (msg === "No autorizado") return { error: msg }
    return { error: "Error al eliminar el aviso" }
  }
}

export async function toggleActivo(
  id: string,
  activo: boolean
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAuth()

    const { error } = await supabase
      .from("avisos")
      .update({ activo })
      .eq("id", id)

    if (error) {
      console.error("[toggleActivo]", error.message)
      return { error: "Error al actualizar el aviso" }
    }

    revalidatePath("/avisos")
    revalidatePath("/admin/avisos")
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ""
    if (msg === "No autorizado") return { error: msg }
    return { error: "Error al actualizar el aviso" }
  }
}
