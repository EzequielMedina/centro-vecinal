"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema } from "@/lib/validations/auth"

type LoginResult = { error: string }

export async function signIn(
  formData: FormData
): Promise<LoginResult | never> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: "Credenciales incorrectas" }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: "Credenciales incorrectas" }
  }

  // Validar redirect para evitar open-redirect: solo paths internos bajo /admin
  const rawRedirect = formData.get("redirect")?.toString() ?? ""
  const redirectTo =
    rawRedirect.startsWith("/admin") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/admin/dashboard"
  redirect(redirectTo)
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}
