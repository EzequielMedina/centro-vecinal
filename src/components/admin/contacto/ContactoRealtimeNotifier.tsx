"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"

type ContactoMensajeRow = Database["public"]["Tables"]["contacto_mensajes"]["Row"]

export function ContactoRealtimeNotifier() {
  const router = useRouter()
  const routerRef = useRef(router)
  useEffect(() => { routerRef.current = router })

  useEffect(() => {
    const supabase = createClient()

    // Inyectar el JWT del usuario autenticado en la conexión Realtime.
    // Sin esto, el servidor Realtime aplica RLS con rol anon y bloquea los eventos
    // porque el SELECT de contacto_mensajes requiere rol authenticated + admin_users.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token)
      }
    })

    const channel = supabase
      .channel("contacto-nuevos-mensajes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contacto_mensajes" },
        (payload: { new: ContactoMensajeRow }) => {
          const msg = payload.new
          toast.info(`Nuevo mensaje de ${msg.nombre ?? "Alguien"}`, {
            description: "Revisá la bandeja de contacto.",
            duration: 6000,
          })
          window.dispatchEvent(
            new CustomEvent<ContactoMensajeRow>("contacto:nuevo-mensaje", { detail: msg })
          )
          routerRef.current.refresh()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return null
}
