import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

export type Servicio = Database["public"]["Tables"]["servicios"]["Row"]

export async function getServiciosActivos(): Promise<Servicio[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true })

  if (error) {
    console.error("[getServiciosActivos]", error.message)
    throw new Error("Error al obtener los servicios")
  }
  return data
}
