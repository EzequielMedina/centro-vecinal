"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { marcarLeido } from "@/lib/actions/contacto"

type Props = { mensajeId: string }

// Marca el mensaje como leído en un useEffect para que la mutación
// ocurra solo cuando el usuario realmente abre la página, no durante
// prefetch ni durante el render del Server Component.
export function MarcarLeidoOnMount({ mensajeId }: Props) {
  const router = useRouter()

  useEffect(() => {
    marcarLeido(mensajeId).then(() => {
      // Refresca el layout para que el badge de no leídos se actualice
      router.refresh()
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mensajeId])

  return null
}
