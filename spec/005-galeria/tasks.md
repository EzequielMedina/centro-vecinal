# Tasks: Galería de Imágenes

**Branch**: `005-galeria`
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

> **Dependencias**: `001-autenticacion-admin` para el panel admin.

---

## Fase 0 — Migración y Storage

- [ ] **T001** Crear migración `supabase/migrations/004_crear_tabla_galeria.sql` con schema: `id, titulo, descripcion, url, categoria, orden (DEFAULT 0), created_at`
- [ ] **T002** Configurar RLS: lectura pública sin restricción; INSERT/DELETE solo auth
- [ ] **T003** Crear bucket `galeria` en Supabase Storage con política de lectura pública
- [ ] **T004** Instalar `sharp`: `npm install sharp`
- [ ] **T005** Instalar `@dnd-kit/core` y `@dnd-kit/sortable`: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- [ ] **T006** Instalar `yet-another-react-lightbox`: `npm install yet-another-react-lightbox`

---

## Fase 1 — Procesamiento de imágenes (Route Handler)

- [ ] **T007** Crear `lib/utils/imageProcessing.ts`: función `processImage(buffer, mimeType)` que valida MIME (`image/jpeg`, `image/png`, `image/webp`) y convierte a WebP con `sharp` (calidad 80, ancho máx. 1920px)
- [ ] **T008** Crear Route Handler `app/api/upload/galeria/route.ts` con método POST
- [ ] **T009** En el Route Handler: parsear `multipart/form-data`, validar tipo MIME → rechazar con 400 si inválido
- [ ] **T010** En el Route Handler: validar tamaño ≤ 10MB → rechazar con 413 si supera
- [ ] **T011** En el Route Handler: procesar con `processImage()` → generar nombre `${uuid()}.webp` → subir a Storage bucket `galeria`
- [ ] **T012** En el Route Handler: INSERT en tabla `galeria` con la URL pública → retornar `{ url, id }`
- [ ] **T013** Test unitario para `processImage`: verificar que rechaza PDFs y acepta JPG/PNG/WebP

---

## Fase 2 — Queries y Server Actions

- [ ] **T014** Implementar `getImagenesGaleria(page, limit)` en `lib/queries/galeria.ts`: SELECT ORDER BY `orden ASC, created_at DESC` con OFFSET/LIMIT
- [ ] **T015** Implementar `countImagenes()`: SELECT COUNT(*) para calcular páginas totales
- [ ] **T016** Implementar Server Action `deleteImagen(id, url)`: DELETE de DB + eliminar archivo de Storage (sin dejar huérfanos) + `revalidatePath('/galeria')`
- [ ] **T017** Implementar Server Action `updateOrden(ids: string[])`: UPDATE masivo del campo `orden` según el índice en el array

---

## Fase 3 — Panel admin: subida de imágenes

- [ ] **T018** Crear `ImageUploadZone.tsx` Client Component: zona drag & drop con eventos `dragover`/`drop` + input `type="file" multiple accept="image/*"`. Límite: 10 archivos por batch
- [ ] **T019** Al seleccionar archivos: generar previews locales con `URL.createObjectURL()` y mostrar en `ImagePreviewGrid.tsx`
- [ ] **T020** `ImagePreviewGrid.tsx`: grid de previews con nombre del archivo, tamaño y botón para quitar del batch antes de subir
- [ ] **T021** Al confirmar subida: llamar al Route Handler para cada archivo con `Promise.all`. Mostrar spinner de carga individual por imagen
- [ ] **T022** En error de subida: mostrar mensaje específico por imagen fallida (tipo inválido, tamaño excedido, error de red)
- [ ] **T023** Post-subida exitosa: limpiar previews y actualizar la grilla admin con las nuevas imágenes

---

## Fase 4 — Panel admin: organización

- [ ] **T024** Crear `GaleriaAdminGrid.tsx` con `@dnd-kit/sortable`: grilla drag-and-drop de `ImageCard` componentes
- [ ] **T025** Crear `ImageCard.tsx` para el panel: imagen con `next/image`, título (editable inline opcionalmente), botón eliminar
- [ ] **T026** Al soltar en nuevo orden: llamar Server Action `updateOrden(newOrderIds[])` y mostrar toast de confirmación
- [ ] **T027** Botón eliminar en cada `ImageCard`: abrir `ConfirmDeleteDialog` → en confirmar, llamar `deleteImagen(id, url)`
- [ ] **T028** Crear `app/(admin)/admin/galeria/page.tsx` que combina `ImageUploadZone` + `GaleriaAdminGrid`

---

## Fase 5 — Galería pública con lightbox

- [ ] **T029** Crear `GaleriaGrid.tsx`: CSS grid 2→3→4 columnas. Cada imagen con `next/image loading="lazy"` y `sizes` responsivo
- [ ] **T030** Crear `GaleriaLightbox.tsx` Client Component con `yet-another-react-lightbox`. Recibe array de imágenes y índice de apertura. Habilitar plugins `Thumbnails` y `Zoom`
- [ ] **T031** Manejar swipe en mobile: `yet-another-react-lightbox` lo incluye nativamente — verificar en iOS y Android
- [ ] **T032** Crear `GaleriaPagination.tsx`: links de paginación numérica via URL params (`?pagina=N`)
- [ ] **T033** Crear `app/(public)/galeria/page.tsx` Server Component: leer `searchParams.pagina`, llamar `getImagenesGaleria(page, 20)` y `countImagenes()`
- [ ] **T034** Agregar estado vacío: "Próximamente fotos de nuestras actividades" cuando la galería está vacía
- [ ] **T035** Verificar que el lightbox se cierra con tecla Escape y navega con flechas del teclado

---

## Criterios de Done

- [ ] Imágenes JPG/PNG/WebP se suben, procesan a WebP y aparecen en la galería pública
- [ ] Archivos no-imagen y >10MB son rechazados con mensaje claro
- [ ] Lightbox abre, navega con flechas/swipe y cierra con Escape
- [ ] Al eliminar una imagen: desaparece de la galería pública Y del Storage (0 huérfanos)
- [ ] El orden drag-and-drop se refleja en la galería pública
- [ ] Galería de 50 imágenes carga en <3s con lazy loading
