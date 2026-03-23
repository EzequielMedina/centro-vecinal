# Implementation Plan: Página Sobre Nosotros

**Branch**: `007-sobre-nosotros` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `spec/007-sobre-nosotros/spec.md`

---

## Summary

Implementar la página pública `/sobre-nosotros` con secciones de Historia, Misión & Visión, Valores y Equipo Directivo. El contenido institucional es editable por admins desde el panel usando TipTap. El equipo directivo es una lista ordenable de miembros con foto, nombre y cargo. Contenido por defecto (placeholder) para el primer uso. La página es mayormente estática con revalidación larga.

---

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+
**Primary Dependencies**: Next.js 14, TipTap 2 (reutilizado de avisos), Supabase Storage (fotos del equipo), `sharp`, shadcn/ui, `@dnd-kit/sortable`
**Storage**: PostgreSQL via Supabase — tablas `contenido_institucional` y `equipo_miembros`; fotos en bucket `equipo`
**Testing**: Vitest (unit: sanitización), Playwright (E2E: editar misión → aparece en página pública)
**Target Platform**: Web mobile-first; contenido mayormente estático
**Performance Goals**: LCP <2s (contenido estático, pocas imágenes)
**Constraints**: Fotos del equipo máx. 2MB; secciones institucionales fijas (no creables, solo editables)
**Scale/Scope**: 3 secciones de texto fijas; ~3–10 miembros del equipo directivo

---

## Constitution Check

| Gate | Estado | Detalle |
|------|--------|---------|
| ¿Secciones como filas en DB o columnas? | ✅ Pasa | Como filas con `seccion` enum — más flexible para agregar secciones futuras |
| ¿Se necesita WYSIWYG para las 3 secciones? | ✅ Pasa | Sí — los admins sin conocimiento técnico necesitan formato básico |
| ¿Placeholder en DB o en código? | ✅ Pasa | En código (`DEFAULT_CONTENT` map) — así no contamina la DB con datos falsos |
| ¿Fotos del equipo via Storage o URL externa? | ✅ Pasa | Storage propio — control total, sin dependencias externas |

---

## Project Structure

### Documentation (this feature)

```text
spec/007-sobre-nosotros/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── (public)/
│   └── sobre-nosotros/
│       └── page.tsx                           # Página pública — SSR revalidate: 300
│
└── (admin)/
    └── admin/
        └── sobre-nosotros/
            └── page.tsx                       # Panel edición: 3 secciones + equipo

components/
├── sobre-nosotros/
│   ├── SeccionInstitucional.tsx               # Sección con título + HTML content
│   ├── ValoresSection.tsx                     # Sección valores (puede tener layout especial)
│   └── EquipoGrid.tsx                         # Grid de tarjetas de miembros
└── admin/
    └── sobre-nosotros/
        ├── EditorSeccion.tsx                  # Editor TipTap para cada sección
        ├── EquipoAdminList.tsx               # Lista drag-and-drop de miembros
        └── MiembroForm.tsx                   # Formulario agregar/editar miembro

lib/
├── queries/
│   └── institucional.ts                      # getContenidoInstitucional(), getEquipoActivo()
├── actions/
│   └── institucional.ts                      # updateSeccion(), createMiembro(), updateMiembro(), deleteMiembro()
├── validations/
│   └── institucional.ts                      # Zod schemas
└── constants/
    └── defaultContent.ts                     # DEFAULT_CONTENT: texto placeholder por sección
```

**Structure Decision**: Monorepo Next.js. Las 3 secciones de texto tienen registros PRE-EXISTENTES en la DB (creados en seed/migración) — el admin siempre edita, nunca crea. Los miembros del equipo sí se crean/eliminan. Revalidación larga de 300s porque el contenido institucional cambia raramente.

---

## Fases de Implementación

### Fase 0 — Migración
1. Crear migración `supabase/migrations/005_crear_tablas_institucional.sql`.
2. Tabla `contenido_institucional`: `id UUID, seccion TEXT CHECK IN ('historia','mision','valores'), contenido TEXT DEFAULT '', updated_at TIMESTAMPTZ`.
3. Insertar las 3 filas en la migración (contenido vacío — el placeholder viene del código).
4. Tabla `equipo_miembros`: `id UUID, nombre TEXT NOT NULL, cargo TEXT NOT NULL, foto_url TEXT, orden INT DEFAULT 0, activo BOOL DEFAULT true`.
5. RLS ambas tablas: lectura pública; escritura solo auth.
6. Crear bucket `equipo` en Storage con lectura pública.

### Fase 1 — Contenido por defecto
1. Definir `DEFAULT_CONTENT` en `lib/constants/defaultContent.ts`:
   - `historia`: texto placeholder sobre la historia del centro.
   - `mision`: texto placeholder de misión y visión.
   - `valores`: texto placeholder de valores comunitarios.
2. En la query `getContenidoInstitucional()`: si `contenido` está vacío, retornar el placeholder correspondiente.
3. Esto garantiza que la página nunca se vea vacía, incluso en el primer deploy.

### Fase 2 — Página pública
1. Server Component que fetcha en paralelo: `getContenidoInstitucional()` + `getEquipoActivo()`.
2. Renderizar HTML del contenido institucional con `dangerouslySetInnerHTML` (el contenido viene de DB propia, fue sanitizado al guardar).
3. `EquipoGrid`: grid responsive de cards (foto circular con `next/image`, nombre en bold, cargo en texto secundario).
4. Foto fallback: avatar generado con iniciales del nombre si no hay foto (usando CSS + letra inicial).
5. `revalidate: 300` (5 minutos — este contenido cambia raramente).

### Fase 3 — Panel admin: edición de secciones
1. Página `/admin/sobre-nosotros` muestra los 3 editores de sección en tabs o acordeón.
2. Cada `EditorSeccion`: TipTap con toolbar básico (negrita, cursiva, listas). Al guardar, Server Action `updateSeccion(seccion, contenido)` sanitiza y actualiza.
3. Botón "Guardar cambios" por sección (no global) para evitar perder ediciones.
4. `revalidatePath('/sobre-nosotros')` tras cada guardado.

### Fase 4 — Panel admin: gestión del equipo
1. `EquipoAdminList` con `@dnd-kit/sortable` para reordenar.
2. Botón "Agregar miembro" → `MiembroForm` en dialog modal: nombre, cargo, foto (upload).
3. Upload de foto: `sharp` procesa a WebP circular (200x200), sube a bucket `equipo`.
4. Toggle activo/inactivo por miembro.
5. Eliminar miembro: borra de DB + foto de Storage.

---

## Complexity Tracking

> No hay violaciones. Patrón estándar de contenido editable con TipTap + Supabase.
