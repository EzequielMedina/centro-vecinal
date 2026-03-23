# Feature Specification: Gestión de Actividades

**Feature Branch**: `004-actividades`
**Created**: 2026-03-23
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vecino navega el catálogo de actividades (Priority: P1)

Un vecino accede a `/actividades` y puede ver todas las actividades disponibles, filtrarlas por categoría y hacer click para ver el detalle completo de cada una.

**Why this priority**: Las actividades son la razón principal por la que vecinos visitan el sitio.

**Independent Test**: Con actividades de distintas categorías en la DB, `/actividades` muestra la lista completa y los filtros reducen correctamente los resultados.

**Acceptance Scenarios**:

1. **Given** existen actividades en la DB, **When** el vecino accede a `/actividades`, **Then** ve cards con título, fecha, categoría, imagen y un resumen de cada actividad.
2. **Given** el vecino está en `/actividades`, **When** selecciona la categoría "Apoyo Estudiantil", **Then** solo se muestran las actividades de esa categoría.
3. **Given** el vecino hace click en una actividad, **When** navega a `/actividades/[slug]`, **Then** ve el detalle completo: descripción, fecha, horario, ubicación y capacidad.
4. **Given** una actividad ya ocurrió (fecha pasada), **When** el vecino la ve en el listado, **Then** aparece con un badge "Finalizada" diferenciado visualmente.

---

### User Story 2 - Admin crea una nueva actividad (Priority: P1)

Un administrador puede crear una actividad con todos sus datos: título, descripción enriquecida, fechas, ubicación, categoría, capacidad e imagen.

**Why this priority**: Sin creación de actividades, la sección más importante del sitio no tiene contenido.

**Independent Test**: Un admin crea una actividad y aparece inmediatamente en `/actividades` con todos sus datos.

**Acceptance Scenarios**:

1. **Given** el admin está en `/admin/actividades`, **When** hace click en "Nueva Actividad" y completa todos los campos requeridos, **Then** la actividad aparece publicada en el sitio al instante.
2. **Given** el admin selecciona la categoría "Apoyo Estudiantil", **When** guarda la actividad, **Then** aparece correctamente bajo ese filtro en el sitio público.
3. **Given** el admin ingresa una fecha de fin anterior a la fecha de inicio, **When** intenta guardar, **Then** ve un error de validación ("La fecha de fin debe ser posterior al inicio").
4. **Given** el admin no sube imagen, **When** se crea la actividad, **Then** se muestra una imagen de placeholder acorde a la categoría.

---

### User Story 3 - Admin edita o elimina una actividad (Priority: P2)

Un administrador puede modificar los datos de una actividad existente o eliminarla, con confirmación antes de borrar.

**Why this priority**: Actividades pueden cambiar de fecha, ubicación o ser canceladas.

**Independent Test**: Un admin cambia la fecha de una actividad y el cambio se refleja inmediatamente en el detalle público.

**Acceptance Scenarios**:

1. **Given** el admin edita la fecha de una actividad y guarda, **When** un vecino ve el detalle, **Then** ve la fecha actualizada.
2. **Given** el admin elimina una actividad y confirma, **When** un vecino intenta acceder a `/actividades/[slug]`, **Then** recibe una página 404.
3. **Given** el admin desactiva una actividad (sin eliminar), **When** un vecino navega a `/actividades`, **Then** la actividad no aparece en el listado.

---

### User Story 4 - Vecino filtra actividades por categoría desde la URL (Priority: P2)

Los filtros de categoría actualizan la URL (`/actividades?categoria=apoyo-estudiantil`) para que el enlace sea compartible.

**Why this priority**: Permite a los admins compartir por WhatsApp el link directo a una categoría específica.

**Independent Test**: Acceder a `/actividades?categoria=taller` muestra solo talleres y el filtro aparece activo en la UI.

**Acceptance Scenarios**:

1. **Given** el vecino selecciona la categoría "Talleres" en el filtro, **When** se aplica el filtro, **Then** la URL cambia a `/actividades?categoria=taller`.
2. **Given** el vecino comparte el link `/actividades?categoria=taller`, **When** otra persona lo abre, **Then** ve la lista ya filtrada por talleres.
3. **Given** el vecino selecciona "Todas" en el filtro, **When** se aplica, **Then** la URL vuelve a `/actividades` sin parámetros.

---

### User Story 5 - Vecino ve las actividades de apoyo estudiantil (Priority: P2)

Los vecinos pueden acceder fácilmente a todas las actividades de la categoría "Apoyo Estudiantil" para conocer horarios, materias y condiciones.

**Why this priority**: El apoyo estudiantil es uno de los servicios más demandados del centro.

**Independent Test**: Filtrando por categoría "Apoyo Estudiantil" se ven todas las actividades educativas con sus horarios y descripción detallada.

**Acceptance Scenarios**:

1. **Given** el vecino accede a `/actividades?categoria=apoyo-estudiantil`, **When** carga la página, **Then** ve solo actividades de esa categoría con sus días y horarios visibles en la card.
2. **Given** el vecino ve el detalle de una actividad de apoyo estudiantil, **When** lee la descripción, **Then** encuentra información sobre materias, nivel educativo y condiciones de participación.

---

### Edge Cases

- ¿Qué se muestra si no hay actividades en una categoría filtrada?
- ¿Se muestran actividades pasadas? ¿Con qué distinción visual?
- ¿Qué pasa si se accede a `/actividades/[slug]` de una actividad eliminada?
- ¿Se puede crear una actividad sin fecha de fin?
- ¿Cómo se ordenan las actividades — por fecha de creación o por fecha de inicio?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar actividades ordenadas por fecha de inicio ascendente (las más próximas primero).
- **FR-002**: El sistema DEBE permitir filtrar actividades por categoría: `taller`, `deporte`, `cultural`, `apoyo-estudiantil`, `otro`.
- **FR-003**: El sistema DEBE reflejar el filtro activo en la URL como query parameter (`?categoria=`).
- **FR-004**: El sistema DEBE generar un slug único automáticamente a partir del título.
- **FR-005**: El sistema DEBE validar que la fecha de fin (si existe) sea posterior a la fecha de inicio.
- **FR-006**: El sistema DEBE aceptar imágenes en JPG, PNG y WebP con máximo de 5MB.
- **FR-007**: Las actividades inactivas NO DEBEN aparecer en el listado ni ser accesibles por URL directa.
- **FR-008**: El sistema DEBE mostrar un badge diferenciado ("Finalizada") en actividades con fecha de inicio pasada.
- **FR-009**: El campo `capacidad` es opcional; si se ingresa DEBE ser un número entero positivo.

### Key Entities

- **Actividad**: id, titulo, slug (único), descripcion (HTML), fecha_inicio, fecha_fin (nullable), ubicacion, capacidad (nullable), categoria, imagen_url, activa (bool), autor_id, created_at.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un admin puede crear una actividad completa (con imagen) en menos de 3 minutos.
- **SC-002**: El filtro por categoría responde en menos de 500ms sin recargar la página completa.
- **SC-003**: Una actividad publicada aparece en el sitio en menos de 5 segundos.
- **SC-004**: La URL con filtro aplicado es funcional al ser compartida — el destinatario ve el mismo resultado filtrado.
