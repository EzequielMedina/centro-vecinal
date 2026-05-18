import { z } from "zod"

export const SeccionSchema = z.object({
  seccion: z.enum(["historia", "mision", "valores"]),
  contenido: z.string().min(1, "El contenido no puede estar vacío"),
})

export const MiembroSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  cargo: z.string().min(2, "El cargo debe tener al menos 2 caracteres"),
})

export type SeccionFormData = z.infer<typeof SeccionSchema>
export type MiembroFormData = z.infer<typeof MiembroSchema>
