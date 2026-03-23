# Implementation Plan: Gestión de Actividades

**Branch**: `004-actividades` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `spec/004-actividades/spec.md`

---

## Summary

Implementar el módulo completo de actividades: catálogo público con filtro por categoría reflejado en URL (`?categoria=`), detalle por slug con badge "Finalizada" para actividades pasadas, y CRUD en panel admin con editor WYSIWYG, selector de categoría, fechas, capacidad e imagen. El apoyo estudiantil es una categoría más dentro de este módulo, no una sección separada. Los filtros funcionan sin recarga de página via `useRouter` + `searchParams`.

---

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+
**Primary Dependencies**: Next.js 14 (App Router, Server Actions, `useSearchParams`), TipTap 2, Supabase, React Hook Form, Zod, date-fns, shadcn/ui
**Storage**: PostgreSQL via Supabase — tabla `actividades`; imágenes en Supabase Storage bucket `actividades`
**Testing**: Vitest (unit: validación fechas, slugify, badge lógica), Playwright (E2E: filtro URL, crear actividad)
**Target Platform**: Web mobile-first (público), desktop-first (admin)
**Performance Goals**: Filtro responde en <500ms; listado con 50 actividades carga en <2s
**Constraints**: `fecha_fin` opcional pero si existe debe ser > `fecha_inicio`; `capacidad` opcional entero positivo; imágenes máx. 5MB
**Scale/Scope**: ~30–100 actividades históricas + futuras; categorías fijas (5 valores)

---

## Constitution Check

| Gate | Estado | Detalle |
|------|--------|---------|
| ¿Filtro URL sin client state innecesario? | ✅ Pasa | `useSearchParams` + `useRouter.replace` — sin useState para el filtro |
| ¿El badge "Finalizada" se calcula en servidor? | ✅ Pasa | Comparación `fecha_inicio < new Date()` en Server Component — no en cliente |
| ¿Placeholder de imagen por categoría? | ✅ Requiere atención | Map estático `{ categoria → /placeholders/categoria.webp }` en `lib/utils/placeholders.ts` |
| ¿Validación de fechas en cliente Y servidor? | ✅ Requiere atención | Zod refine en schema + revalidación en Server Action antes del INSERT |

---

## Project Structure

### Documentation (this feature)

```text
spec/004-actividades/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── (public)/
│   └── actividades/
│       ├── page.tsx                       # Listado + filtro — Server Component con searchParams
│       └── [slug]/
│           └── page.tsx                   # Detalle de actividad
│
└── (admin)/
    └── admin/
        └── actividades/
            ├── page.tsx                   # Lista admin con tabla
            ├── nueva/
            │   └── page.tsx              # Formulario nueva actividad
            └── [id]/
                └── editar/
                    └── page.tsx          # Formulario editar actividad

components/
├── actividades/
│   ├── ActividadCard.tsx                  # Card pública con badge categoría y "Finalizada"
│   ├── ActividadesGrid.tsx               # Grid responsive
│   ├── FiltrosCategorias.tsx             # Client Component: botones de filtro → actualiza URL
│   └── ActividadDetalle.tsx              # Contenido completo del detalle
└── admin/
    └── actividades/
        ├── ActividadForm.tsx             # Formulario crear/editar compartido
        ├── ActividadesAdminTable.tsx     # Tabla con acciones
        └── DateRangePicker.tsx           # Selector de fecha inicio / fin

lib/
├── queries/
│   └── actividades.ts                    # getActividades(categoria?), getActividadBySlug(), getProximasActividades()
├── actions/
│   └── actividades.ts                    # createActividad(), updateActividad(), deleteActividad(), toggleActiva()
├── validations/
│   └── actividades.ts                    # Zod: ActividadSchema con refine para fechas
└── utils/
    ├── categorias.ts                     # CATEGORIAS array + labels en español + colores badge
    └── placeholders.ts                   # Map categoría → imagen placeholder
```

**Structure Decision**: Monorepo Next.js. El filtro de categorías es un Client Component (`FiltrosCategorias`) que solo maneja la navegación — los datos se fetchen siempre en el Server Component padre al recibir los `searchParams`. Esto mantiene el SEO correcto para cada URL filtrada.

---

## Fases de Implementación

### Fase 0 — Migración de base de datos
1. Crear migración `supabase/migrations/002_crear_tabla_actividades.sql`.
2. Schema: `id, titulo, slug (UNIQUE), descripcion (HTML), fecha_inicio (TIMESTAMPTZ NOT NULL), fecha_fin (TIMESTAMPTZ), ubicacion, capacidad (INT), categoria (TEXT NOT NULL CHECK IN ('taller','deporte','cultural','apoyo-estudiantil','otro')), imagen_url, activa (DEFAULT true), autor_id (FK), created_at`.
3. RLS: lectura pública para `activa = true`; escritura solo auth.
4. Crear bucket `actividades` en Storage con lectura pública.
5. Agregar imágenes placeholder por categoría en `public/placeholders/`.

### Fase 1 — Listado público con filtros
1. Query `getActividades(categoria?)`: SELECT WHERE `activa = true` + filtro opcional de categoría, ORDER BY `fecha_inicio ASC`.
2. Separar resultados en "próximas" (`fecha_inicio >= NOW()`) y "pasadas" para renderizado diferenciado.
3. `FiltrosCategorias` Client Component: botones con cada categoría + "Todas". Al click, `router.replace('/actividades?categoria=valor')`.
4. `ActividadCard`: título, badge categoría con color, fecha formateada, badge "Finalizada" condicional, imagen con fallback al placeholder.
5. ISR con `revalidate: 30`.

### Fase 2 — Detalle de actividad
1. `generateStaticParams()` para pre-render de actividades futuras.
2. Página `/actividades/[slug]`: descripción completa (HTML sanitizado), fecha inicio/fin, ubicación, capacidad.
3. Schema `Event` en JSON-LD para SEO (Google Events).
4. Link "Volver a actividades" preservando el filtro activo si viene de allí.

### Fase 3 — Formulario admin con validación de fechas
1. `DateRangePicker`: dos inputs `<input type="datetime-local">` estilizados con shadcn.
2. Zod schema con `refine`: si `fecha_fin` existe, debe ser > `fecha_inicio`.
3. Selector de categoría: `<Select>` de shadcn con las 5 opciones + íconos.
4. Campo capacidad: input numérico opcional — validar `int > 0` si se ingresa.
5. Editor TipTap (reutilizar componente de `003-avisos`).

### Fase 4 — Server Actions CRUD
1. `createActividad(formData)`:
   - Validar con Zod (incluyendo refine de fechas).
   - Slugify + verificar unicidad.
   - Sanitizar HTML descripción.
   - Subir imagen o asignar placeholder según categoría.
   - INSERT + `revalidatePath('/actividades')` + `revalidatePath('/')`.
2. `updateActividad(id, formData)`: igual, mantener slug existente salvo que cambie el título.
3. `deleteActividad(id)`: DELETE + limpiar Storage + revalidar.
4. `toggleActiva(id, activa)`: UPDATE + revalidar.

---

## Complexity Tracking

> No hay violaciones. El patrón searchParams en Server Components es el enfoque oficial de Next.js para filtros SEO-friendly.
