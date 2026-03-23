# Feature Specification: Gestión de Avisos

**Feature Branch**: `003-avisos`
**Created**: 2026-03-23
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vecino consulta el tablero de avisos (Priority: P1)

Un vecino navega a la sección de avisos y puede leer todos los comunicados del centro vecinal ordenados del más reciente al más antiguo.

**Why this priority**: Es la funcionalidad de comunicación primaria del centro con el barrio.

**Independent Test**: Con al menos 1 aviso en la DB, `/avisos` muestra la lista y `/avisos/[slug]` muestra el detalle completo.

**Acceptance Scenarios**:

1. **Given** existen avisos en la DB, **When** el vecino accede a `/avisos`, **Then** ve una lista con título, fecha, imagen (si tiene) y un resumen del contenido.
2. **Given** el vecino está en la lista de avisos, **When** hace click en un aviso, **Then** navega a `/avisos/[slug]` con el contenido completo renderizado.
3. **Given** el vecino está en `/avisos`, **When** no hay ningún aviso publicado, **Then** ve un mensaje amigable de "No hay avisos publicados por el momento".
4. **Given** el vecino accede desde un celular, **When** carga la lista de avisos, **Then** los avisos se muestran en una columna única, legibles y con imágenes proporcionales.

---

### User Story 2 - Admin publica un nuevo aviso (Priority: P1)

Un administrador puede crear un aviso nuevo desde el panel, con título, contenido enriquecido, imagen opcional y la posibilidad de marcarlo como destacado en el home.

**Why this priority**: Sin esta capacidad, el tablero de avisos no tiene contenido.

**Independent Test**: Un admin crea un aviso y este aparece inmediatamente en `/avisos` visible para cualquier vecino.

**Acceptance Scenarios**:

1. **Given** el admin está en `/admin/avisos`, **When** hace click en "Nuevo Aviso" y completa el formulario, **Then** el aviso aparece publicado en el sitio público al instante.
2. **Given** el admin está creando un aviso, **When** activa el toggle "Destacar en home", **Then** el aviso aparece en la sección de avisos de la página principal.
3. **Given** el admin sube una imagen al aviso, **When** se guarda, **Then** la imagen aparece en la card del listado y en el detalle del aviso.
4. **Given** el admin deja el campo de título vacío, **When** intenta guardar, **Then** ve un error de validación y el aviso no se crea.

---

### User Story 3 - Admin edita o elimina un aviso (Priority: P2)

Un administrador puede modificar el contenido de un aviso existente o eliminarlo, con confirmación antes de borrar.

**Why this priority**: Los avisos pueden contener errores o información que caduca y necesita actualizarse.

**Independent Test**: Un admin edita el título de un aviso y el cambio se refleja en el sitio público inmediatamente. Al eliminar, el aviso desaparece del listado público.

**Acceptance Scenarios**:

1. **Given** el admin está en la lista de avisos del panel, **When** hace click en "Editar" en un aviso, **Then** accede a un formulario pre-cargado con los datos actuales.
2. **Given** el admin modifica el contenido y guarda, **When** un vecino accede al aviso, **Then** ve el contenido actualizado.
3. **Given** el admin hace click en "Eliminar", **When** confirma en el modal de confirmación, **Then** el aviso desaparece de la lista pública y del panel.
4. **Given** el admin hace click en "Eliminar", **When** cancela en el modal de confirmación, **Then** el aviso no se elimina.

---

### User Story 4 - Admin desactiva un aviso sin eliminarlo (Priority: P3)

Un administrador puede ocultar un aviso del sitio público sin eliminarlo permanentemente.

**Why this priority**: Permite archivar avisos sin perder la información histórica.

**Independent Test**: Un admin desactiva un aviso y este deja de aparecer en `/avisos` sin ser eliminado de la DB.

**Acceptance Scenarios**:

1. **Given** el admin desactiva un aviso desde el panel, **When** un vecino accede a `/avisos`, **Then** el aviso no aparece en la lista.
2. **Given** el admin desactiva un aviso, **When** un vecino intenta acceder directamente a `/avisos/[slug]`, **Then** ve una página 404.
3. **Given** el admin reactiva el aviso, **When** recarga el sitio público, **Then** el aviso vuelve a aparecer.

---

### Edge Cases

- ¿Qué pasa si se intenta acceder a `/avisos/[slug]` de un aviso eliminado o inactivo?
- ¿Cuántos avisos pueden destacarse en el home simultáneamente? (máximo 3)
- ¿Qué sucede si la imagen subida supera el tamaño máximo permitido?
- ¿Cómo se genera el slug si dos avisos tienen el mismo título?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar avisos ordenados por fecha de creación descendente (más reciente primero).
- **FR-002**: El sistema DEBE soportar contenido enriquecido (negrita, cursiva, listas, links) en el cuerpo del aviso.
- **FR-003**: El sistema DEBE generar un slug único automáticamente a partir del título al crear un aviso.
- **FR-004**: El sistema DEBE aceptar imágenes en formato JPG, PNG y WebP con un máximo de 5MB.
- **FR-005**: El sistema DEBE limitar a 3 los avisos que pueden estar destacados simultáneamente en el home.
- **FR-006**: Los avisos inactivos NO DEBEN ser accesibles desde el sitio público (ni en listado ni por URL directa).
- **FR-007**: El sistema DEBE sanitizar el contenido HTML del editor WYSIWYG antes de guardarlo (prevención XSS).
- **FR-008**: El sistema DEBE confirmar antes de eliminar un aviso de forma permanente.

### Key Entities

- **Aviso**: id, titulo, slug (único), contenido (HTML), destacado (bool), activo (bool), imagen_url, autor_id, created_at, updated_at.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un admin puede publicar un aviso nuevo (sin imagen) en menos de 2 minutos.
- **SC-002**: Un aviso publicado aparece en el sitio público en menos de 5 segundos.
- **SC-003**: La página de listado de avisos carga correctamente con hasta 100 avisos sin degradación de performance.
- **SC-004**: 0 vulnerabilidades XSS — todo contenido del editor se sanitiza antes de renderizarse.
