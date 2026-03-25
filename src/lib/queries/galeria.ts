import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

export type ImagenGaleria = Database["public"]["Tables"]["galeria"]["Row"]

const PAGE_SIZE = 20

export async function getImagenesGaleria(page = 1, limit = PAGE_SIZE): Promise<ImagenGaleria[]> {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  const { data, error } = await supabase
    .from("galeria")
    .select("*")
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("[getImagenesGaleria]", error.message)
    throw new Error("Error al obtener las imágenes de la galería")
  }
  return data
}

export async function getImagenesDestacadas(limit = 8): Promise<ImagenGaleria[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("galeria")
    .select("*")
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[getImagenesDestacadas]", error.message)
    throw new Error("Error al obtener las imágenes de la galería")
  }
  return data
}

export async function countImagenes(): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("galeria")
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error("[countImagenes]", error.message)
    throw new Error("Error al contar las imágenes de la galería")
  }
  return count ?? 0
}
