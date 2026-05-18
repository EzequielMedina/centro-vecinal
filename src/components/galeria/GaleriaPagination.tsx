import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  paginaActual: number
  totalPaginas: number
}

export function GaleriaPagination({ paginaActual, totalPaginas }: Props) {
  if (totalPaginas <= 1) return null

  const pages = Array.from({ length: totalPaginas }, (_, i) => i + 1)

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-8"
      aria-label="Paginación de galería"
    >
      {paginaActual > 1 && (
        <Link
          href={`?pagina=${paginaActual - 1}`}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={`?pagina=${page}`}
          className={cn(
            "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
            page === paginaActual
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-foreground"
          )}
          aria-current={page === paginaActual ? "page" : undefined}
        >
          {page}
        </Link>
      ))}

      {paginaActual < totalPaginas && (
        <Link
          href={`?pagina=${paginaActual + 1}`}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  )
}
