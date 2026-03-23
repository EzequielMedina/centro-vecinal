# Tasks: Contacto y Mensajes

**Branch**: `008-contacto`
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

> **Dependencias**: `001-autenticacion-admin` para la bandeja de mensajes en el panel.

---

## Fase 0 — Migración y configuración de Resend

- [ ] **T001** Crear migración `supabase/migrations/007_crear_tabla_contacto.sql`: `id UUID, nombre TEXT NOT NULL, email TEXT NOT NULL, asunto TEXT NOT NULL, mensaje TEXT NOT NULL, leido BOOL DEFAULT false, ip TEXT, created_at TIMESTAMPTZ DEFAULT NOW()`
- [ ] **T002** Configurar RLS: INSERT público (sin auth); SELECT/UPDATE/DELETE solo auth
- [ ] **T003** Crear tabla `rate_limit` en la misma migración: `ip TEXT PRIMARY KEY, count INT DEFAULT 1, window_start TIMESTAMPTZ DEFAULT NOW()`
- [ ] **T004** Crear cuenta en Resend, verificar dominio (o usar dominio de prueba `@resend.dev` inicialmente)
- [ ] **T005** Agregar `RESEND_API_KEY`, `EMAIL_FROM` y `EMAIL_TO` a `.env.local`
- [ ] **T006** Instalar `resend`: `npm install resend`

---

## Fase 1 — Rate limiting

- [ ] **T007** Crear `lib/utils/rateLimit.ts` con función `checkRateLimit(ip: string): Promise<{ allowed: boolean }>`
- [ ] **T008** Lógica: SELECT de `rate_limit` WHERE `ip = $1 AND window_start > NOW() - INTERVAL '10 minutes'`
  - Sin fila existente → INSERT nueva fila → `allowed: true`
  - Fila con `count < 3` → UPDATE `count + 1` → `allowed: true`
  - Fila con `count >= 3` → `allowed: false`
- [ ] **T009** Test unitario: simular 3 envíos permitidos y verificar que el 4to es bloqueado

---

## Fase 2 — Template de email

- [ ] **T010** Instalar `@react-email/components` para crear el template de notificación: `npm install @react-email/components`
- [ ] **T011** Crear `lib/email/notificacion-contacto.tsx`: componente React Email con nombre, email, asunto y mensaje del vecino. Incluir botón "Ver en panel" con link directo al mensaje
- [ ] **T012** Previsualizar el template localmente con React Email dev server para verificar el diseño

---

## Fase 3 — Validación

- [ ] **T013** Crear `lib/validations/contacto.ts` con `ContactoSchema` Zod:
  - `nombre`: string mín. 2 chars, máx. 100 chars
  - `email`: string email válido
  - `asunto`: string mín. 3 chars, máx. 150 chars
  - `mensaje`: string mín. 10 chars, máx. 2000 chars

---

## Fase 4 — Server Action `enviarMensaje`

- [ ] **T014** Crear `lib/actions/contacto.ts` con Server Action `enviarMensaje(formData)`
- [ ] **T015** Paso 1: validar con `ContactoSchema` Zod → retornar errores de campo si falla
- [ ] **T016** Paso 2: obtener IP del request desde header `x-forwarded-for` (con fallback a `'unknown'`)
- [ ] **T017** Paso 3: llamar `checkRateLimit(ip)` → si `allowed: false`, retornar `{ error: 'Demasiados intentos. Intentá de nuevo en 10 minutos.' }`
- [ ] **T018** Paso 4: INSERT en `contacto_mensajes` (guardar IP también para auditoría interna)
- [ ] **T019** Paso 5: en bloque `try/catch` INDEPENDIENTE — enviar email con Resend usando el template. Si falla, `console.error` pero NO propagar el error al cliente
- [ ] **T020** Retornar `{ success: true }` independientemente del resultado del email

---

## Fase 5 — Formulario público

