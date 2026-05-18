import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Props = {
  title?: string
  nombre: string
}

export function AdminNavbar({ title, nombre }: Props) {
  const initials = nombre
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6 shrink-0">
      <h1 className="font-heading font-semibold text-base text-foreground">
        {title ?? "Panel de Administración"}
      </h1>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:block">
          {nombre}
        </span>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
