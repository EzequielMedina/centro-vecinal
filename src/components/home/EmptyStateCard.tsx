import { cn } from "@/lib/utils"

type Props = {
  mensaje: string
  className?: string
}

export function EmptyStateCard({ mensaje, className }: Props) {
  return (
    <div className={cn("flex items-center justify-center py-12 px-4 rounded-xl border border-dashed bg-muted/30", className)}>
      <p className="text-sm text-muted-foreground text-center">{mensaje}</p>
    </div>
  )
}
