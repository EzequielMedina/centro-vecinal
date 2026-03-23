# Implementation Plan: Galería de Imágenes

**Branch**: `005-galeria` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `spec/005-galeria/spec.md`

---

## Summary

Implementar la galería pública con grilla responsive y lightbox navegable (teclado + swipe), y el panel admin para subir imágenes (drag & drop, múltiples archivos, hasta 10 a la vez), reordenar con drag-and-drop y eliminar con limpieza automática de Supabase Storage. Las imágenes se convierten a WebP y se comprimen en el servidor antes de subirlas usando `sharp`.

---

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+
**Primary Dependencies**: Next.js 14, `sharp` (compresión WebP server-side), `yet-another-react-lightbox`, `@dnd-kit/core` (drag-and-drop), Supabase Storage, shadcn/ui
**Storage**: PostgreSQL via Supabase — tabla `galeria`; archivos en Supabase Storage bucket `galeria`
**Testing**: Vitest (unit: validación MIME, compresión), Playwright (E2E: subir imagen → aparece en galería)
**Target Platform**: Web mobile-first — swipe en lightbox en iOS/Android
**Performance Goals**: Galería de 50 imágenes carga en <3s (lazy loading + WebP); lightbox abre en <500ms
**Constraints**: Archivos máx. 10MB antes de compresión; solo JPG/PNG/WebP aceptados; sin archivos huérfanos en Storage
**Scale/Scope**: ~50–300 imágenes históricas; subidas en batch de hasta 10 a la vez

---

## Constitution Check

| Gate | Estado | Detalle |
|------|--------|---------|
| ¿Conversión WebP en servidor o cliente? | ✅ Pasa | `sharp` en Server Action/Route Handler — nunca en cliente |
| ¿Se evitan archivos huérfanos? | ✅ Requiere atención | Al eliminar de DB, la Server Action DEBE eliminar de Storage en la misma operación |
| ¿Lightbox accesible con teclado? | ✅ Pasa | `yet-another-react-lightbox` soporta flechas + Escape nativamente |
| ¿Paginación antes de los 20 imágenes? | ✅ Requiere atención | Implementar paginación desde el inicio — no esperar a que haya 20+ |

---

## Project Structure

### Documentation (this feature)

```text
spec/005-galeria/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── (public)/
│   └── galeria/
│       └── page.tsx                        # Galería pública — SSR con paginación
│
├── (admin)/
│   └── admin/
│       └── galeria/
│           └── page.tsx                    # Panel de gestión de imágenes
│
└── api/
    └── upload/
        └── galeria/
            └── route.ts                    # Route Handler POST: procesa y sube imágenes

components/
├── galeria/
│   ├── GaleriaGrid.tsx                     # Grilla pública responsive con lazy loading
│   ├── GaleriaLightbox.tsx                 # Lightbox (yet-another-react-lightbox)
│   └── GaleriaPagination.tsx              # Paginación numérica
└── admin/
    └── galeria/
        ├── ImageUploadZone.tsx             # Zona drag & drop para subir imágenes
        ├── ImagePreviewGrid.tsx            # Preview de imágenes antes de confirmar subida
        ├── GaleriaAdminGrid.tsx            # Grilla admin con drag-and-drop para reordenar
        └── ImageCard.tsx                  # Card de imagen en admin con botón eliminar

lib/
├── queries/
│   └── galeria.ts                          # getImagenesGaleria(page, limit), countImagenes()
├── actions/
│   └── galeria.ts                          # deleteImagen(), updateOrden(ids[])
└── utils/
    └── imageProcessing.ts                 # processImage(buffer): validar MIME + comprimir con sharp
```

**Structure Decision**: La subida de imágenes usa un Route Handler (`/api/upload/galeria`) en lugar de Server Action porque `sharp` requiere manejar `Buffer` directamente y el tamaño de los archivos excede lo recomendado para Server Actions. El resto de mutaciones (eliminar, reordenar) usan Server Actions.

---

## Fases de Implementación

### Fase 0 — Migración y Storage
1. Crear migración `supabase/migrations/003_crear_tabla_galeria.sql`.
2. Schema: `id, titulo (TEXT), descripcion (TEXT), url (TEXT NOT NULL), categoria (TEXT), orden (INT DEFAULT 0), created_at`.
3. Crear bucket `galeria` en Supabase Storage con política pública de lectura.
4. RLS tabla: lectura pública; escritura solo auth.

### Fase 1 — Route Handler de subida con `sharp`
1. Route Handler `POST /api/upload/galeria`:
   - Parsear `multipart/form-data` con `request.formData()`.
   - Validar MIME type: aceptar solo `image/jpeg`, `image/png`, `image/webp`.
   - Validar tamaño: rechazar >10MB antes de procesar.
   - Procesar con `sharp`: convertir a WebP, comprimir al 80%, redimensionar máx. 1920px de ancho.
   - Generar nombre único: `${uuid()}.webp`.
   - Subir a Supabase Storage bucket `galeria`.
   - Insertar registro en tabla `galeria` con la URL pública.
   - Retornar URL pública de la imagen.
2. Manejar errores: respuesta 400 para tipo inválido, 413 para tamaño, 500 para fallo de Storage.

### Fase 2 — Panel admin: subida y gestión
1. `ImageUploadZone`: drop zone con `dragover`/`drop` events + input `type="file" multiple accept="image/*"`. Límite de 10 archivos por batch.
2. Al seleccionar archivos: mostrar `ImagePreviewGrid` con preview local (`URL.createObjectURL`) antes de confirmar.
3. Al confirmar: llamar al Route Handler para cada archivo en paralelo con `Promise.all`.
4. Mostrar progreso por imagen (loading spinner individual).
5. `GaleriaAdminGrid` con `@dnd-kit`: drag-and-drop para reordenar. Al soltar, llamar `updateOrden(newOrderIds[])` Server Action que hace UPDATE masivo.
6. Botón eliminar por imagen con modal de confirmación → Server Action `deleteImagen(id, url)` que borra de DB y de Storage.

### Fase 3 — Galería pública con lightbox
1. Query `getImagenesGaleria(page=1, limit=20)`: SELECT ORDER BY `orden ASC, created_at DESC` con OFFSET/LIMIT.
2. Página `/galeria`: Server Component que fetcha primera página. Paginación via URL params (`?pagina=2`).
3. `GaleriaGrid`: CSS grid responsive (2 cols mobile, 3 tablet, 4 desktop). `next/image` con `loading="lazy"` y `sizes` responsivos.
4. `GaleriaLightbox`: integrar `yet-another-react-lightbox`. Pasar array de imágenes al abrir. Habilitar plugins: `Thumbnails`, `Zoom`.
5. Al hacer click en imagen: abrir lightbox en el índice correcto.
6. Estado vacío: mostrar mensaje "Próximamente fotos de nuestras actividades" si no hay imágenes.

---

## Complexity Tracking

| Violación | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Route Handler en lugar de Server Action para subida | `sharp` requiere manejo de Buffer binario; Server Actions no son ideales para archivos grandes | La alternativa (subir directo desde cliente a Storage) expone la `service_role` key en el browser |
