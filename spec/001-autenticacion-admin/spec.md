# Feature Specification: Autenticación de Administradores

**Feature Branch**: `001-autenticacion-admin`
**Created**: 2026-03-23
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Login de administrador (Priority: P1)

Un administrador del centro vecinal accede a la URL `/admin/login`, ingresa su email y contraseña, y es redirigido al dashboard del panel de administración.

**Why this priority**: Sin autenticación no existe panel admin. Es el prerequisito de todas las demás features administrativas.

**Independent Test**: Se puede testear ingresando a `/admin/login` con credenciales válidas e inválidas, verificando redirección al dashboard o mensaje de error respectivamente.

**Acceptance Scenarios**:

1. **Given** el admin está en `/admin/login`, **When** ingresa email y contraseña correctos y hace click en "Ingresar", **Then** es redirigido a `/admin/dashboard` y ve su nombre en la navbar.
2. **Given** el admin está en `/admin/login`, **When** ingresa credenciales incorrectas, **Then** ve un mensaje de error claro ("Credenciales incorrectas") y permanece en la misma página.
3. **Given** el admin está en `/admin/login`, **When** deja algún campo vacío e intenta ingresar, **Then** ve validación inline antes de enviar el formulario.
4. **Given** el admin tiene una sesión activa, **When** intenta acceder a `/admin/login`, **Then** es redirigido automáticamente a `/admin/dashboard`.

---

### User Story 2 - Protección de rutas admin (Priority: P1)

Cualquier intento de acceder a rutas bajo `/admin/*` sin sesión activa redirige automáticamente al login.

**Why this priority**: Sin esta protección cualquier persona podría acceder al panel admin, comprometiendo toda la gestión de contenido.

**Independent Test**: Acceder a `/admin/dashboard` sin estar autenticado debe redirigir a `/admin/login`.

**Acceptance Scenarios**:

1. **Given** un usuario no autenticado, **When** intenta acceder a cualquier ruta `/admin/*`, **Then** es redirigido inmediatamente a `/admin/login`.
2. **Given** un usuario no autenticado, **When** es redirigido al login, **Then** la URL original queda guardada para redirigirlo allí después de autenticarse.
3. **Given** la sesión de un admin expiró, **When** intenta realizar una acción en el panel, **Then** es redirigido al login con mensaje "Tu sesión expiró, volvé a ingresar".

---

### User Story 3 - Cierre de sesión (Priority: P2)

El administrador puede cerrar sesión desde cualquier pantalla del panel admin.

**Why this priority**: Necesario para seguridad básica, especialmente en dispositivos compartidos.

**Independent Test**: Hacer click en "Cerrar sesión" y verificar que redirige al login y ya no se puede acceder a rutas admin sin volver a autenticarse.

**Acceptance Scenarios**:

1. **Given** el admin está en cualquier página del panel, **When** hace click en "Cerrar sesión", **Then** la sesión se destruye y es redirigido a `/admin/login`.
2. **Given** el admin cerró sesión, **When** intenta navegar hacia atrás en el browser, **Then** no puede acceder a páginas del panel (redirige al login).

---

### User Story 4 - Gestión de admins por superadmin (Priority: P3)

El superadmin puede crear nuevas cuentas de administrador y eliminar existentes desde el panel.

**Why this priority**: Necesario para escalar el equipo de administración, pero no bloquea el MVP.

**Independent Test**: Un superadmin puede crear una cuenta admin nueva y el nuevo usuario puede loguearse con esas credenciales.

**Acceptance Scenarios**:

1. **Given** el superadmin está en `/admin/usuarios`, **When** completa el formulario con nombre, email y contraseña temporal, **Then** se crea la cuenta y aparece en la lista.
2. **Given** el superadmin está en la lista de usuarios, **When** elimina un admin, **Then** ese admin ya no puede iniciar sesión.
3. **Given** un admin (no superadmin) está en el panel, **When** intenta acceder a `/admin/usuarios`, **Then** ve un error 403 y no puede gestionar usuarios.

---

### Edge Cases

- ¿Qué pasa si se intenta crear un admin con un email que ya existe?
- ¿Qué sucede si el superadmin intenta eliminarse a sí mismo?
- ¿Cómo se recupera acceso si se pierde la contraseña del único superadmin?
- ¿Qué pasa si hay múltiples tabs abiertas y la sesión expira en una?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE autenticar admins únicamente con email y contraseña.
- **FR-002**: El sistema DEBE redirigir cualquier request no autenticado a `/admin/login` antes de servir contenido protegido.
- **FR-003**: El sistema DEBE mantener la sesión activa usando cookies `httpOnly` con refresh token.
- **FR-004**: El sistema DEBE cerrar sesión completamente al hacer logout (invalidar token en servidor).
- **FR-005**: Los admins con rol `superadmin` DEBEN poder crear y eliminar cuentas de otros admins.
- **FR-006**: Los admins con rol `admin` NO DEBEN poder acceder al módulo de gestión de usuarios.
- **FR-007**: El sistema DEBE bloquear temporalmente el login tras 5 intentos fallidos consecutivos.
- **FR-008**: Las contraseñas DEBEN tener mínimo 8 caracteres con al menos una mayúscula y un número.

### Key Entities

- **AdminUser**: Representación del administrador. Atributos: id, email, nombre, rol (`admin` | `superadmin`), created_at.
- **Session**: Sesión activa del admin. Manejada por Supabase Auth via JWT + refresh token.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un admin puede completar el proceso de login en menos de 30 segundos.
- **SC-002**: Un request a cualquier ruta `/admin/*` sin sesión activa es redirigido en menos de 200ms.
- **SC-003**: 100% de las rutas admin están protegidas — no existe ninguna ruta admin accesible sin autenticación.
- **SC-004**: El logout invalida la sesión de forma que incluso con el JWT anterior no se puede acceder.
