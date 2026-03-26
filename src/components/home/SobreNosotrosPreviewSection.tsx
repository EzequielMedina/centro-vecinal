import Link from "next/link"
import { ArrowRight } from "lucide-react"

type Props = {
  mision: string
}

// Extrae texto plano del HTML para el preview del home
function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function SobreNosotrosPreviewSection({ mision }: Props) {
  const texto = htmlToText(mision)
  // Mostrar solo la primera oración o máx. 200 caracteres
  const preview = texto.length > 200 ? texto.slice(0, 200).trimEnd() + "…" : texto

  return (
    <section className="bg-primary/5 border-y border-primary/10">
      <div className="container max-w-3xl mx-auto px-4 py-14 text-center space-y-5">
        <h2 className="font-heading font-semibold text-2xl md:text-3xl text-foreground">
          ¿Quiénes somos?
        </h2>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          {preview}
        </p>
        <Link
          href="/sobre-nosotros"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Conocé más sobre nosotros
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  )
}
