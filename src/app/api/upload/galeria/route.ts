import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { processImage, isAllowedMimeType } from "@/lib/utils/imageProcessing"

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  // Verificar sesión con cliente normal (anon key + cookies)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Verificar que el usuario pertenece a admin_users
  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!adminRecord) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  // A partir de acá usar admin client para storage y DB (ya verificamos auth y rol de admin)
  const adminSupabase = createAdminClient()

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Request inválido" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
  }

  // Validar tipo MIME
  if (!isAllowedMimeType(file.type)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido. Solo se aceptan JPG, PNG y WebP." },
      { status: 400 }
    )
  }

  // Validar tamaño
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera el límite de 10 MB." },
      { status: 413 }
    )
  }

  // Procesar con sharp: convertir a WebP, comprimir, redimensionar
  let processedBuffer: Buffer
  try {
    const arrayBuffer = await file.arrayBuffer()
    processedBuffer = await processImage(Buffer.from(arrayBuffer), file.type)
  } catch {
    return NextResponse.json({ error: "Error al procesar la imagen." }, { status: 500 })
  }

  // Subir a Supabase Storage (admin client para evitar restricciones de storage policies)
  const filename = `${randomUUID()}.webp`
  const { error: uploadError } = await adminSupabase.storage
    .from("galeria")
    .upload(filename, processedBuffer, {
      contentType: "image/webp",
      cacheControl: "3600",
    })

  if (uploadError) {
    console.error("[upload/galeria] Storage error:", uploadError.message)
    return NextResponse.json({ error: "Error al subir la imagen." }, { status: 500 })
  }

  // Obtener URL pública
  const { data: { publicUrl } } = adminSupabase.storage.from("galeria").getPublicUrl(filename)

  // Insertar en tabla galeria
  const titulo = typeof formData.get("titulo") === "string" ? (formData.get("titulo") as string) : ""
  const descripcion = typeof formData.get("descripcion") === "string" ? (formData.get("descripcion") as string) : ""
  const categoria = typeof formData.get("categoria") === "string" ? (formData.get("categoria") as string) : ""

  const { data: inserted, error: insertError } = await adminSupabase
    .from("galeria")
    .insert({ titulo, descripcion, url: publicUrl, categoria })
    .select("id, url")
    .single()

  if (insertError) {
    // Limpiar el archivo subido para evitar huérfanos
    await adminSupabase.storage.from("galeria").remove([filename])
    console.error("[upload/galeria] Insert error:", insertError.message)
    return NextResponse.json({ error: "Error al guardar la imagen." }, { status: 500 })
  }

  return NextResponse.json({ id: inserted.id, url: inserted.url }, { status: 201 })
}
