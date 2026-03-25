import sharp from "sharp"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)
}

/**
 * Valida el MIME type y convierte la imagen a WebP con sharp.
 * Redimensiona a máx. 1920px de ancho preservando aspect ratio.
 * Calidad 80 para balance tamaño/calidad.
 */
export async function processImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  if (!isAllowedMimeType(mimeType)) {
    throw new Error(`Tipo de archivo no permitido: ${mimeType}`)
  }

  return sharp(buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()
}
