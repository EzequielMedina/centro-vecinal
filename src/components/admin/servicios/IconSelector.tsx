"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { ICONOS_DISPONIBLES, getDynamicIcon } from "@/lib/utils/icons"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (icono: string) => void
}

export function IconSelector({ value, onChange }: Props) {
  const [busqueda, setBusqueda] = useState("")

  const filtrados = ICONOS_DISPONIBLES.filter((nombre) =>
    nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-3">
      {/* Búsqueda */}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar ícono…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          data-gramm="false"
          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Grid de íconos */}
      <div className="grid grid-cols-8 gap-1.5 max-h-52 overflow-y-auto pr-1">
        {filtrados.map((nombre) => {
          const Icon = getDynamicIcon(nombre)
          const selected = nombre === value
          return (
            <button
              key={nombre}
              type="button"
              title={nombre}
              onClick={() => onChange(nombre)}
              className={cn(
                "flex items-center justify-center p-2 rounded-lg border transition-colors",
                selected
                  ? "bg-primary/10 border-primary text-primary"
                  : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              aria-label={nombre}
              aria-pressed={selected}
            >
              <Icon size={18} />
            </button>
          )
        })}
      </div>

      {/* Nombre seleccionado */}
      {value && (
        <p className="text-xs text-muted-foreground">
          Seleccionado: <span className="font-medium text-foreground">{value}</span>
        </p>
      )}
    </div>
  )
}
