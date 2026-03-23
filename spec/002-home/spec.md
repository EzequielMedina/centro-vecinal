# Feature Specification: Página de Inicio (Home)

**Feature Branch**: `002-home`
**Created**: 2026-03-23
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vecino visita la página por primera vez (Priority: P1)

Un vecino del barrio entra al sitio web y entiende inmediatamente qué es el centro vecinal, qué ofrece y cómo contactarlo — todo desde la página principal, sin necesidad de navegar a otras páginas.

**Why this priority**: Es la primera impresión del sitio. Define si el vecino sigue navegando o se va.

**Independent Test**: Un vecino puede identificar el nombre del centro, su ubicación y al menos 2 servicios disponibles sin hacer click en ningún link.

**Acceptance Scenarios**:

1. **Given** un vecino accede a la URL raíz `/`, **When** carga la página, **Then** ve el hero con el logo, nombre del centro, una frase descriptiva y un botón de llamada a la acción.
2. **Given** el vecino está en el home, **When** hace scroll, **Then** ve secciones de: avisos destacados, próximas actividades, servicios del centro y datos de contacto/ubicación.
3. **Given** el vecino está en un celular, **When** carga la página, **Then** todos los elementos son legibles y usables sin zoom ni scroll horizontal.

---

### User Story 2 - Vecino ve avisos destacados en el home (Priority: P1)

Los avisos marcados como "destacados" por los admins aparecen en una sección visible del home para que los vecinos se enteren de novedades importantes sin ir a la página de avisos.

**Why this priority**: La comunicación de novedades es la funcionalidad más crítica del centro para los vecinos.

**Independent Test**: Con al menos 1 aviso destacado en la DB, el home muestra ese aviso. Sin avisos, muestra un estado vacío adecuado.

**Acceptance Scenarios**:

1. **Given** existen avisos marcados como destacados en la DB, **When** un vecino carga el home, **Then** ve hasta 3 avisos destacados con título, fecha y un resumen.
2. **Given** un vecino ve un aviso en el home, **When** hace click en él, **Then** navega a `/avisos/[slug]` con el detalle completo.
3. **Given** no hay avisos destacados, **When** un vecino carga el home, **Then** la sección muestra un mensaje amigable ("Próximamente nuevos avisos").

---

### User Story 3 - Vecino ve las próximas actividades (Priority: P2)

Las actividades futuras más próximas aparecen en el home en formato de cards para incentivar la participación.

**Why this priority**: Las actividades son el segundo contenido más relevante para los vecinos.

**Independent Test**: Con actividades futuras en la DB, el home muestra las 3 más próximas ordenadas por fecha.

**Acceptance Scenarios**:

1. **Given** existen actividades con fecha futura en la DB, **When** el vecino carga el home, **Then** ve hasta 3 actividades con título, fecha, categoría e imagen.
2. **Given** el vecino ve una actividad en el home, **When** hace click en "Ver más", **Then** navega al detalle de esa actividad.
3. **Given** no hay actividades futuras, **When** el vecino carga el home, **Then** la sección muestra "No hay actividades programadas por el momento".

---

### User Story 4 - Vecino encuentra datos de contacto rápidamente (Priority: P2)

Desde el home, sin navegar, el vecino puede ver la dirección, horarios y medios de contacto del centro.

**Why this priority**: Muchos vecinos solo necesitan saber dónde queda o cuándo abren — no deben tener que buscar.

**Independent Test**: Los datos de contacto (dirección, horario, teléfono/email) son visibles en el home sin hacer ningún click.

**Acceptance Scenarios**:

1. **Given** el vecino está en el home, **When** hace scroll hasta el footer o la sección de contacto, **Then** ve dirección, horarios de atención y al menos un medio de contacto.
2. **Given** el vecino hace click en la dirección, **Then** se abre Google Maps con la ubicación del centro.

---

### Edge Cases

- ¿Qué se muestra si la DB está vacía (sin avisos ni actividades)?
- ¿Cómo se ve el hero si el logo tarda en cargar?
- ¿Qué pasa con actividades que comenzaron hoy — se muestran como "próximas" o no?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La página DEBE cargar en menos de 3 segundos en conexión 4G estándar.
- **FR-002**: El sistema DEBE mostrar máximo 3 avisos destacados ordenados por fecha de creación descendente.
- **FR-003**: El sistema DEBE mostrar máximo 3 actividades futuras ordenadas por fecha de inicio ascendente.
- **FR-004**: La página DEBE ser completamente funcional en dispositivos móviles desde 320px de ancho.
- **FR-005**: La página DEBE incluir meta tags de SEO (title, description, Open Graph) con información del centro.
- **FR-006**: Los datos de contacto (dirección, horario, teléfono) DEBEN ser visibles sin necesidad de navegar a otra página.
- **FR-007**: El hero DEBE incluir el logo institucional, nombre del centro y una llamada a la acción principal.

### Key Entities

- **Aviso** (referencia): id, titulo, slug, destacado, imagen_url, created_at.
- **Actividad** (referencia): id, titulo, slug, fecha_inicio, categoria, imagen_url.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La página obtiene un score de Performance ≥ 85 en Lighthouse mobile.
- **SC-002**: Un vecino puede identificar el propósito del sitio en menos de 5 segundos (hero claro).
- **SC-003**: El home refleja cambios de contenido (nuevo aviso destacado) en menos de 60 segundos de ser publicados.
- **SC-004**: 100% de los elementos son accesibles con teclado y tienen contraste WCAG AA.
