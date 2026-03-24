import type { SupabaseClient } from "@supabase/supabase-js"

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")   // solo alfanumérico, espacios y guiones
    .replace(/\s+/g, "-")            // espacios → guiones
    .replace(/-+/g, "-")             // guiones múltiples → uno
    .replace(/^-|-$/g, "")           // quitar guiones al inicio/fin
}

export async function uniqueSlug(
  titulo: string,
  supabase: SupabaseClient,
  excludeId?: string,
  tabla: string = "avisos"
): Promise<string> {
  const base = slugify(titulo) || `${tabla}-${Date.now()}`

  const { data, error } = await supabase
    .from(tabla)
    .select("slug")
    .like("slug", `${base}%`)

  if (error) throw new Error(`Error al verificar slugs existentes en ${tabla}`)

  const existingSlugs = new Set((data ?? []).map((r) => r.slug))

  // Excluir el propio registro al editar
  if (excludeId) {
    const { data: own, error: ownError } = await supabase
      .from(tabla)
      .select("slug")
      .eq("id", excludeId)
      .single()
    if (ownError && ownError.code !== "PGRST116") throw new Error(`Error al verificar slug propio en ${tabla}`)
    if (own) existingSlugs.delete(own.slug)
  }

  if (!existingSlugs.has(base)) return base

  let i = 2
  while (existingSlugs.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}
