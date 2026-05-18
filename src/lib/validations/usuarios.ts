import { z } from "zod"

export const CreateAdminSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña no puede superar los 72 caracteres"),
  rol: z.enum(["admin", "superadmin"], {
    error: "Rol inválido",
  }),
})

export type CreateAdminInput = z.infer<typeof CreateAdminSchema>
