"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Mail, MailOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ContactoMensaje } from "@/lib/queries/contacto"

type Props = { mensajes: ContactoMensaje[] }

export function MensajesTable({ mensajes }: Props) {
  if (mensajes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        No hay mensajes todavía.
      </p>
    )
  }

  return (
    <div className="divide-y rounded-xl border overflow-hidden">
      {mensajes.map((m) => (
        <Link
          key={m.id}
          href={`/admin/contacto/${m.id}`}
          className={cn(
            "flex items-start gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50",
            !m.leido && "bg-amber-50/60 dark:bg-amber-950/20"
          )}
        >
          <div className="shrink-0 mt-0.5">
            {m.leido
              ? <MailOpen size={16} className="text-muted-foreground" />
              : <Mail size={16} className="text-amber-600" />
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={cn("text-sm truncate", !m.leido && "font-semibold")}>
                {m.nombre}
              </p>
              <time className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {formatDistanceToNow(new Date(m.created_at), { addSuffix: true, locale: es })}
              </time>
            </div>
            <p className={cn("text-sm truncate", !m.leido ? "text-foreground" : "text-muted-foreground")}>
              {m.asunto}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{m.email}</p>
          </div>

          {!m.leido && (
            <span className="shrink-0 inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 dark:bg-amber-900/40 dark:text-amber-400">
              No leído
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