- [ ] **T021** Crear `ContactoForm.tsx` Client Component con React Hook Form + Zod resolver
- [ ] **T022** Campos: nombre (input), email (input type="email"), asunto (input), mensaje (textarea con contador "X/2000 caracteres")
- [ ] **T023** Deshabilitar botón "Enviar" durante el pending del Server Action via `useFormStatus`
- [ ] **T024** Validación inline: mostrar errores en `onBlur` (no solo en submit) para mejor UX mobile
- [ ] **T025** En éxito (`success: true`): reemplazar formulario con `FormSuccessMessage.tsx` — mensaje de confirmación con ícono check y texto "Tu mensaje fue enviado correctamente, te responderemos pronto"
- [ ] **T026** En error de rate limit: mostrar `Alert` destructivo (shadcn) con el mensaje de error
- [ ] **T027** En error genérico: mostrar "Hubo un error al enviar el mensaje. Intentá de nuevo."

---

## Fase 6 — Información de contacto y mapa

- [ ] **T028** Crear `ContactoInfo.tsx`: dirección con ícono `MapPin` (link a Google Maps), horarios con ícono `Clock`, teléfono con link `tel:` e ícono `Phone`, email con link `mailto:` e ícono `Mail`
- [ ] **T029** Crear `GoogleMapEmbed.tsx`: `<iframe>` de Google Maps Embed con la dirección del centro. Atributos: `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`, `allowfullscreen`
- [ ] **T030** Crear `app/(public)/contacto/page.tsx`: layout 2 columnas desktop (formulario | info+mapa), 1 columna mobile (info primero, formulario abajo)
- [ ] **T031** Agregar JSON-LD schema `LocalBusiness` con dirección, teléfono y horarios para SEO
- [ ] **T032** Verificar que en mobile el teléfono con `tel:` abre la app de llamadas del dispositivo

---

## Fase 7 — Bandeja de mensajes en panel admin

- [ ] **T033** Implementar `getMensajes(page)` en `lib/queries/contacto.ts`: SELECT ORDER BY `created_at DESC`, paginación de 20 por página
- [ ] **T034** Implementar `countUnread()`: SELECT COUNT(*) WHERE `leido = false` — usado en el sidebar
- [ ] **T035** Implementar Server Action `marcarLeido(id)`: UPDATE `leido = true` → `revalidatePath('/admin/contacto')`
- [ ] **T036** Implementar Server Action `deleteMensaje(id)`: DELETE → `revalidatePath`
- [ ] **T037** Crear `MensajesTable.tsx`: columnas nombre, asunto, fecha, badge "No leído" (color ámbar) para mensajes sin leer. Filas no leídas con fondo sutilmente diferenciado
- [ ] **T038** Crear `app/(admin)/admin/contacto/page.tsx` con `MensajesTable` y paginación
- [ ] **T039** Crear `app/(admin)/admin/contacto/[id]/page.tsx`: vista detalle del mensaje. Al cargar la página (Server Component), llamar `marcarLeido(id)` automáticamente
- [ ] **T040** Crear `UnreadBadge.tsx` Client Component que recibe `count` y muestra badge numérico ámbar. Usar en `AdminSidebar.tsx` (feature `001`)
- [ ] **T041** En `app/(admin)/admin/layout.tsx`: fetchear `countUnread()` y pasar al `AdminSidebar` para mostrar el badge en el link de Contacto

---

## Criterios de Done

- [ ] Formulario valida todos los campos con mensajes de error claros
- [ ] Botón de envío deshabilitado durante el procesamiento (sin doble submit)
- [ ] Rate limiting bloquea el 4to envío desde la misma IP en 10 minutos
- [ ] Mensaje se guarda en DB aunque el email de Resend falle
- [ ] Admin ve todos los mensajes en el panel con estado leído/no leído
- [ ] Badge de mensajes no leídos visible en el sidebar del panel
- [ ] Abrir el detalle del mensaje lo marca automáticamente como leído
