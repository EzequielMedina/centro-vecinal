"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { ActividadSchema } from "@/lib/validations/actividades"
import { uniqueSlug } from "@/lib/utils/slugify"
import { sanitizeHtml } from "@/lib/utils/sanitize"

type ActionResult = { success: true } | { error: string }

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!adminRow) throw new Error("No autorizado")
  return { supabase, userId: user.id }
}

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  oldUrl?: string | null
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Tipo de archivo no permitido. Usá JPG, PNG o WebP.")
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("La imagen no puede superar los 5 MB.")
  }

  const ext = file.type.split("/")[1]
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from("actividades")
    .upload(filename, file, { contentType: file.type })

  if (error) throw new Error("Error al subir la imagen")

  if (oldUrl) {
    const path = oldUrl.split("/actividades/")[1]
    if (path) await supabase.storage.from("actividades").remove([path])
  }

  const { data } = supabase.storage.from("actividades").getPublicUrl(filename)
  return data.publicUrl
}

async function deleteStorageImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  url: string
) {
  const path = url.split("/actividades/")[1]
  if (path) await supabase.storage.from("actividades").remove([path])
}

export async function createActividad(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireAuth()

    const parsed = ActividadSchema.safeParse({
      titulo:       formData.get("titulo"),
      descripcion:  formData.get("descripcion"),
      fecha_inicio: formData.get("fecha_inicio"),
      fecha_fin:    formData.get("fecha_fin") || undefined,
      ubicacion:    formData.get("ubicacion") ?? "",
      capacidad:    formData.get("capacidad") ?? "",
      categoria:    formData.get("categoria"),
      activa:       formData.get("activa") === "true",
    })

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
        ?? parsed.error.flatten().formErrors[0]
      return { error: firstError ?? "Datos inválidos" }
    }

    const { titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad, categoria, activa } = parsed.data
    const slug = await uniqueSlug(titulo, supabase, undefined, "actividades")
    const descripcionSegura = sanitizeHtml(descripcion)

    let imagen_url: string | null = null
    const imageFile = formData.get("imagen") as File | null
    if (imageFile && imageFile.size > 0) {
      imagen_url = await uploadImage(supabase, imageFile)
    }

    const { error } = await supabase.from("actividades").insert({
      titulo,
      slug,
      descripcion: descripcionSegura,
      fecha_inicio,
      fecha_fin: fecha_fin || null,
      ubicacion,
      capacidad,
      categoria,
      imagen_url,
      activa,
      autor_id: userId,
    })

    if (error) {
      console.error("[createActividad]", error.message)
      return { error: "Error al guardar la actividad" }
    }

    revalidatePath("/actividades")
    revalidatePath("/admin/actividades")
    revalidatePath("/")
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[createActividad catch]", msg)
    if (msg === "No autorizado") return { error: msg }
    if (msg.includes("permitido") || msg.includes("superar") || msg.includes("subir")) return { error: msg }
    return { error: "Error al guardar la actividad" }
  }
}

export async function updateActividad(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAuth()

    const parsed = ActividadSchema.safeParse({
      titulo:       formData.get("titulo"),
      descripcion:  formData.get("descripcion"),
      fecha_inicio: formData.get("fecha_inicio"),
      fecha_fin:    formData.get("fecha_fin") || undefined,
      ubicacion:    formData.get("ubicacion") ?? "",
      capacidad:    formData.get("capacidad") ?? "",
      categoria:    formData.get("categoria"),
      activa:       formData.get("activa") === "true",
    })

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
        ?? parsed.error.flatten().formErrors[0]
      return { error: firstError ?? "Datos inválidos" }
    }

    const { titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad, categoria, activa } = parsed.data

    const { data: current } = await supabase
      .from("actividades")
      .select("titulo, slug, imagen_url")
      .eq("id", id)
      .single()

    if (!current) return { error: "Actividad no encontrada" }

    const slug = current.titulo === titulo
      ? current.slug
      : await uniqueSlug(titulo, supabase, id, "actividades")

    const descripcionSegura = sanitizeHtml(descripcion)

    let imagen_url = current.imagen_url
    const imageFile = formData.get("imagen") as File | null
    const removeImage = formData.get("remove_image") === "true"

    if (imageFile && imageFile.size > 0) {
      imagen_url = await uploadImage(supabase, imageFile, current.imagen_url)
    } else if (removeImage && current.imagen_url) {
      await deleteStorageImage(supabase, current.imagen_url)
      imagen_url = null
    }

    const { error } = await supabase
      .from("actividades")
      .update({ titulo, slug, descripcion: descripcionSegura, fecha_inicio, fecha_fin: fecha_fin || null, ubicacion, capacidad, categoria, imagen_url, activa })
      .eq("id", id)

    if (error) {
      console.error("[updateActividad]", error.message)
      return { error: "Error al actualizar la actividad" }
    }

    revalidatePath("/actividades")
    revalidatePath(`/actividades/${slug}`)
    // Invalidar slug anterior si cambió el título (evita que la ruta vieja sirva contenido cacheado)
    if (current.slug !== slug) revalidatePath(`/actividades/${current.slug}`)
    revalidatePath("/admin/actividades")
    revalidatePath("/")
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[updateActividad catch]", msg)
    if (msg === "No autorizado") return { error: msg }
    if (msg.includes("permitido") || msg.includes("superar") || msg.includes("subir")) return { error: msg }
    return { error: "Error al actualizar la actividad" }
  }
}

export async function deleteActividad(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAuth()

    const { data: actividad } = await supabase
      .from("actividades")
      .select("imagen_url, slug")
      .eq("id", id)
      .single()

    const { error } = await supabase.from("actividades").delete().eq("id", id)

    if (error) {
      console.error("[deleteActividad]", error.message)
      return { error: "Error al eliminar la actividad" }
    }

    if (actividad?.imagen_url) {
      await deleteStorageImage(supabase, actividad.imagen_url)
    }

    revalidatePath("/actividades")
    if (actividad?.slug) revalidatePath(`/actividades/${actividad.slug}`)
    revalidatePath("/admin/actividades")
    revalidatePath("/")
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg === "No autorizado") return { error: msg }
    return { error: "Error al eliminar la actividad" }
  }
}

export async function toggleActiva(id: string, activa: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireAuth()

    const { data: actividad } = await supabase
      .from("actividades")
      .select("slug")
      .eq("id", id)
      .single()

    const { error } = await supabase.from("actividades").update({ activa }).eq("id", id)

    if (error) {
      console.error("[toggleActiva]", error.message)
      return { error: "Error al actualizar la actividad" }
    }

    revalidatePath("/actividades")
    if (actividad?.slug) revalidatePath(`/actividades/${actividad.slug}`)
    revalidatePath("/admin/actividades")
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg === "No autorizado") return { error: msg }
    return { error: "Error al actualizar la actividad" }
  }
}
