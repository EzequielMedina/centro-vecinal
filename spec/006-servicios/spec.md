# Feature Specification: Página de Servicios

**Feature Branch**: `006-servicios`
**Created**: 2026-03-23
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vecino consulta qué servicios ofrece el centro (Priority: P1)

Un vecino accede a `/servicios` y puede ver todos los servicios que ofrece el centro vecinal, con descripción clara de cada uno.

**Why this priority**: Muchos vecinos no conocen todo lo que ofrece el centro — esta página es su guía de referencia.

**Independent Test**: Con al menos 2 servicios en la DB, `/servicios` muestra ambos con nombre, descripción e ícono.

**Acceptance Scenarios**:

1. **Given** existen servicios activos en la DB, **When** el vecino accede a `/servicios`, **Then** ve una lista o grilla de servicios con nombre, ícono y descripción de cada uno.
2. **Given** el vecino está en mobile, **When** carga `/servicios`, **Then** los servicios se muestran en una sola columna, legibles sin necesidad de zoom.
3. **Given** no hay servicios activos, **When** el vecino accede a `/servicios`, **Then** ve un mensaje indicando que próximamente habrá información disponible.

---

### User Story 2 - Admin gestiona los servicios desde el panel (Priority: P2)

Un administrador puede crear, editar, reordenar y activar/desactivar servicios desde el panel de administración.

**Why this priority**: Los servicios del centro pueden cambiar con el tiempo — deben poder actualizarse sin intervención técnica.

**Independent Test**: Un admin crea un servicio nuevo y aparece en `/servicios`. Al desactivarlo, deja de aparecer.

**Acceptance Scenarios**:

1. **Given** el admin está en `/admin/servicios`, **When** crea un servicio nuevo con nombre, descripción e ícono, **Then** aparece publicado en `/servicios`.
2. **Given** el admin edita la descripción de un servicio existente, **When** guarda, **Then** la descripción actualizada es visible para los vecinos.
3. **Given** el admin desactiva un servicio, **When** el vecino accede a `/servicios`, **Then** ese servicio no aparece en la lista.
4. **Given** el admin reordena los servicios arrastrándolos, **When** guarda, **Then** la página pública refleja el nuevo orden.

---

### Edge Cases

- ¿Qué pasa si todos los servicios están desactivados?
- ¿Cuántos servicios pueden existir como máximo sin degradar la UX de la página?
- ¿Qué ícono se muestra si no se selecciona ninguno?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar únicamente los servicios con estado activo en la página pública.
- **FR-002**: Los servicios DEBEN mostrarse en el orden definido por el campo `orden`.
- **FR-003**: Cada servicio DEBE tener al menos nombre y descripción como campos obligatorios.
- **FR-004**: El campo ícono DEBE ser seleccionable desde un selector visual de íconos de Lucide React.
- **FR-005**: El admin DEBE poder reordenar servicios mediante drag-and-drop en el panel.
- **FR-006**: Los servicios inactivos NO DEBEN ser visibles en el sitio público.

### Key Entities

- **Servicio**: id, nombre, descripcion, icono (nombre del ícono Lucide), activo (bool), orden (int).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un vecino puede entender qué hace cada servicio leyendo solo su descripción en la card (sin links externos).
- **SC-002**: Un admin puede agregar o editar un servicio en menos de 2 minutos.
- **SC-003**: Los cambios en servicios se reflejan en el sitio público en menos de 5 segundos.
