# Tasks: Gestión de Actividades

**Branch**: `004-actividades`
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

> **Dependencias**: `001-autenticacion-admin` para el panel. `003-avisos` para reutilizar `RichTextEditor`, `slugify`, `sanitizeHtml`.

---

## Fase 0 — Migración y Storage

- [ ] **T001** Crear migración `supabase/migrations/003_crear_tabla_actividades.sql` con schema completo
- [ ] **T002** Agregar CHECK constraint en `categoria`: `CHECK (categoria IN ('taller','deporte','cultural','apoyo-estudiantil','otro'))`
- [ ] **T003** Configurar RLS: lectura pública para `activa = true`; escritura solo auth
- [ ] **T004** Crear bucket `actividades` en Supabase Storage con lectura pública
- [ ] **T005** Agregar imágenes placeholder por categoría en `public/placeholders/`: `taller.webp`, `deporte.webp`, `cultural.webp`, `apoyo-estudiantil.webp`, `otro.webp`
- [ ] **T006** Insertar actividades de prueba en `supabase/seed.sql`: al menos 2 futuras, 1 pasada, de distintas categorías

---

## Fase 1 — Constantes y utilidades

- [ ] **T007** Crear `lib/utils/categorias.ts` con array `CATEGORIAS`: `[{ value, label, color, icon }]` para las 5 categorías
- [ ] **T008** Crear `lib/utils/placeholders.ts`: map `{ categoria → '/placeholders/categoria.webp' }`
- [ ] **T009** Crear `lib/validations/actividades.ts` con `ActividadSchema` Zod, incluyendo `refine` para validar `fecha_fin > fecha_inicio` cuando ambas existen

---

## Fase 2 — Queries

- [ ] **T010** Implementar `getActividades(categoria?: string)`: SELECT WHERE `activa = true` + filtro opcional, ORDER BY `fecha_inicio ASC`
- [ ] **T011** Implementar `getActividadBySlug(slug)`: SELECT WHERE `slug = $1 AND activa = true`
- [ ] **T012** Implementar `getProximasActividades()`: SELECT WHERE `activa = true AND fecha_inicio > NOW()` ORDER BY `fecha_inicio ASC` LIMIT 3
- [ ] **T013** Implementar `getAllActividadesAdmin()`: SELECT sin filtro de activa (para tabla del panel)

---

## Fase 3 — Componente de filtros y listado público

- [ ] **T014** Crear `FiltrosCategorias.tsx` Client Component: botones para cada categoría + "Todas". Al click: `router.replace('/actividades?categoria=valor')` usando `useRouter` y `useSearchParams`
- [ ] **T015** Crear `ActividadCard.tsx`: título, fecha formateada, badge categoría con color de `CATEGORIAS`, imagen con fallback al placeholder, badge "Finalizada" si `fecha_inicio < new Date()`
- [ ] **T016** Crear `ActividadesGrid.tsx`: grid 1→2→3 columnas, acepta prop `actividades` tipada
- [ ] **T017** Crear `app/(public)/actividades/page.tsx` Server Component que lee `searchParams.categoria` y llama a `getActividades(categoria)`. ISR `revalidate: 30`
- [ ] **T018** Agregar estado vacío si no hay actividades en la categoría seleccionada
- [ ] **T019** Verificar que la URL `/actividades?categoria=taller` es independientemente navegable (SEO correcto)

---

## Fase 4 — Detalle de actividad

- [ ] **T020** Crear `app/(public)/actividades/[slug]/page.tsx` con `generateStaticParams` para actividades futuras
- [ ] **T021** Crear `ActividadDetalle.tsx`: imagen hero, título, descripción HTML sanitizada, fecha inicio/fin, ubicación, capacidad, badge categoría
- [ ] **T022** Retornar `notFound()` si la actividad no existe o `activa = false`
- [ ] **T023** Agregar JSON-LD schema `Event` con nombre, fecha, ubicación para SEO de Google Events
- [ ] **T024** Agregar link "← Volver a actividades" que preserva el query param de categoría si viene de allí

---

## Fase 5 — Formulario admin con fechas

- [ ] **T025** Crear `DateRangePicker.tsx`: dos inputs `datetime-local` estilizados con shadcn. Mostrar error de validación si `fecha_fin <= fecha_inicio`
- [ ] **T026** Crear `ActividadForm.tsx` compartido: título, editor TipTap (reutilizar de `003-avisos`), `DateRangePicker`, selector de categoría (`Select` shadcn), ubicación (input), capacidad (input numérico opcional), upload de imagen con preview
- [ ] **T027** En el selector de categoría: mostrar ícono + label de `CATEGORIAS` en cada opción
- [ ] **T028** Al no subir imagen: asignar automáticamente el placeholder de la categoría seleccionada

---

## Fase 6 — Server Actions CRUD

- [ ] **T029** Implementar `createActividad(formData)`: validar Zod (con refine fechas) → slug único → sanitizar HTML → subir imagen o asignar placeholder → INSERT → `revalidatePath('/actividades')` + `revalidatePath('/')`
- [ ] **T030** Implementar `updateActividad(id, formData)`: igual a create pero UPDATE; mantener slug salvo que cambie el título
- [ ] **T031** Implementar `deleteActividad(id)`: DELETE de DB → limpiar imagen de Storage si no es placeholder → `revalidatePath`
- [ ] **T032** Implementar `toggleActiva(id, activa)`: UPDATE `activa` → `revalidatePath`

---

## Fase 7 — Panel admin

- [ ] **T033** Crear `app/(admin)/admin/actividades/page.tsx` con `ActividadesAdminTable`
- [ ] **T034** Crear `ActividadesAdminTable.tsx`: columnas título, categoría (badge), fecha inicio, estado (activo/inactivo), acciones
- [ ] **T035** Agregar filtro en tabla: Todas / Activas / Inactivas / Pasadas
- [ ] **T036** Crear `app/(admin)/admin/actividades/nueva/page.tsx` con `ActividadForm` en modo creación
- [ ] **T037** Crear `app/(admin)/admin/actividades/[id]/editar/page.tsx` con `ActividadForm` pre-cargado
- [ ] **T038** Reutilizar `ConfirmDeleteDialog` de `003-avisos`

---

## Criterios de Done

- [ ] `/actividades` muestra todas las actividades activas ordenadas por fecha próxima
- [ ] Filtro por categoría actualiza la URL y el resultado sin recargar la página
- [ ] URL filtrada es compartible y funciona al abrirla directamente
- [ ] Badge "Finalizada" aparece en actividades con fecha pasada
- [ ] Admin puede crear actividad con categoría "Apoyo Estudiantil" y aparece bajo ese filtro
- [ ] Validación impide `fecha_fin <= fecha_inicio`
