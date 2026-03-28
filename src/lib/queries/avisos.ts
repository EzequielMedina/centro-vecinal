import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

export type Aviso = Database["public"]["Tables"]["avisos"]["Row"]

export async function getAvisos(): Promise<Aviso[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("avisos")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getAvisos]", error.message)
    throw new Error("Error al obtener los avisos")
  }
  return data
}

export async function getAvisoBySlug(slug: string): Promise<Aviso | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("avisos")
    .select("*")
    .eq("slug", slug)
    .eq("activo", true)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("[getAvisoBySlug]", error.message)
    throw new Error("Error al obtener el aviso")
  }
  return data
}

export async function getAvisosDestacados(): Promise<Aviso[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("avisos")
    .select("*")
    .eq("activo", true)
    .eq("destacado", true)
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
    console.error("[getAvisosDestacados]", error.message)
    throw new Error("Error al obtener los avisos destacados")
  }
  return data
}

export async function getAllAvisosAdmin(): Promise<Aviso[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("avisos")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getAllAvisosAdmin]", error.message)
    throw new Error("Error al obtener los avisos")
  }
  return data
}

export async function countAvisosActivos(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("avisos")
    .select("*", { count: "exact", head: true })
    .eq("activo", true)
  if (error) {
    console.error("[countAvisosActivos]", error.message)
    return 0
  }
  return count ?? 0
}

export async function getAvisoByIdAdmin(id: string): Promise<Aviso | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("avisos")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("[getAvisoByIdAdmin]", error.message)
    throw new Error("Error al obtener el aviso")
  }
  return data
}
