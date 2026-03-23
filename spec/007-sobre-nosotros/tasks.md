# Tasks: Página Sobre Nosotros

**Branch**: `007-sobre-nosotros`
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

> **Dependencias**: `001-autenticacion-admin` para el panel. `003-avisos` para reutilizar `RichTextEditor` y `sanitizeHtml`. `@dnd-kit` instalado en `005-galeria`. `sharp` instalado en `005-galeria`.

---

## Fase 0 — Migración y Storage

- [ ] **T001** Crear migración `supabase/migrations/006_crear_tablas_institucional.sql`
- [ ] **T002** Tabla `contenido_institucional`: `id UUID, seccion TEXT CHECK IN ('historia','mision','valores'), contenido TEXT DEFAULT '', updated_at TIMESTAMPTZ`
- [ ] **T003** En la misma migración: INSERT de las 3 filas iniciales con contenido vacío (`historia`, `mision`, `valores`)
- [ ] **T004** Tabla `equipo_miembros`: `id UUID, nombre TEXT NOT NULL, cargo TEXT NOT NULL, foto_url TEXT, orden INT DEFAULT 0, activo BOOL DEFAULT true`
- [ ] **T005** Configurar RLS en ambas tablas: lectura pública; escritura solo auth
- [ ] **T006** Crear bucket `equipo` en Supabase Storage con lectura pública

---

## Fase 1 — Contenido por defecto

- [ ] **T007** Crear `lib/constants/defaultContent.ts` con `DEFAULT_CONTENT` map: `{ historia: '...', mision: '...', valores: '...' }` — textos placeholder institucionales genéricos
- [ ] **T008** En `getContenidoInstitucional()`: si `contenido` está vacío (`''`), retornar el placeholder de `DEFAULT_CONTENT` para esa sección

---

## Fase 2 — Queries y validaciones

- [ ] **T009** Implementar `getContenidoInstitucional()` en `lib/queries/institucional.ts`: SELECT todas las filas de `contenido_institucional`; retornar como map `{ historia, mision, valores }`
- [ ] **T010** Implementar `getEquipoActivo()`: SELECT WHERE `activo = true` ORDER BY `orden ASC`
- [ ] **T011** Implementar `getAllEquipoAdmin()`: SELECT sin filtro de activo para el panel
- [ ] **T012** Crear `lib/validations/institucional.ts`: `SeccionSchema` (contenido mín. 1 char) y `MiembroSchema` (nombre y cargo requeridos, foto opcional)

---

## Fase 3 — Página pública

- [ ] **T013** Crear `SeccionInstitucional.tsx`: recibe `titulo` y `contenido` (HTML). Renderiza con `dangerouslySetInnerHTML`. Heading con estilos del sistema de diseño
- [ ] **T014** Crear `ValoresSection.tsx`: puede tener layout especial (grid de íconos o lista con bullets visuales)
- [ ] **T015** Crear `EquipoGrid.tsx`: grid 2→3→4 columnas de cards. Cada card: foto circular `next/image`, nombre bold, cargo en texto secundario
- [ ] **T016** Fallback de foto: si `foto_url` es null, mostrar avatar con iniciales del nombre (CSS + primera letra, fondo teal)
- [ ] **T017** Crear `app/(public)/sobre-nosotros/page.tsx` Server Component con `Promise.all([getContenidoInstitucional(), getEquipoActivo()])`. ISR `revalidate: 300`
- [ ] **T018** Agregar `generateMetadata()` con título y descripción de la página

---

## Fase 4 — Panel admin: edición de secciones

- [ ] **T019** Crear `EditorSeccion.tsx`: TipTap reutilizado de `003-avisos`. Recibe `seccion` y `contenidoInicial`. Botón "Guardar cambios" individual por sección
- [ ] **T020** Implementar Server Action `updateSeccion(seccion, contenido)`: sanitizar HTML → UPDATE en DB → `revalidatePath('/sobre-nosotros')`
- [ ] **T021** Crear `app/(admin)/admin/sobre-nosotros/page.tsx` con las 3 secciones en tabs (shadcn `Tabs`): Historia | Misión & Visión | Valores
- [ ] **T022** Mostrar toast de confirmación "Sección guardada correctamente" tras cada guardado exitoso
- [ ] **T023** Mostrar fecha de última actualización bajo cada editor ("Última edición: DD/MM/AAAA HH:mm")

---

## Fase 5 — Panel admin: gestión del equipo

- [ ] **T024** Crear `MiembroForm.tsx`: campos nombre (input), cargo (input), foto (upload con preview). Validación Zod
- [ ] **T025** Upload de foto: procesar con `sharp` a WebP cuadrado 200x200 → subir a bucket `equipo` → guardar URL en DB
- [ ] **T026** Implementar Server Action `createMiembro(formData)`: procesar foto → INSERT con `orden = MAX(orden) + 1` → `revalidatePath`
- [ ] **T027** Implementar Server Action `updateMiembro(id, formData)`: UPDATE → si hay nueva foto, eliminar la anterior de Storage y subir la nueva → `revalidatePath`
- [ ] **T028** Implementar Server Action `deleteMiembro(id)`: obtener `foto_url` → DELETE de DB → eliminar foto de Storage → `revalidatePath`
- [ ] **T029** Implementar Server Action `toggleActivoMiembro(id, activo)`: UPDATE → `revalidatePath`
- [ ] **T030** Crear `EquipoAdminList.tsx` con `@dnd-kit/sortable`: drag-and-drop de miembros. Al reordenar: Server Action `updateOrdenEquipo(ids[])` (mismo patrón que `005-galeria` y `006-servicios`)
- [ ] **T031** Agregar sección "Equipo Directivo" debajo de los tabs de secciones en el panel admin
- [ ] **T032** Botón "Agregar miembro" → abrir `MiembroForm` en dialog modal (shadcn `Dialog`)
- [ ] **T033** Reutilizar `ConfirmDeleteDialog` para eliminar miembros

---

## Criterios de Done

- [ ] `/sobre-nosotros` muestra las 3 secciones con contenido (placeholder o real) y el equipo
- [ ] Nunca se ve una sección vacía — siempre hay contenido por defecto
- [ ] Foto fallback con iniciales funciona cuando no hay foto cargada
- [ ] Admin puede editar cada sección por separado con el editor
- [ ] Admin puede agregar, reordenar, desactivar y eliminar miembros del equipo
- [ ] Fotos del equipo se comprimen a 200x200 WebP antes de guardarse
