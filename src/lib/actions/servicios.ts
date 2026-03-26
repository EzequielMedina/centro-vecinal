"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { ServicioSchema } from "@/lib/validations/servicios"

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

function revalidateAll() {
  revalidatePath("/")
  revalidatePath("/servicios")
  revalidatePath("/admin/servicios")
}

export async function createServicio(formData: FormData): Promise<ActionResult> {
  let supabase: Awaited<ReturnType<typeof requireAdmin>>
  try {
    supabase = await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const parsed = ServicioSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { error: first ?? "Datos inválidos" }
  }

  // La asignación de orden se delega a una función DB para garantizar
  // atomicidad y evitar duplicados ante inserciones concurrentes.
  const { error } = await supabase.rpc("insert_servicio_with_orden", {
    p_nombre: parsed.data.nombre,
    p_descripcion: parsed.data.descripcion,
    p_icono: parsed.data.icono,
    p_activo: parsed.data.activo,
  })

  if (error) {
    console.error("[createServicio]", error.message)
    return { error: "Error al crear el servicio" }
  }

  revalidateAll()
  return { success: true }
}

export async function updateServicio(id: string, formData: FormData): Promise<ActionResult> {
  let supabase: Awaited<ReturnType<typeof requireAdmin>>
  try {
    supabase = await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const parsed = ServicioSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { error: first ?? "Datos inválidos" }
  }

  const { error } = await supabase
    .from("servicios")
    .update(parsed.data)
    .eq("id", id)

  if (error) {
    console.error("[updateServicio]", error.message)
    return { error: "Error al actualizar el servicio" }
  }

  revalidateAll()
  return { success: true }
}

export async function deleteServicio(id: string): Promise<ActionResult> {
  let supabase: Awaited<ReturnType<typeof requireAdmin>>
  try {
    supabase = await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const { error } = await supabase
    .from("servicios")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[deleteServicio]", error.message)
    return { error: "Error al eliminar el servicio" }
  }

  revalidateAll()
  return { success: true }
}

export async function toggleActivo(id: string, activo: boolean): Promise<ActionResult> {
  let supabase: Awaited<ReturnType<typeof requireAdmin>>
  try {
    supabase = await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const { error } = await supabase
    .from("servicios")
    .update({ activo })
    .eq("id", id)

  if (error) {
    console.error("[toggleActivo]", error.message)
    return { error: "Error al actualizar el servicio" }
  }

  revalidateAll()
  return { success: true }
}

export async function updateOrden(ids: string[]): Promise<ActionResult> {
  let supabase: Awaited<ReturnType<typeof requireAdmin>>
  try {
    supabase = await requireAdmin()
  } catch {
    return { error: "No autorizado" }
  }

  const payload = ids.map((id, index) => ({ id, orden: index }))

  const { error } = await supabase
    .from("servicios")
    .upsert(payload, { onConflict: "id" })

  if (error) {
    console.error("[updateOrden servicios]", error.message)
    return { error: "Error al actualizar el orden" }
  }

  revalidateAll()
  return { success: true }
}
