import { createAdminClient } from "@/lib/supabase/admin"

const MAX_INTENTOS = 3
const VENTANA_MINUTOS = 10

// La lógica de rate limiting se delega a una función PL/pgSQL para que el
// chequeo e incremento sean atómicos y no haya condición de carrera.
export async function checkRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc("check_rate_limit", {
    ip_address:      ip,
    ventana_minutos: VENTANA_MINUTOS,
    max_intentos:    MAX_INTENTOS,
  })

  if (error) {
    console.error("[checkRateLimit]", error.message)
    // Ante un fallo de DB, fallamos cerrado: bloqueamos el intento para
    // evitar que errores transitorios permitan bypass del rate limiting.
    return { allowed: false }
  }

  return { allowed: Boolean(data) }
}
