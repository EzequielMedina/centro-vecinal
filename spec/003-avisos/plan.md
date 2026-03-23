# Implementation Plan: Gestión de Avisos

**Branch**: `003-avisos` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `spec/003-avisos/spec.md`

---

## Summary

Implementar el módulo completo de avisos: listado público con detalle por slug, y CRUD en el panel admin con editor WYSIWYG (TipTap), subida de imágenes a Supabase Storage, toggle de destacado y activar/desactivar. El contenido HTML del editor se sanitiza con DOMPurify antes de guardarse. Los cambios se reflejan en el sitio público inmediatamente via `revalidatePath`.

---

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+
**Primary Dependencies**: Next.js 14 (App Router, Server Actions), TipTap 2, DOMPurify, Supabase Storage, React Hook Form, Zod, shadcn/ui
**Storage**: PostgreSQL via Supabase — tabla `avisos`; imágenes en Supabase Storage bucket `avisos`
**Testing**: Vitest (unit: slugify, sanitización), Playwright (E2E: crear aviso → aparece en `/avisos`)
**Target Platform**: Web mobile-first (público), desktop-first (panel admin)
**Performance Goals**: Listado de 100 avisos carga en <2s; cambio publicado visible en <5s
**Constraints**: Máximo 3 avisos destacados simultáneos; imágenes máx. 5MB; contenido sanitizado antes de persistir
**Scale/Scope**: ~50–200 avisos históricos; 1–5 admins creando contenido

---

## Constitution Check

| Gate | Estado | Detalle |
|------|--------|---------|
| ¿Se sanitiza el HTML del WYSIWYG? | ✅ Requiere atención | DOMPurify se ejecuta en el Server Action antes del INSERT — nunca en cliente solo |
| ¿El slug es collision-free? | ✅ Requiere atención | Función `slugify` + sufijo numérico si el slug ya existe en DB |
| ¿Highlights en home sin lógica compleja? | ✅ Pasa | Constraint de máx. 3 destacados se valida en Server Action con COUNT query |
| ¿Se usa `revalidatePath` correctamente? | ✅ Pasa | Server Actions invalidan `/avisos` y `/` tras crear/editar/eliminar |

---

## Project Structure

### Documentation (this feature)

```text
spec/003-avisos/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── (public)/
│   └── avisos/
│       ├── page.tsx                      # Listado público — ISR revalidate: 30
│       └── [slug]/
│           └── page.tsx                  # Detalle del aviso — ISR revalidate: 30
│
└── (admin)/
    └── admin/
        └── avisos/
            ├── page.tsx                  # Lista de avisos en panel admin
            ├── nuevo/
            │   └── page.tsx              # Formulario crear aviso
            └── [id]/
                └── editar/
                    └── page.tsx          # Formulario editar aviso

components/
├── avisos/
│   ├── AvisoCard.tsx                     # Card para listado público
│   ├── AvisoDetalle.tsx                  # Contenido completo del aviso
│   └── AvisosGrid.tsx                    # Grid responsive de cards
└── admin/
    └── avisos/
        ├── AvisoForm.tsx                 # Formulario crear/editar (compartido)
        ├── AvisosAdminTable.tsx          # Tabla con acciones (editar, eliminar, toggle)
        └── ConfirmDeleteDialog.tsx       # Modal de confirmación eliminar

lib/
├── queries/
│   └── avisos.ts                        # getAvisos(), getAvisoBySlug(), getAvisosDestacados()
├── actions/
│   └── avisos.ts                        # createAviso(), updateAviso(), deleteAviso(), toggleActivo()
├── validations/
│   └── avisos.ts                        # Zod schema: AvisoCreateSchema, AvisoUpdateSchema
└── utils/
    ├── slugify.ts                        # slugify(titulo) → string único
    └── sanitize.ts                      # sanitizeHtml(html) → string seguro (DOMPurify server-side)
```

**Structure Decision**: Monorepo Next.js. Las mutaciones usan Server Actions (no API Routes) para aprovechar `revalidatePath` directo y tipado end-to-end. El editor TipTap es un Client Component encapsulado dentro del formulario servidor.

---

## Fases de Implementación

### Fase 0 — Migración de base de datos
1. Crear migración `supabase/migrations/001_crear_tabla_avisos.sql`.
2. Schema: `id, titulo, slug (UNIQUE), contenido, destacado (DEFAULT false), activo (DEFAULT true), imagen_url, autor_id (FK auth.users), created_at, updated_at`.
3. Trigger `updated_at` con función `moddatetime`.
4. RLS: lectura pública para `activo = true`; escritura solo para roles autenticados.
5. Crear bucket `avisos` en Supabase Storage con política pública de lectura.

### Fase 1 — Listado y detalle público
1. Query `getAvisos()`: SELECT WHERE `activo = true` ORDER BY `created_at DESC`.
2. Página `/avisos` con `AvisosGrid` — ISR `revalidate: 30`.
3. `AvisoCard`: título, fecha (`Intl.DateTimeFormat` en español), imagen con `next/image`, resumen (strip HTML + truncar a 150 chars).
4. `generateStaticParams()` en `/avisos/[slug]` para pre-render de los 10 más recientes.
5. Página 404 custom si el aviso no existe o `activo = false`.

### Fase 2 — Editor WYSIWYG en admin
1. Instalar y configurar TipTap con extensiones: `StarterKit`, `Link`, `Image` (upload to Storage).
2. Crear `RichTextEditor` Client Component con toolbar: negrita, cursiva, listas, links.
3. El valor del editor se guarda como HTML string en el formulario via `useFormContext`.
4. Preview del contenido en tiempo real dentro del formulario.

### Fase 3 — Server Actions CRUD
1. `createAviso(formData)`:
   - Validar con Zod.
   - Generar slug único: `slugify(titulo)` + verificar existencia en DB.
   - Sanitizar HTML con DOMPurify (server-side).
   - Si `destacado = true`: verificar COUNT de destacados activos < 3.
   - Subir imagen a Storage si existe.
   - INSERT en DB.
   - `revalidatePath('/avisos')` + `revalidatePath('/')`.
2. `updateAviso(id, formData)`: similar, regenerar slug si cambia título, no regenerar si no.
3. `deleteAviso(id)`: DELETE de DB + eliminar imagen de Storage + revalidar paths.
4. `toggleActivo(id, activo)`: UPDATE activo, revalidar.

### Fase 4 — Panel admin
1. Tabla `AvisosAdminTable` con columnas: título, destacado (badge), activo (toggle switch), fecha, acciones (editar / eliminar).
2. Modal de confirmación para eliminar.
3. Badge visual en fila si el aviso está destacado.
4. Filtro en la tabla: Activos / Inactivos / Todos.

---

## Complexity Tracking

> No hay violaciones. Server Actions + `revalidatePath` es el patrón recomendado por Next.js para este caso.
