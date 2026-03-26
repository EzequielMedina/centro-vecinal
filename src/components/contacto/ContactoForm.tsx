"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { enviarMensaje } from "@/lib/actions/contacto"
import { ContactoSchema, type ContactoFormValues } from "@/lib/validations/contacto"

const MAX_MENSAJE = 2000

export function ContactoForm() {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ContactoFormValues>({
    resolver: zodResolver(ContactoSchema),
    mode: "onBlur",
  })

  const mensajeValue = watch("mensaje") ?? ""

  const onSubmit = (data: ContactoFormValues) => {
    setServerError(null)
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => formData.set(k, v))

    startTransition(async () => {
      const result = await enviarMensaje(formData)
      if ("error" in result) {
        setServerError(result.error)
        return
      }
      setEnviado(true)
    })
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <CheckCircle2 size={48} className="text-green-500" />
        <h3 className="font-heading font-semibold text-lg">¡Mensaje enviado!</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Tu mensaje fue enviado correctamente. Te responderemos pronto.
        </p>
        <Button variant="outline" size="sm" onClick={() => setEnviado(false)}>
          Enviar otro mensaje
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            {...register("nombre")}
            disabled={isPending}
            placeholder="Tu nombre completo"
            data-gramm="false"
          />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            disabled={isPending}
            placeholder="tu@email.com"
            data-gramm="false"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="asunto">Asunto *</Label>
        <Input
          id="asunto"
          {...register("asunto")}
          disabled={isPending}
          placeholder="¿En qué podemos ayudarte?"
          data-gramm="false"
        />
        {errors.asunto && <p className="text-xs text-destructive">{errors.asunto.message}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="mensaje">Mensaje *</Label>
          <span className={`text-xs ${mensajeValue.length > MAX_MENSAJE ? "text-destructive" : "text-muted-foreground"}`}>
            {mensajeValue.length}/{MAX_MENSAJE}
          </span>
        </div>
        <Textarea
          id="mensaje"
          {...register("mensaje")}
          disabled={isPending}
          placeholder="Escribí tu consulta aquí..."
          rows={5}
          data-gramm="false"
        />
        {errors.mensaje && <p className="text-xs text-destructive">{errors.mensaje.message}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? (
          <><Loader2 size={15} className="mr-2 animate-spin" />Enviando...</>
        ) : (
          <><Send size={15} className="mr-2" />Enviar mensaje</>
        )}
      </Button>
    </form>
  )
}
