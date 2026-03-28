"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

type ContextValue = {
  /** Nuevos mensajes no leídos recibidos por Realtime desde que el layout se montó */
  unreadDelta: number
  /** Resetea el delta cuando el servidor provee un nuevo conteo canónico */
  resetDelta: () => void
}

const ContactoRealtimeContext = createContext<ContextValue>({
  unreadDelta: 0,
  resetDelta: () => {},
})

export function useContactoRealtime() {
  return useContext(ContactoRealtimeContext)
}

export function ContactoRealtimeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [unreadDelta, setUnreadDelta] = useState(0)
  const router = useRouter()
  // Ref para evitar que router sea dependencia del effect y destruya la suscripción
  const routerRef = useRef(router)
  useEffect(() => { routerRef.current = router })

  const resetDelta = useCallback(() => setUnreadDelta(0), [])

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
          // Incrementar badge client-side de forma inmediata y confiable
          setUnreadDelta((d) => d + 1)
          // Actualizar la lista de mensajes si el admin está en esa página
          routerRef.current.refresh()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <ContactoRealtimeContext.Provider value={{ unreadDelta, resetDelta }}>
      {children}
    </ContactoRealtimeContext.Provider>
  )
}
