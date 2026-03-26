import {
  BookOpen, GraduationCap, Pencil, Library,
  Users, Heart, HandHeart, Handshake,
  Music, Theater, Camera, Palette,
  Dumbbell, Trophy, Bike, Footprints,
  Home, Building, TreePine, Leaf,
  Star, Sparkles, Sun, Moon,
  Stethoscope, Scale, Gavel, ShieldCheck,
  Utensils, Baby, Accessibility, Globe, Circle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const ICONOS_DISPONIBLES = [
  "BookOpen", "GraduationCap", "Pencil", "Library",
  "Users", "Heart", "HandHeart", "Handshake",
  "Music", "Theater", "Camera", "Palette",
  "Dumbbell", "Trophy", "Bike", "Footprints",
  "Home", "Building", "TreePine", "Leaf",
  "Star", "Sparkles", "Sun", "Moon",
  "Stethoscope", "Scale", "Gavel", "ShieldCheck",
  "Utensils", "Baby", "Accessibility", "Globe", "Circle",
] as const

export type IconName = (typeof ICONOS_DISPONIBLES)[number]

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen, GraduationCap, Pencil, Library,
  Users, Heart, HandHeart, Handshake,
  Music, Theater, Camera, Palette,
  Dumbbell, Trophy, Bike, Footprints,
  Home, Building, TreePine, Leaf,
  Star, Sparkles, Sun, Moon,
  Stethoscope, Scale, Gavel, ShieldCheck,
  Utensils, Baby, Accessibility, Globe, Circle,
}

export function getDynamicIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Star
}
