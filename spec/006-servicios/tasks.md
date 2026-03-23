# Tasks: Página de Servicios

**Branch**: `006-servicios`
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

> **Dependencias**: `001-autenticacion-admin` para el panel. `@dnd-kit` ya instalado en `005-galeria`.

---

## Fase 0 — Migración y seed

- [ ] **T001** Crear migración `supabase/migrations/005_crear_tabla_servicios.sql`: `id UUID, nombre TEXT NOT NULL, descripcion TEXT NOT NULL, icono TEXT DEFAULT 'Star', activo BOOL DEFAULT true, orden INT DEFAULT 0`
- [ ] **T002** Configurar RLS: lectura pública para `activo = true`; escritura solo auth
- [ ] **T003** Insertar seed en `supabase/seed.sql` con 5 servicios de ejemplo (Talleres, Deportes, Apoyo Escolar, Actividades Culturales, Reuniones Vecinales) con íconos Lucide apropiados

---

## Fase 1 — Utilidades e íconos

- [ ] **T004** Crear `lib/utils/icons.ts` con `ICONOS_DISPONIBLES`: array de ~30 nombres de íconos Lucide curados para servicios comunitarios (`BookOpen`, `Heart`, `Users`, `GraduationCap`, `Music`, `Dumbbell`, `Home`, `Leaf`, `Star`, `HandHeart`, etc.)
- [ ] **T005** Crear helper `getDynamicIcon(name: string)`: retorna el componente Lucide correspondiente al nombre, con fallback a `Star` si el nombre no existe

---

## Fase 2 — Queries y validaciones

- [ ] **T006** Crear `lib/validations/servicios.ts` con `ServicioSchema` Zod: nombre mín. 3 chars, descripción mín. 10 chars, ícono requerido
- [ ] **T007** Implementar `getServiciosActivos()` en `lib/queries/servicios.ts`: SELECT WHERE `activo = true` ORDER BY `orden ASC`
- [ ] **T008** Implementar `getAllServiciosAdmin()`: SELECT sin filtro de activo para la tabla del panel

---

## Fase 3 — Página pública

- [ ] **T009** Crear `ServicioCard.tsx`: renderizar ícono dinámico con `getDynamicIcon(servicio.icono)`, nombre en bold, descripción en texto secundario. Card con hover effect sutil
- [ ] **T010** Crear `ServiciosGrid.tsx`: grid 1→2→3 columnas responsive
- [ ] **T011** Crear `app/(public)/servicios/page.tsx` SSR con `revalidate: 60`
- [ ] **T012** Agregar estado vacío: "Próximamente información sobre nuestros servicios"
- [ ] **T013** Agregar `generateMetadata()` con título y descripción de la página

---

## Fase 4 — Selector visual de íconos

- [ ] **T014** Crear `IconSelector.tsx` Client Component: grid de íconos de `ICONOS_DISPONIBLES`, cada uno clickeable con tooltip del nombre
- [ ] **T015** El ícono seleccionado se resalta con borde teal y fondo suave
- [ ] **T016** El nombre del ícono seleccionado se guarda en un input hidden del formulario
- [ ] **T017** Incluir campo de búsqueda por nombre dentro del selector para facilitar encontrar el ícono correcto

---

## Fase 5 — Server Actions CRUD

- [ ] **T018** Implementar `createServicio(formData)`: validar Zod → INSERT con `orden = MAX(orden) + 1` → `revalidatePath('/servicios')`
- [ ] **T019** Implementar `updateServicio(id, formData)`: validar Zod → UPDATE → `revalidatePath`
- [ ] **T020** Implementar `deleteServicio(id)`: DELETE → `revalidatePath`
- [ ] **T021** Implementar `toggleActivo(id, activo)`: UPDATE `activo` → `revalidatePath`
- [ ] **T022** Implementar `updateOrden(ids: string[])`: UPDATE masivo de `orden` según índice en array (reutilizar patrón de `005-galeria`)

---

## Fase 6 — Panel admin

- [ ] **T023** Crear `ServicioForm.tsx`: campos nombre (input), descripción (textarea), ícono (`IconSelector`), activo (checkbox). Sin WYSIWYG — textarea simple es suficiente
- [ ] **T024** Crear `ServiciosAdminList.tsx` con `@dnd-kit/sortable`: lista drag-and-drop. Cada ítem muestra ícono, nombre, toggle activo/inactivo y botón eliminar
- [ ] **T025** Crear `app/(admin)/admin/servicios/page.tsx` que muestra `ServiciosAdminList` + botón "Nuevo Servicio"
- [ ] **T026** Crear `app/(admin)/admin/servicios/[id]/editar/page.tsx` con `ServicioForm` pre-cargado
- [ ] **T027** Al reordenar drag-and-drop: llamar `updateOrden` y mostrar toast "Orden guardado"
- [ ] **T028** Reutilizar `ConfirmDeleteDialog` de `003-avisos`

---

## Criterios de Done

- [ ] `/servicios` muestra solo servicios activos en el orden configurado
- [ ] Ícono se renderiza correctamente para los ~30 disponibles
- [ ] Admin puede crear, editar, eliminar, activar/desactivar y reordenar servicios
- [ ] Cambios visibles en sitio público en ≤ 60 segundos
- [ ] Estado vacío correcto si todos los servicios están desactivados
