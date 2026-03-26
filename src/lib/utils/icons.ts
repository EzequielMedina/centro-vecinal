import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const ICONOS_DISPONIBLES = [
  "BookOpen", "GraduationCap", "Pencil", "Library",
  "Users", "Heart", "HandHeart", "Handshake",
  "Music", "Theater", "Camera", "Palette",
  "Dumbbell", "Trophy", "Bike", "Footprints",
  "Home", "Building", "TreePine", "Leaf",
  "Star", "Sparkles", "Sun", "Moon",
  "Stethoscope", "Scale", "Gavel", "ShieldCheck",
  "Utensils", "Baby", "Accessibility", "Globe",
] as const

export type IconName = (typeof ICONOS_DISPONIBLES)[number]

export function getDynamicIcon(name: string): LucideIcon {
  const icon = (LucideIcons as Record<string, unknown>)[name]
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
    return icon as LucideIcon
  }
  return LucideIcons.Star
}
