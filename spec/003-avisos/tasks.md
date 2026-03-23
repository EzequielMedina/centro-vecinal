# Tasks: Gestión de Avisos

**Branch**: `003-avisos`
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

> **Dependencia**: Requiere `001-autenticacion-admin` completado para el panel admin.

---

## Fase 0 — Migración y Storage

- [ ] **T001** Crear migración `supabase/migrations/002_crear_tabla_avisos.sql` con schema completo
- [ ] **T002** Agregar trigger `updated_at` con función `moddatetime` en la migración
- [ ] **T003** Configurar RLS: lectura pública solo para `activo = true`; INSERT/UPDATE/DELETE solo para roles autenticados
- [ ] **T004** Crear bucket `avisos` en Supabase Storage con política de lectura pública
- [ ] **T005** Insertar 3 avisos de prueba en `supabase/seed.sql` (uno destacado, uno inactivo, uno normal)

---

## Fase 1 — Utilidades base

- [ ] **T006** Crear `lib/utils/slugify.ts`: función `slugify(texto)` que normaliza acentos, reemplaza espacios por guiones, lowercase
- [ ] **T007** Crear `lib/utils/slugify.ts`: función `uniqueSlug(titulo, supabase)` que verifica existencia en DB y agrega sufijo numérico si colisiona
- [ ] **T008** Crear `lib/utils/sanitize.ts`: función `sanitizeHtml(html)` usando `isomorphic-dompurify` para ejecución server-side
- [ ] **T009** Crear `lib/utils/stripHtml.ts`: función `stripHtml(html)` para generar resúmenes de texto plano en las cards

---

## Fase 2 — Queries y validaciones

- [ ] **T010** Crear `lib/validations/avisos.ts` con `AvisoCreateSchema` y `AvisoUpdateSchema` (Zod)
- [ ] **T011** Implementar `getAvisos()`: SELECT WHERE `activo = true` ORDER BY `created_at DESC`
- [ ] **T012** Implementar `getAvisoBySlug(slug)`: SELECT WHERE `slug = $1 AND activo = true`
- [ ] **T013** Implementar `getAvisosDestacados()`: SELECT WHERE `destacado = true AND activo = true` LIMIT 3
- [ ] **T014** Implementar `getAllAvisosAdmin()`: SELECT sin filtro de activo (para la tabla del panel)

---

## Fase 3 — Listado y detalle público

- [ ] **T015** Crear `AvisoCard.tsx`: título, fecha (`Intl.DateTimeFormat` en español AR), imagen `next/image`, resumen (strip HTML + 150 chars), link al slug
- [ ] **T016** Crear `AvisosGrid.tsx`: grid 1→2→3 columnas responsive
- [ ] **T017** Crear `app/(public)/avisos/page.tsx` con ISR `revalidate: 30`, estado vacío si no hay avisos
- [ ] **T018** Crear `app/(public)/avisos/[slug]/page.tsx` con `generateStaticParams` para los 10 más recientes
- [ ] **T019** Renderizar HTML del cuerpo del aviso con `dangerouslySetInnerHTML` (el contenido fue sanitizado al guardar)
- [ ] **T020** Retornar `notFound()` si el aviso no existe o `activo = false`
- [ ] **T021** Agregar `generateMetadata()` en la página de detalle con título y descripción del aviso

---

## Fase 4 — Editor WYSIWYG

- [ ] **T022** Instalar TipTap: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`
- [ ] **T023** Crear `components/admin/RichTextEditor.tsx` Client Component con toolbar: negrita, cursiva, listas ordenadas/desordenadas, links
- [ ] **T024** Estilizar el contenido del editor con clase `prose` de Tailwind Typography
- [ ] **T025** Exponer el valor HTML del editor al formulario padre via `onChange` prop

---

## Fase 5 — Server Actions CRUD

- [ ] **T026** Implementar `createAviso(formData)`: validar Zod → slug único → sanitizar HTML → verificar máx. 3 destacados si aplica → subir imagen → INSERT → `revalidatePath`
- [ ] **T027** Implementar `updateAviso(id, formData)`: igual a create pero UPDATE; regenerar slug solo si cambió el título
- [ ] **T028** Implementar `deleteAviso(id)`: obtener `imagen_url` → DELETE de DB → eliminar de Storage si tenía imagen → `revalidatePath`
- [ ] **T029** Implementar `toggleActivo(id, activo)`: UPDATE `activo` → `revalidatePath`
- [ ] **T030** En `createAviso` y `updateAviso`: si `destacado = true`, verificar `COUNT(*) WHERE destacado = true AND activo = true < 3`; retornar error si ya hay 3

---

## Fase 6 — Panel admin

- [ ] **T031** Crear `AvisoForm.tsx` compartido para crear y editar: campos título, editor WYSIWYG, toggle destacado, upload imagen con preview
- [ ] **T032** Crear `app/(admin)/admin/avisos/page.tsx` con `AvisosAdminTable`
- [ ] **T033** Crear `AvisosAdminTable.tsx`: columnas título, estado (activo/inactivo), destacado (badge), fecha, acciones (editar / toggle / eliminar)
- [ ] **T034** Agregar filtro en tabla: Todos / Activos / Inactivos
- [ ] **T035** Crear `app/(admin)/admin/avisos/nuevo/page.tsx` con `AvisoForm` en modo creación
- [ ] **T036** Crear `app/(admin)/admin/avisos/[id]/editar/page.tsx` con `AvisoForm` pre-cargado
- [ ] **T037** Crear `ConfirmDeleteDialog.tsx` reutilizable (modal shadcn `AlertDialog`)

---

## Criterios de Done

- [ ] `/avisos` muestra listado ordenado por fecha, solo avisos activos
- [ ] `/avisos/[slug]` muestra detalle completo; retorna 404 si inactivo
- [ ] Admin puede crear, editar, eliminar y toggle avisos desde el panel
- [ ] Máximo 3 avisos destacados — el 4to intento devuelve error
- [ ] 0 vulnerabilidades XSS: todo HTML del editor fue sanitizado antes de guardarse
- [ ] Cambios reflejados en sitio público en ≤ 30 segundos
