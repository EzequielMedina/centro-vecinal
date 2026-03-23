# Feature Specification: Galería de Imágenes

**Feature Branch**: `005-galeria`
**Created**: 2026-03-23
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vecino explora la galería del centro (Priority: P1)

Un vecino accede a `/galeria` y puede ver las fotos de eventos y actividades del centro organizadas en una grilla, con posibilidad de ver cada foto en tamaño completo.

**Why this priority**: La galería humaniza al centro vecinal y genera confianza en los vecinos nuevos.

**Independent Test**: Con imágenes en Supabase Storage, `/galeria` muestra la grilla y al hacer click en una imagen se abre el lightbox con la foto completa.

**Acceptance Scenarios**:

1. **Given** existen imágenes en la galería, **When** el vecino accede a `/galeria`, **Then** ve una grilla responsive de imágenes con título (si tiene) y categoría.
2. **Given** el vecino hace click en una imagen, **When** se abre el lightbox, **Then** puede ver la foto en tamaño completo, navegar a la siguiente/anterior con flechas y cerrar con Escape o el botón X.
3. **Given** el vecino está en mobile, **When** abre el lightbox, **Then** puede navegar entre fotos con swipe horizontal.
4. **Given** no hay imágenes en la galería, **When** el vecino accede a `/galeria`, **Then** ve un mensaje amigable ("Próximamente fotos de nuestras actividades").

---

### User Story 2 - Admin sube imágenes a la galería (Priority: P1)

Un administrador puede subir una o varias imágenes desde su dispositivo, asignarles un título y categoría, y publicarlas inmediatamente.

**Why this priority**: Sin carga de imágenes la galería no tiene contenido.

**Independent Test**: Un admin sube una imagen y aparece en `/galeria` visible para vecinos.

**Acceptance Scenarios**:

1. **Given** el admin está en `/admin/galeria`, **When** arrastra una imagen o hace click en "Subir imagen", **Then** ve el preview de la imagen antes de confirmar la subida.
2. **Given** el admin confirma la subida, **When** se procesa, **Then** la imagen aparece en la galería pública al instante.
3. **Given** el admin sube múltiples imágenes a la vez (hasta 10), **When** todas se procesan, **Then** aparecen en la galería todas juntas.
4. **Given** el admin intenta subir un archivo que no es imagen (ej. PDF), **When** selecciona el archivo, **Then** ve un mensaje de error antes de intentar la subida.
5. **Given** el admin sube una imagen mayor a 10MB, **When** selecciona el archivo, **Then** ve un aviso de que la imagen supera el tamaño máximo.

---

### User Story 3 - Admin organiza y elimina imágenes (Priority: P2)

Un administrador puede eliminar imágenes de la galería y reordenarlas según el orden en que deben mostrarse.

**Why this priority**: La galería necesita mantenimiento — fotos viejas o de baja calidad deben poderse remover.

**Independent Test**: Un admin elimina una imagen y deja de aparecer en la galería pública. El orden de las imágenes restantes se mantiene.

**Acceptance Scenarios**:

1. **Given** el admin está en el panel de galería, **When** hace click en eliminar una imagen y confirma, **Then** la imagen desaparece de la galería pública y de Supabase Storage.
2. **Given** el admin reordena las imágenes arrastrándolas, **When** guarda el nuevo orden, **Then** la galería pública refleja el nuevo orden.

---

### Edge Cases

- ¿Qué pasa si se pierde la conexión a mitad de una subida?
- ¿Se comprimen automáticamente las imágenes para optimizar la carga?
- ¿Qué formato se usa para servir las imágenes — WebP, original?
- ¿Cuántas imágenes puede haber en la galería antes de necesitar paginación?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE aceptar imágenes en formato JPG, PNG y WebP únicamente.
- **FR-002**: El sistema DEBE rechazar archivos mayores a 10MB con mensaje de error claro.
- **FR-003**: El sistema DEBE comprimir y convertir imágenes a WebP automáticamente al subirlas (para optimizar carga).
- **FR-004**: El sistema DEBE mostrar un lightbox al hacer click en cualquier imagen de la galería.
- **FR-005**: El lightbox DEBE permitir navegación con teclado (flechas) y cierre con Escape.
- **FR-006**: El lightbox DEBE soportar swipe en dispositivos táctiles.
- **FR-007**: Al eliminar una imagen, DEBE eliminarse también del Supabase Storage (sin dejar archivos huérfanos).
- **FR-008**: El sistema DEBE mostrar un preview de la imagen antes de confirmar la subida.
- **FR-009**: La galería DEBE ser paginada o usar scroll infinito cuando supere las 20 imágenes.

### Key Entities

- **ImagenGaleria**: id, titulo (nullable), descripcion (nullable), url (Supabase Storage), categoria (nullable), orden (int), created_at.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una imagen sube y aparece en la galería en menos de 10 segundos en conexión estándar.
- **SC-002**: La galería con 50 imágenes carga en menos de 3 segundos (imágenes lazy-loaded).
- **SC-003**: El lightbox abre en menos de 500ms al hacer click en una imagen.
- **SC-004**: 0 archivos huérfanos en Storage — toda imagen eliminada del panel es eliminada también del Storage.
