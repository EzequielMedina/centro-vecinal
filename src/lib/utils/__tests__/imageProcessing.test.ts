import { describe, it, expect } from "vitest"
import sharp from "sharp"
import { processImage, isAllowedMimeType } from "../imageProcessing"

describe("isAllowedMimeType", () => {
  it("acepta image/jpeg", () => {
    expect(isAllowedMimeType("image/jpeg")).toBe(true)
  })

  it("acepta image/png", () => {
    expect(isAllowedMimeType("image/png")).toBe(true)
  })

  it("acepta image/webp", () => {
    expect(isAllowedMimeType("image/webp")).toBe(true)
  })

  it("rechaza application/pdf", () => {
    expect(isAllowedMimeType("application/pdf")).toBe(false)
  })

  it("rechaza image/gif", () => {
    expect(isAllowedMimeType("image/gif")).toBe(false)
  })

  it("rechaza string vacío", () => {
    expect(isAllowedMimeType("")).toBe(false)
  })
})

describe("processImage", () => {
  it("lanza error si el MIME type no está permitido", async () => {
    const buffer = Buffer.from("fake pdf content")
    await expect(processImage(buffer, "application/pdf")).rejects.toThrow(
      "Tipo de archivo no permitido"
    )
  })

  it("convierte un PNG válido a WebP", async () => {
    // Generar PNG 1x1 rojo con sharp
    const pngBuffer = await sharp({
      create: { width: 1, height: 1, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .png()
      .toBuffer()

    const result = await processImage(pngBuffer, "image/png")
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    // WebP empieza con "RIFF"
    expect(result.subarray(0, 4).toString("ascii")).toBe("RIFF")
  })
})
