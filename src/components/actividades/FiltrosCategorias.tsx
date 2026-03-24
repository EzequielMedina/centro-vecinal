"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { CATEGORIAS } from "@/lib/utils/categorias"
import { cn } from "@/lib/utils"

export function FiltrosCategorias() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoriaActiva = searchParams.get("categoria") ?? ""

  function handleFiltro(valor: string) {
    if (valor) {
      router.replace(`/actividades?categoria=${valor}`)
    } else {
      router.replace("/actividades")
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleFiltro("")}
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
          categoriaActiva === ""
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        Todas
      </button>
      {CATEGORIAS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleFiltro(value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            categoriaActiva === value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
