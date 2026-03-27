"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export function ContactoRealtimeNotifier() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("contacto-nuevos-mensajes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contacto_mensajes" },
        (payload) => {
          const nombre = (payload.new as { nombre?: string }).nombre ?? "Alguien"
          toast.info(`Nuevo mensaje de ${nombre}`, {
            description: "Revisá la bandeja de contacto.",
            duration: 6000,
          })
          // Actualiza el badge de no leídos en el sidebar
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
