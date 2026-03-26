import { z } from "zod"

export const ContactoSchema = z.object({
  nombre:  z.string().min(2,  "El nombre debe tener al menos 2 caracteres").max(100, "El nombre es demasiado largo"),
  email:   z.string().email("Ingresá un email válido"),
  asunto:  z.string().min(3,  "El asunto debe tener al menos 3 caracteres").max(150, "El asunto es demasiado largo"),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(2000, "El mensaje supera los 2000 caracteres"),
})

export type ContactoFormValues = z.infer<typeof ContactoSchema>
