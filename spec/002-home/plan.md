# Implementation Plan: Página de Inicio (Home)

**Branch**: `002-home` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `spec/002-home/spec.md`

---

## Summary

Implementar la página de inicio (`/`) del sitio público. Es la primera impresión del centro vecinal: incluye hero con logo e identidad visual, sección de avisos destacados (máx. 3), sección de próximas actividades (máx. 3), resumen de servicios y datos de contacto/ubicación. Toda la data se obtiene server-side (SSR/ISR) para garantizar SEO y velocidad de carga.

---

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+
**Primary Dependencies**: Next.js 14 (App Router, Server Components), Tailwind CSS, shadcn/ui, Framer Motion, Supabase
**Storage**: PostgreSQL via Supabase — tablas `avisos` (destacado=true), `actividades` (fecha_inicio > now), `servicios` (activo=true)
**Testing**: Vitest + React Testing Library (componentes), Playwright (smoke test página carga correctamente)
**Target Platform**: Web mobile-first — viewport mínimo 320px, navegadores modernos
**Project Type**: Full-stack web app (Next.js monorepo)
**Performance Goals**: Lighthouse Performance ≥ 85 mobile; LCP < 2.5s; CLS < 0.1
**Constraints**: ISR con revalidación cada 60s — cambios en contenido se reflejan en ≤60s sin rebuild completo
**Scale/Scope**: Página más visitada del sitio — ~500 visitas/mes estimadas

---

## Constitution Check

| Gate | Estado | Detalle |
|------|--------|---------|
| ¿Se usa SSR/ISR correctamente? | ✅ Pasa | Server Components con `revalidate = 60` — sin client fetching innecesario |
| ¿Se evita cargar datos innecesarios? | ✅ Pasa | Solo se fetcha lo que se muestra: 3 avisos, 3 actividades, servicios activos |
| ¿Animaciones afectan performance? | ✅ Requiere atención | Framer Motion solo en elementos above-the-fold con `initial` deshabilitado en mobile |
| ¿Las imágenes están optimizadas? | ✅ Requiere atención | Usar `next/image` con `priority` en el logo del hero, lazy en el resto |

---

## Project Structure

### Documentation (this feature)

```text
spec/002-home/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
└── (public)/
    └── page.tsx                          # Página Home — Server Component con ISR (revalidate: 60)

components/
└── home/
    ├── HeroSection.tsx                   # Logo, nombre, tagline, CTA principal
    ├── AvisosDestacadosSection.tsx       # Grid de hasta 3 avisos destacados
    ├── ProximasActividadesSection.tsx    # Grid de hasta 3 actividades futuras
    ├── ServiciosResumenSection.tsx       # Vista previa de servicios del centro
    ├── ContactoInfoSection.tsx           # Dirección, horarios, teléfono
    └── EmptyStateCard.tsx               # Componente reutilizable para estados vacíos

lib/
└── queries/
    ├── avisos.ts                         # getAvisosDestacados(): aviso[]
    ├── actividades.ts                    # getProximasActividades(): actividad[]
    └── servicios.ts                      # getServiciosActivos(): servicio[]
```

**Structure Decision**: Monorepo Next.js. La página `/` es un Server Component que ejecuta las 3 queries en paralelo (`Promise.all`) y pasa los datos a componentes client solo donde se necesitan animaciones. ISR con `revalidate: 60` para balance entre frescura de datos y performance.

---

## Fases de Implementación

### Fase 0 — Sistema de diseño base
1. Configurar paleta en `tailwind.config.ts`: colores del logo (teal `#2D6A7F`, rojo `#D32F2F`, ámbar `#F59E0B`, salvia `#6B8C7A`).
2. Configurar fuentes en `app/layout.tsx`: Poppins (títulos) + Inter (cuerpo) via `next/font/google`.
3. Crear componentes base de shadcn/ui: `Card`, `Badge`, `Button`.
4. Crear `EmptyStateCard` reutilizable para cuando no hay datos.

### Fase 1 — Queries de datos
1. Implementar `getAvisosDestacados()` en `lib/queries/avisos.ts`: SELECT WHERE `destacado = true AND activo = true` ORDER BY `created_at DESC` LIMIT 3.
2. Implementar `getProximasActividades()` en `lib/queries/actividades.ts`: SELECT WHERE `fecha_inicio > NOW() AND activa = true` ORDER BY `fecha_inicio ASC` LIMIT 3.
3. Implementar `getServiciosActivos()` en `lib/queries/servicios.ts`: SELECT WHERE `activo = true` ORDER BY `orden ASC`.
4. Tipar correctamente los retornos con tipos TypeScript derivados del schema de Supabase.

### Fase 2 — Secciones de la página
1. **HeroSection**: Logo con `next/image priority`, nombre "Centro Vecinal Centro América", tagline, botón CTA → `/actividades`. Gradiente suave con colores del logo como fondo.
2. **AvisosDestacadosSection**: Grid responsive (1 col mobile, 3 desktop). Cards con título, fecha formateada, resumen (primeros 120 chars del contenido sin HTML), imagen. Link a `/avisos/[slug]`.
3. **ProximasActividadesSection**: Cards con título, fecha, badge de categoría con color según tipo, imagen. Link a `/actividades/[slug]`.
4. **ServiciosResumenSection**: Grid de íconos + nombre de servicio. Link "Ver todos" → `/servicios`.
5. **ContactoInfoSection**: Dirección, horario, teléfono (link `tel:`), email. Incluir link a Google Maps.

### Fase 3 — Página principal y SEO
1. Ensamblar `app/(public)/page.tsx` con `Promise.all([getAvisosDestacados(), getProximasActividades(), getServiciosActivos()])`.
2. Agregar `export const revalidate = 60` para ISR.
3. Agregar `generateMetadata()` con title, description y Open Graph tags del centro.
4. Agregar `<script type="application/ld+json">` con schema `LocalBusiness` para SEO local.

### Fase 4 — Animaciones y pulido visual
1. Animar entrada de secciones con Framer Motion `useInView` — solo cuando el elemento entra al viewport.
2. Deshabilitar animaciones si `prefers-reduced-motion` está activo.
3. Verificar Lighthouse en mobile y ajustar hasta ≥ 85.

---

## Complexity Tracking

> No hay violaciones. Página estática con ISR — la solución más simple para los requerimientos de performance y frescura de datos.
