"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { CreateAdminSchema } from "@/lib/validations/usuarios"

type ActionResult = { success: true } | { error: string }

async function requireSuperAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("No autorizado")

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("rol")
    .eq("id", user.id)
    .single()

  if (adminUser?.rol !== "superadmin") throw new Error("Acceso denegado")

  return { supabase, currentUserId: user.id }
}

export async function createAdmin(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireSuperAdmin()

    const parsed = CreateAdminSchema.safeParse({
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      password: formData.get("password"),
      rol: formData.get("rol"),
    })

    if (!parsed.success) {
      const firstError = Object.values(
        parsed.error.flatten().fieldErrors
      )[0]?.[0]
      return { error: firstError ?? "Datos inválidos" }
    }

    const { nombre, email, password, rol } = parsed.data

    const supabaseAdmin = createAdminClient()
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nombre },
      })

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        return { error: "Ya existe un usuario con ese email" }
      }
      console.error("[createAdmin] auth error:", authError.message)
      return { error: "Error al crear el usuario" }
    }

    const { error: dbError } = await supabase.from("admin_users").insert({
      id: authData.user.id,
      email,
      nombre,
      rol,
    })

    if (dbError) {
      // Rollback: eliminar de Auth si falla el INSERT
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      console.error("[createAdmin] db error:", dbError.message)
      return { error: "Error al crear el usuario" }
    }

    revalidatePath("/admin/usuarios")
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ""
    if (msg === "No autorizado" || msg === "Acceso denegado") {
      return { error: msg }
    }
    return { error: "Error al crear el usuario" }
  }
}

export async function deleteAdmin(id: string): Promise<ActionResult> {
  try {
    const { supabase, currentUserId } = await requireSuperAdmin()

    if (id === currentUserId) {
      return { error: "No podés eliminarte a vos mismo" }
    }

    const { error: dbError } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", id)

    if (dbError) {
      console.error("[deleteAdmin] db error:", dbError.message)
      return { error: "Error al eliminar el usuario" }
    }

    const supabaseAdmin = createAdminClient()
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (authError) {
      console.error("[deleteAdmin] auth error:", authError.message)
    }

    revalidatePath("/admin/usuarios")
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ""
    if (msg === "No autorizado" || msg === "Acceso denegado") {
      return { error: msg }
    }
    return { error: "Error al eliminar el usuario" }
  }
}
