import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

export type Actividad = Database["public"]["Tables"]["actividades"]["Row"]

export async function getActividades(categoria?: string): Promise<Actividad[]> {
  const supabase = await createClient()
  let query = supabase
    .from("actividades")
    .select("*")
    .eq("activa", true)
    .order("fecha_inicio", { ascending: true })

  if (categoria) query = query.eq("categoria", categoria)

  const { data, error } = await query

  if (error) {
    console.error("[getActividades]", error.message)
    throw new Error("Error al obtener las actividades")
  }
  return data
}

export async function getActividadBySlug(slug: string): Promise<Actividad | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("actividades")
    .select("*")
    .eq("slug", slug)
    .eq("activa", true)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("[getActividadBySlug]", error.message)
    throw new Error("Error al obtener la actividad")
  }
  return data
}

export async function getProximasActividades(): Promise<Actividad[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("actividades")
    .select("*")
    .eq("activa", true)
    .gte("fecha_inicio", new Date().toISOString())
    .order("fecha_inicio", { ascending: true })
    .limit(3)

  if (error) {
    console.error("[getProximasActividades]", error.message)
    throw new Error("Error al obtener las próximas actividades")
  }
  return data
}

export async function countActividadesProximas(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("actividades")
    .select("*", { count: "exact", head: true })
    .eq("activa", true)
    .gte("fecha_inicio", new Date().toISOString())
  if (error) {
    console.error("[countActividadesProximas]", error.message)
    throw new Error("Error al contar las próximas actividades")
  }
  return count ?? 0
}

export async function getAllActividadesAdmin(): Promise<Actividad[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("actividades")
    .select("*")
    .order("fecha_inicio", { ascending: true })

  if (error) {
    console.error("[getAllActividadesAdmin]", error.message)
    throw new Error("Error al obtener las actividades")
  }
  return data
}

export async function getActividadByIdAdmin(id: string): Promise<Actividad | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("actividades")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("[getActividadByIdAdmin]", error.message)
    throw new Error("Error al obtener la actividad")
  }
  return data
}
