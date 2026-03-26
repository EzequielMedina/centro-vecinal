import { z } from "zod"
import { ICONOS_DISPONIBLES } from "@/lib/utils/icons"

export const ServicioSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  icono: z.string().refine(
    (v) => (ICONOS_DISPONIBLES as readonly string[]).includes(v),
    "Seleccioná un ícono válido"
  ),
  activo: z.preprocess((v) => v === "true" || v === true, z.boolean()),
})

export type ServicioFormData = z.infer<typeof ServicioSchema>
