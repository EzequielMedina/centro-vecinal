import { createAdminClient } from "@/lib/supabase/admin"

const MAX_INTENTOS = 3
const VENTANA_MINUTOS = 10

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from("rate_limit")
    .select("count, window_start")
    .eq("ip", ip)
    .single()

  if (!existing) {
    // Primera vez que esta IP envía en esta ventana
    await supabase.from("rate_limit").insert({ ip })
    return { allowed: true }
  }

  const windowStart = new Date(existing.window_start)
  const ahora = new Date()
  const minutosTranscurridos = (ahora.getTime() - windowStart.getTime()) / 60000

  if (minutosTranscurridos > VENTANA_MINUTOS) {
    // Ventana expirada: resetear
    await supabase
      .from("rate_limit")
      .update({ count: 1, window_start: ahora.toISOString() })
      .eq("ip", ip)
    return { allowed: true }
  }

  if (existing.count >= MAX_INTENTOS) {
    return { allowed: false }
  }

  await supabase
    .from("rate_limit")
    .update({ count: existing.count + 1 })
    .eq("ip", ip)

  return { allowed: true }
}
