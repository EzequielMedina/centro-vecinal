# Feature Specification: Página Sobre Nosotros

**Feature Branch**: `007-sobre-nosotros`
**Created**: 2026-03-23
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vecino conoce la historia y misión del centro (Priority: P1)

Un vecino accede a `/sobre-nosotros` y puede leer la historia del centro vecinal, su misión, valores y quiénes forman parte del equipo directivo.

**Why this priority**: Genera confianza y pertenencia — fundamental para que vecinos nuevos se sientan parte de la comunidad.

**Independent Test**: La página `/sobre-nosotros` carga con contenido institucional legible y estructurado, sin errores, en mobile y desktop.

**Acceptance Scenarios**:

1. **Given** el vecino accede a `/sobre-nosotros`, **When** carga la página, **Then** ve secciones diferenciadas de historia, misión/visión, valores y equipo.
2. **Given** el vecino está en mobile, **When** carga la página, **Then** todas las secciones se ven correctamente sin scroll horizontal.
3. **Given** la sección de equipo tiene miembros cargados, **When** el vecino ve la página, **Then** ve foto, nombre y rol de cada miembro del equipo directivo.

---

### User Story 2 - Admin actualiza el contenido institucional (Priority: P2)

Un administrador puede editar el texto de las secciones de historia, misión y valores directamente desde el panel, sin necesidad de tocar código.

**Why this priority**: La información institucional puede cambiar (nuevas autoridades, cambios en la misión) y no debe requerir un desarrollador para actualizarse.

**Independent Test**: Un admin edita la misión del centro desde el panel y el cambio se refleja en `/sobre-nosotros` inmediatamente.

**Acceptance Scenarios**:

1. **Given** el admin accede a `/admin/sobre-nosotros`, **When** edita el texto de la misión y guarda, **Then** el cambio se refleja en la página pública.
2. **Given** el admin agrega un nuevo miembro al equipo con foto y rol, **When** guarda, **Then** el miembro aparece en la sección de equipo.
3. **Given** el admin elimina un miembro del equipo, **When** confirma, **Then** el miembro ya no aparece en la página pública.

---

### Edge Cases

- ¿Qué se muestra si aún no hay contenido institucional cargado (primera vez)?
- ¿Qué pasa si la foto de un miembro del equipo no carga?
- ¿Tiene un orden fijo la sección de equipo o es configurable?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La página DEBE tener secciones fijas de: Historia, Misión & Visión, Valores, y Equipo Directivo.
- **FR-002**: El contenido de texto DEBE ser editable por administradores desde el panel (editor WYSIWYG).
- **FR-003**: La sección de equipo DEBE mostrar foto, nombre y cargo de cada miembro.
- **FR-004**: El sistema DEBE tener contenido por defecto (placeholder) para el caso de primera carga sin datos.
- **FR-005**: Las fotos del equipo DEBEN aceptar JPG, PNG y WebP con máximo 2MB.

### Key Entities

- **ContenidoInstitucional**: id, seccion (`historia` | `mision` | `valores`), contenido (HTML), updated_at.
- **MiembroEquipo**: id, nombre, cargo, foto_url, orden (int), activo (bool).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La página carga en menos de 2 segundos (contenido mayormente estático).
- **SC-002**: Un admin puede actualizar el texto de una sección en menos de 3 minutos.
- **SC-003**: La página pasa validación WCAG AA de contraste y estructura semántica de headings.
