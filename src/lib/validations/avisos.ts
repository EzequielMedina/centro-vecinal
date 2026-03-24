import { z } from "zod"

const baseFields = {
  titulo: z
    .string()
    .min(1, "El título es obligatorio")
    .max(200, "El título no puede superar los 200 caracteres"),
  contenido: z.string().min(1, "El contenido es obligatorio"),
  destacado: z.boolean().default(false),
  activo: z.boolean().default(true),
}

export const AvisoCreateSchema = z.object({
  ...baseFields,
  imagen_url: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
})

export const AvisoUpdateSchema = z.object({
  ...baseFields,
  imagen_url: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
})

export type AvisoCreateInput = z.infer<typeof AvisoCreateSchema>
export type AvisoUpdateInput = z.infer<typeof AvisoUpdateSchema>
