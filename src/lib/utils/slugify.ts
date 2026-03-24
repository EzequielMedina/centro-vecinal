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
  excludeId?: string
): Promise<string> {
  const base = slugify(titulo)

  const { data } = await supabase
    .from("avisos")
    .select("slug")
    .like("slug", `${base}%`)

  const existingSlugs = new Set((data ?? []).map((r) => r.slug))

  // Excluir el propio registro al editar
  if (excludeId) {
    const { data: own } = await supabase
      .from("avisos")
      .select("slug")
      .eq("id", excludeId)
      .single()
    if (own) existingSlugs.delete(own.slug)
  }

  if (!existingSlugs.has(base)) return base

  let i = 2
  while (existingSlugs.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}
