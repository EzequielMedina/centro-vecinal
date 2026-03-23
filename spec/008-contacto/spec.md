# Feature Specification: Contacto y Mensajes

**Feature Branch**: `008-contacto`
**Created**: 2026-03-23
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vecino envía un mensaje al centro (Priority: P1)

Un vecino accede a `/contacto`, completa el formulario con su nombre, email, asunto y mensaje, y recibe confirmación de que su consulta fue enviada.

**Why this priority**: Es el único canal de comunicación directa vecino→centro del sitio. Sin esto, el sitio es informativo pero no interactivo.

**Independent Test**: Completar y enviar el formulario guarda el mensaje en la DB y muestra feedback de éxito al vecino.

**Acceptance Scenarios**:

1. **Given** el vecino está en `/contacto`, **When** completa todos los campos y hace click en "Enviar", **Then** ve un mensaje de confirmación ("Tu mensaje fue enviado correctamente, te responderemos pronto").
2. **Given** el vecino intenta enviar con algún campo requerido vacío, **When** hace click en enviar, **Then** ve validación inline señalando los campos faltantes y el formulario no se envía.
3. **Given** el vecino ingresa un email con formato inválido (ej. "nombre@"), **When** hace click en enviar, **Then** ve un error de validación en el campo email.
4. **Given** el vecino envía el formulario, **When** lo intenta enviar de nuevo inmediatamente, **Then** el botón está deshabilitado durante el envío para evitar duplicados.
5. **Given** el vecino accede desde mobile, **When** carga `/contacto`, **Then** el formulario es completamente usable con teclado virtual sin elementos solapados.

---

### User Story 2 - Vecino ve la información de contacto y ubicación (Priority: P1)

Además del formulario, el vecino puede ver la dirección física, horarios de atención, teléfono y un mapa integrado en la misma página.

**Why this priority**: Muchos vecinos prefieren ir en persona o llamar antes de completar un formulario.

**Independent Test**: La página `/contacto` muestra dirección, horarios y mapa sin necesidad de hacer click en ningún elemento.

**Acceptance Scenarios**:

1. **Given** el vecino accede a `/contacto`, **When** carga la página, **Then** ve dirección, horarios de atención y teléfono/email del centro visibles sin scroll o con un scroll mínimo.
2. **Given** el vecino hace click en la dirección o en el mapa embebido, **When** interactúa, **Then** puede abrir Google Maps con la ubicación del centro.
3. **Given** el vecino está en mobile, **When** hace click en el número de teléfono, **Then** se abre la app de llamadas del dispositivo.

---

### User Story 3 - Admin ve y gestiona los mensajes recibidos (Priority: P2)

Un administrador puede ver todos los mensajes enviados desde el formulario de contacto, marcarlos como leídos y saber cuántos están pendientes.

**Why this priority**: Sin esta visibilidad, los mensajes de los vecinos quedan en la DB sin que nadie los gestione.

**Independent Test**: Un vecino envía un mensaje y el admin puede verlo en `/admin/contacto` con todos sus datos.

**Acceptance Scenarios**:

1. **Given** un vecino envió un mensaje, **When** el admin accede a `/admin/contacto`, **Then** ve el mensaje en la lista con nombre, asunto, fecha y estado (leído/no leído).
2. **Given** el admin hace click en un mensaje, **When** lo abre, **Then** ve el contenido completo y el mensaje se marca automáticamente como leído.
3. **Given** hay mensajes no leídos, **When** el admin está en el dashboard, **Then** ve un badge con el número de mensajes no leídos en el menú de "Contacto".
4. **Given** el admin quiere limpiar mensajes viejos, **When** elimina un mensaje y confirma, **Then** el mensaje desaparece de la lista.

---

### User Story 4 - Admin recibe notificación por email al llegar un mensaje (Priority: P3)

Cuando un vecino envía un mensaje, el administrador recibe automáticamente un email de notificación con el contenido del mensaje.

**Why this priority**: Los admins no están revisando el panel constantemente — la notificación evita que mensajes queden sin respuesta.

**Independent Test**: Al enviar el formulario de contacto, llega un email a la dirección configurada con los datos del mensaje.

**Acceptance Scenarios**:

1. **Given** un vecino envía el formulario, **When** el backend procesa el envío, **Then** se envía un email a la dirección de administración configurada con nombre, email y mensaje del vecino.
2. **Given** el servicio de email (Resend) falla temporalmente, **When** un vecino envía el formulario, **Then** el mensaje igual se guarda en la DB y el vecino recibe confirmación (el email de notificación es un "nice to have", no bloquea el guardado).

---

### Edge Cases

- ¿Cómo se previene el spam en el formulario? (rate limiting por IP)
- ¿Qué pasa si el servicio de email está caído — se pierde el mensaje?
- ¿Existe un límite de caracteres en el campo mensaje?
- ¿Se guarda el mensaje si el email de notificación falla?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El formulario DEBE tener los campos: nombre (requerido), email (requerido, formato válido), asunto (requerido), mensaje (requerido, mínimo 10 caracteres).
- **FR-002**: El sistema DEBE guardar el mensaje en la DB independientemente del resultado del email de notificación.
- **FR-003**: El sistema DEBE mostrar feedback de éxito o error al vecino tras el envío.
- **FR-004**: El sistema DEBE aplicar rate limiting: máximo 3 mensajes por IP en 10 minutos.
- **FR-005**: El botón de envío DEBE deshabilitarse durante el procesamiento para evitar envíos duplicados.
- **FR-006**: La página DEBE mostrar dirección, horarios de atención y al menos un medio de contacto adicional (teléfono o email).
- **FR-007**: El mapa DEBE embeberse usando Google Maps Embed API (no requiere JS externo complejo).
- **FR-008**: El sistema DEBE enviar email de notificación al admin vía Resend cuando llega un nuevo mensaje.
- **FR-009**: Los admins DEBEN poder marcar mensajes como leídos y eliminarlos.
- **FR-010**: El dashboard del admin DEBE mostrar el contador de mensajes no leídos.

### Key Entities

- **ContactoMensaje**: id, nombre, email, asunto, mensaje, leido (bool), created_at.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un vecino puede completar y enviar el formulario en menos de 2 minutos.
- **SC-002**: El mensaje enviado aparece en el panel admin en menos de 5 segundos.
- **SC-003**: El email de notificación llega al admin en menos de 60 segundos tras el envío.
- **SC-004**: 0 mensajes perdidos por fallo del email — la DB guarda todos los mensajes independientemente del email.
- **SC-005**: El rate limiting bloquea correctamente más de 3 envíos desde la misma IP en 10 minutos.
