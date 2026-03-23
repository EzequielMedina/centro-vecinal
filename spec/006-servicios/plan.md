# Implementation Plan: Página de Servicios

**Branch**: `006-servicios` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `spec/006-servicios/spec.md`

---

## Summary

Implementar la página pública `/servicios` con grilla de cards por servicio (ícono Lucide + nombre + descripción), y el panel admin con CRUD completo: crear/editar servicios con selector visual de íconos, activar/desactivar y reordenar con drag-and-drop. Es el módulo más simple del proyecto — sin imágenes ni contenido enriquecido.

---

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+
**Primary Dependencies**: Next.js 14, Lucide React, `@dnd-kit/core`, shadcn/ui, React Hook Form, Zod, Supabase
**Storage**: PostgreSQL via Supabase — tabla `servicios` (sin Storage de imágenes)
**Testing**: Vitest (unit: validación form), Playwright (E2E: crear servicio → aparece en `/servicios`)
**Target Platform**: Web mobile-first
**Performance Goals**: Página carga en <1.5s (contenido pequeño, sin imágenes pesadas)
**Constraints**: Sin imágenes — solo íconos vectoriales de Lucide; orden configurable via `orden INT`
**Scale/Scope**: ~5–15 servicios activos en simultáneo

---

## Constitution Check

| Gate | Estado | Detalle |
|------|--------|---------|
| ¿Se necesita WYSIWYG para servicios? | ✅ Pasa | No — textarea simple es suficiente para descripciones cortas |
| ¿Ícono como string en DB es suficiente? | ✅ Pasa | Guardar el nombre del ícono (`"BookOpen"`) y renderizar con `LucideIcon[iconName]` |
| ¿Drag-and-drop justificado? | ✅ Pasa | El orden de servicios impacta directamente la UX — ya se usa en galería, reutilizar lógica |

---

## Project Structure

### Documentation (this feature)

```text
spec/006-servicios/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── (public)/
│   └── servicios/
│       └── page.tsx                       # Página pública de servicios — SSR
│
└── (admin)/
    └── admin/
        └── servicios/
            ├── page.tsx                   # Lista admin con drag-and-drop
            └── [id]/
                └── editar/
                    └── page.tsx          # Formulario editar servicio

components/
├── servicios/
│   ├── ServicioCard.tsx                   # Card pública: ícono + nombre + descripción
│   └── ServiciosGrid.tsx                 # Grid responsive de cards
└── admin/
    └── servicios/
        ├── ServicioForm.tsx              # Formulario crear/editar
        ├── IconSelector.tsx              # Selector visual de íconos Lucide
        └── ServiciosAdminList.tsx        # Lista drag-and-drop para reordenar

lib/
├── queries/
│   └── servicios.ts                      # getServiciosActivos(), getAllServicios()
├── actions/
│   └── servicios.ts                      # createServicio(), updateServicio(), deleteServicio(), updateOrden()
├── validations/
│   └── servicios.ts                      # Zod: ServicioSchema
└── utils/
    └── icons.ts                          # ICONOS_DISPONIBLES: lista curada de ~30 íconos de Lucide
```

**Structure Decision**: Monorepo Next.js. Sin Route Handler — todo via Server Actions. Sin Storage ni WYSIWYG. Es el módulo más liviano del proyecto; reutiliza el componente `@dnd-kit` ya configurado en `005-galeria`.

---

## Fases de Implementación

### Fase 0 — Migración
1. Crear migración `supabase/migrations/004_crear_tabla_servicios.sql`.
2. Schema: `id UUID, nombre TEXT NOT NULL, descripcion TEXT NOT NULL, icono TEXT DEFAULT 'Star', activo BOOL DEFAULT true, orden INT DEFAULT 0`.
3. RLS: lectura pública para `activo = true`; escritura solo auth.
4. Insertar seed con ~5 servicios de ejemplo en `supabase/seed.sql`.

### Fase 1 — Página pública
1. Query `getServiciosActivos()`: SELECT WHERE `activo = true` ORDER BY `orden ASC`.
2. `ServicioCard`: renderizar ícono dinámicamente con `const Icon = icons[servicio.icono]` desde `lucide-react`. Nombre en bold, descripción en texto secundario.
3. Grid CSS: 1 col mobile, 2 cols tablet, 3 cols desktop.
4. Estado vacío: mensaje "Próximamente información sobre nuestros servicios".
5. SSR con `revalidate: 60`.

### Fase 2 — Selector de íconos
1. `ICONOS_DISPONIBLES` en `lib/utils/icons.ts`: lista curada de ~30 íconos relevantes para servicios comunitarios (BookOpen, Heart, Users, GraduationCap, Music, Dumbbell, etc.).
2. `IconSelector` Client Component: grid de íconos clickeables con tooltip del nombre. Ícono seleccionado resaltado con el color teal del sistema de diseño.
3. El nombre del ícono seleccionado se guarda como campo hidden en el formulario.

### Fase 3 — CRUD admin
1. Página lista: `ServiciosAdminList` con `@dnd-kit/sortable`. Al reordenar, Server Action `updateOrden(ids[])` hace UPDATE masivo del campo `orden`.
2. Toggle activo/inactivo: switch en cada fila → Server Action `toggleActivo(id)`.
3. Formulario: nombre (input), descripción (textarea), ícono (IconSelector), activo (checkbox).
4. Validación Zod: nombre mínimo 3 chars, descripción mínimo 10 chars, ícono requerido.
5. Modal de confirmación para eliminar.

---

## Complexity Tracking

> No hay violaciones. Es el módulo más simple — sin WYSIWYG, sin imágenes, sin lógica compleja.
