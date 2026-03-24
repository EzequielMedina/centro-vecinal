"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createAdmin } from "@/lib/actions/usuarios"
import {
  CreateAdminSchema,
  type CreateAdminInput,
} from "@/lib/validations/usuarios"

export function NuevoAdminForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateAdminInput>({
    resolver: zodResolver(CreateAdminSchema),
    defaultValues: { rol: "admin" },
  })

  function onSubmit(data: CreateAdminInput) {
    setServerError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.set("nombre", data.nombre)
      formData.set("email", data.email)
      formData.set("password", data.password)
      formData.set("rol", data.rol)

      const result = await createAdmin(formData)
      if ("error" in result) {
        setServerError(result.error)
      } else {
        router.push("/admin/usuarios")
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input
          id="nombre"
          placeholder="Juan Pérez"
          {...register("nombre")}
          disabled={isPending}
        />
        {errors.nombre && (
          <p className="text-xs text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="juan@ejemplo.com"
          {...register("email")}
          disabled={isPending}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            {...register("password")}
            disabled={isPending}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rol">Rol</Label>
        <Select
          defaultValue="admin"
          onValueChange={(v) =>
            setValue("rol", v as "admin" | "superadmin", {
              shouldValidate: true,
            })
          }
          disabled={isPending}
        >
          <SelectTrigger id="rol">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="superadmin">Superadmin</SelectItem>
          </SelectContent>
        </Select>
        {errors.rol && (
          <p className="text-xs text-destructive">{errors.rol.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 size={15} className="animate-spin mr-2" />}
          Crear usuario
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/usuarios")}
          disabled={isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
