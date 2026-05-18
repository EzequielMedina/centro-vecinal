export type CategoriaValue = "taller" | "deporte" | "cultural" | "apoyo-estudiantil" | "otro"

export type Categoria = {
  value: CategoriaValue
  label: string
  color: string   // clases Tailwind para el badge
}

export const CATEGORIAS_VALIDAS = ["taller", "deporte", "cultural", "apoyo-estudiantil", "otro"] as const

export const CATEGORIAS: Categoria[] = [
  { value: "taller",            label: "Taller",            color: "bg-violet-100 text-violet-700" },
  { value: "deporte",           label: "Deporte",           color: "bg-green-100 text-green-700" },
  { value: "cultural",          label: "Cultural",          color: "bg-amber-100 text-amber-700" },
  { value: "apoyo-estudiantil", label: "Apoyo Estudiantil", color: "bg-blue-100 text-blue-700" },
  { value: "otro",              label: "Otro",              color: "bg-zinc-100 text-zinc-600" },
]

export function getCategoriaInfo(value: string): Categoria {
  const defaultCategoria = CATEGORIAS.find((c) => c.value === "otro") ?? CATEGORIAS[0]
  return CATEGORIAS.find((c) => c.value === value) ?? defaultCategoria
}
