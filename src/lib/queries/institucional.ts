import { createClient } from "@/lib/supabase/server"
import { DEFAULT_CONTENT, type SeccionKey } from "@/lib/constants/defaultContent"
import type { Database } from "@/types/supabase"

export type ContenidoInstitucional = Database["public"]["Tables"]["contenido_institucional"]["Row"]
export type MiembroEquipo = Database["public"]["Tables"]["equipo_miembros"]["Row"]

export type ContenidoMap = Record<SeccionKey, { contenido: string; updated_at: string }>

export async function getContenidoInstitucional(): Promise<ContenidoMap> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("contenido_institucional")
    .select("*")

  if (error) {
    console.error("[getContenidoInstitucional]", error.message)
    throw new Error("Error al obtener el contenido institucional")
  }

  // Inicializar con placeholders para garantizar que las 3 keys siempre existan,
  // incluso si la tabla está vacía o falta alguna fila.
  const fallbackDate = new Date().toISOString()
  const map: ContenidoMap = {
    historia: { contenido: DEFAULT_CONTENT.historia, updated_at: fallbackDate },
    mision:   { contenido: DEFAULT_CONTENT.mision,   updated_at: fallbackDate },
    valores:  { contenido: DEFAULT_CONTENT.valores,   updated_at: fallbackDate },
  }

  for (const row of data) {
    const key = row.seccion as SeccionKey
    map[key] = {
      contenido: row.contenido.trim() || DEFAULT_CONTENT[key],
      updated_at: row.updated_at,
    }
  }
  return map
}

export async function getEquipoActivo(): Promise<MiembroEquipo[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("equipo_miembros")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true })

  if (error) {
    console.error("[getEquipoActivo]", error.message)
    throw new Error("Error al obtener el equipo")
  }
  return data
}

export async function getAllEquipoAdmin(): Promise<MiembroEquipo[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("equipo_miembros")
    .select("*")
    .order("orden", { ascending: true })

  if (error) {
    console.error("[getAllEquipoAdmin]", error.message)
    throw new Error("Error al obtener el equipo")
  }
  return data
}

export async function getMiembroById(id: string): Promise<MiembroEquipo | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("equipo_miembros")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("[getMiembroById]", error.message)
    throw new Error("Error al obtener el miembro")
  }
  return data
}
