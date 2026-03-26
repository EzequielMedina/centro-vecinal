type Props = {
  titulo: string
  contenido: string
}

export function SeccionInstitucional({ titulo, contenido }: Props) {
  return (
    <section>
      <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">{titulo}</h2>
      {/* El contenido viene sanitizado de la DB — seguro renderizarlo directamente */}
      <div
        className="prose prose-sm max-w-none text-muted-foreground [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mt-4 [&_h3]:mb-2 [&_strong]:text-foreground"
        dangerouslySetInnerHTML={{ __html: contenido }}
      />
    </section>
  )
}
