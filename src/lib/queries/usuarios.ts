import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

export type AdminUser =
  Database["public"]["Tables"]["admin_users"]["Row"]

export async function countAdminUsers(): Promise<number> {
  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from("admin_users")
    .select("*", { count: "exact", head: true })
  if (error) {
    console.error("[countAdminUsers]", error.message)
    throw new Error("Error al contar usuarios admin")
  }
  return count ?? 0
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  // Usa service_role para bypassear RLS y ver todos los usuarios
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[getAdminUsers]", error.message)
    throw new Error("Error al obtener los usuarios")
  }

  return data
}

export async function getAdminUserById(
  id: string
): Promise<AdminUser | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("[getAdminUserById]", error.message)
    throw new Error("Error al obtener el usuario")
  }

  return data
}
