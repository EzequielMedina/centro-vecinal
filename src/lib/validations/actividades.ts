import { z } from "zod"

const CATEGORIAS_VALIDAS = ["taller", "deporte", "cultural", "apoyo-estudiantil", "otro"] as const

export const ActividadSchema = z
  .object({
    titulo: z
      .string()
      .min(1, "El título es obligatorio")
      .max(200, "El título no puede superar los 200 caracteres"),
    descripcion: z.string().min(1, "La descripción es obligatoria"),
    fecha_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fecha_fin: z.string().optional().or(z.literal("")),
    ubicacion: z.string().max(300, "La ubicación no puede superar los 300 caracteres").default(""),
    capacidad: z
      .string()
      .optional()
      .transform((v) => (v === "" || v === undefined ? null : parseInt(v, 10)))
      .pipe(z.number().int().positive("La capacidad debe ser un número positivo").nullable()),
    categoria: z.enum(CATEGORIAS_VALIDAS, { error: "Categoría inválida" }),
    activa: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (!data.fecha_fin) return true
      return new Date(data.fecha_fin) > new Date(data.fecha_inicio)
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["fecha_fin"],
    }
  )

export type ActividadInput = z.infer<typeof ActividadSchema>
