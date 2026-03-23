# Implementation Plan: Contacto y Mensajes

**Branch**: `008-contacto` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `spec/008-contacto/spec.md`

---

## Summary

Implementar la página pública `/contacto` con formulario de contacto (nombre, email, asunto, mensaje), información institucional (dirección, horarios, teléfono) y mapa embebido de Google Maps. Los mensajes se guardan en la DB y disparan un email de notificación al admin vía Resend. El panel admin tiene una bandeja de mensajes con estado leído/no leído y contador en el dashboard. Rate limiting por IP para prevenir spam.

---

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+
**Primary Dependencies**: Next.js 14 (Server Actions, Route Handlers), React Hook Form, Zod, Resend, shadcn/ui
**Storage**: PostgreSQL via Supabase — tabla `contacto_mensajes`
**Testing**: Vitest (unit: validación Zod, rate limiting), Playwright (E2E: enviar formulario → aparece en panel admin)
**Target Platform**: Web mobile-first; formulario usable con teclado virtual en mobile
**Performance Goals**: Formulario envía y confirma en <3s; mensaje visible en panel en <5s
**Constraints**: Rate limiting: máx. 3 envíos por IP en 10 minutos; email de notificación no bloquea el guardado; mensaje mínimo 10 chars
**Scale/Scope**: ~10–50 mensajes/mes; 1–5 admins revisando la bandeja

---

## Constitution Check

| Gate | Estado | Detalle |
|------|--------|---------|
| ¿El email de notificación puede fallar sin perder el mensaje? | ✅ Requiere atención | Guardar en DB PRIMERO, luego enviar email en bloque `try/catch` independiente |
| ¿Rate limiting con qué mecanismo? | ✅ Pasa | Vercel KV (Redis) o tabla `rate_limit` en Supabase — evaluar según disponibilidad |
| ¿El mapa requiere API key de Maps JS? | ✅ Pasa | Usar Google Maps Embed (iframe) — sin API key, sin JS externo |
| ¿El botón de envío previene doble submit? | ✅ Requiere atención | `disabled` durante pending state del Server Action via `useFormStatus` |

---

## Project Structure

### Documentation (this feature)

```text
spec/008-contacto/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── (public)/
│   └── contacto/
│       └── page.tsx                        # Página pública de contacto
│
└── (admin)/
    └── admin/
        └── contacto/
            ├── page.tsx                    # Bandeja de mensajes recibidos
            └── [id]/
                └── page.tsx               # Detalle de un mensaje

components/
├── contacto/
│   ├── ContactoForm.tsx                   # Formulario de contacto — Client Component
│   ├── ContactoInfo.tsx                   # Dirección, horarios, teléfono, email
│   ├── GoogleMapEmbed.tsx                 # Iframe de Google Maps Embed
│   └── FormSuccessMessage.tsx            # Mensaje de confirmación post-envío
└── admin/
    └── contacto/
        ├── MensajesTable.tsx              # Tabla de mensajes con estado leído/no leído
        ├── MensajeDetalle.tsx            # Vista completa de un mensaje
        └── UnreadBadge.tsx               # Badge con contador — usado en sidebar

lib/
├── queries/
│   └── contacto.ts                        # getMensajes(), getMensajeById(), countUnread()
├── actions/
│   └── contacto.ts                        # enviarMensaje(), marcarLeido(), deleteMensaje()
├── validations/
│   └── contacto.ts                        # Zod: ContactoSchema
├── email/
│   └── notificacion-contacto.tsx         # Template React Email para notificación admin
└── utils/
    └── rateLimit.ts                       # checkRateLimit(ip): boolean
```

**Structure Decision**: Monorepo Next.js. El envío del formulario usa Server Action (`enviarMensaje`) que: (1) valida con Zod, (2) verifica rate limit, (3) inserta en DB, (4) envía email con Resend en bloque independiente. El mapa es un iframe estático — sin API key ni JS de Google Maps.

---

## Fases de Implementación

### Fase 0 — Migración y configuración de Resend
1. Crear migración `supabase/migrations/006_crear_tabla_contacto.sql`.
2. Schema: `id UUID, nombre TEXT NOT NULL, email TEXT NOT NULL, asunto TEXT NOT NULL, mensaje TEXT NOT NULL, leido BOOL DEFAULT false, ip TEXT, created_at TIMESTAMPTZ DEFAULT NOW()`.
3. RLS: solo roles autenticados pueden leer; inserción pública permitida (sin auth).
4. Configurar Resend: crear cuenta, verificar dominio (o usar dominio de prueba), agregar `RESEND_API_KEY` a `.env.local`.
5. Crear tabla `rate_limit` en Supabase como alternativa a Vercel KV: `ip TEXT, count INT DEFAULT 1, window_start TIMESTAMPTZ DEFAULT NOW()`.

### Fase 1 — Rate limiting
1. Implementar `checkRateLimit(ip: string): Promise<boolean>` en `lib/utils/rateLimit.ts`.
2. Lógica: buscar fila por `ip` con `window_start > NOW() - INTERVAL '10 minutes'`.
   - Si no existe: INSERT nueva fila → permitir.
   - Si existe y `count < 3`: UPDATE `count + 1` → permitir.
   - Si existe y `count >= 3`: retornar `false` → bloquear.
3. Cleanup automático: filas con `window_start` mayor a 10 minutos se ignoran (sin DELETE activo para simplificar).

### Fase 2 — Server Action `enviarMensaje`
1. Validar `formData` con Zod `ContactoSchema`:
   - `nombre`: string mínimo 2 chars.
   - `email`: string email válido.
   - `asunto`: string mínimo 3 chars.
   - `mensaje`: string mínimo 10 chars, máximo 2000 chars.
2. Obtener IP del request desde headers (`x-forwarded-for` en Vercel).
3. Verificar rate limit — si bloqueado, retornar error `{ error: 'Demasiados intentos. Intentá de nuevo en 10 minutos.' }`.
4. INSERT en tabla `contacto_mensajes` (guardar IP también para auditoría).
5. En bloque `try/catch` independiente: enviar email con Resend. Si falla, loguear el error pero NO propagar — el mensaje ya está en DB.
6. Retornar `{ success: true }`.

### Fase 3 — Formulario público
1. `ContactoForm` Client Component con React Hook Form + Zod resolver.
2. Campos: nombre, email, asunto, mensaje (textarea con contador de caracteres).
3. Al submit: llamar Server Action. Deshabilitar botón via `useFormStatus` durante el pending.
4. En éxito: reemplazar formulario con `FormSuccessMessage` ("Tu mensaje fue enviado correctamente, te responderemos pronto").
5. En error (rate limit u otro): mostrar alert destructivo con el mensaje de error.
6. Validación inline en blur (no solo al submit) para mejor UX mobile.

### Fase 4 — Página pública `/contacto`
1. Layout de dos columnas en desktop (formulario izquierda, info + mapa derecha), una columna en mobile (info primero, formulario abajo).
2. `ContactoInfo`: dirección con ícono `MapPin`, horarios con ícono `Clock`, teléfono con link `tel:` y ícono `Phone`, email con link `mailto:` e ícono `Mail`.
3. `GoogleMapEmbed`: `<iframe>` de Google Maps Embed con la dirección del centro. Lazy loading (`loading="lazy"`). Sin API key.
4. Meta tags SEO con schema `LocalBusiness` JSON-LD.

### Fase 5 — Panel admin: bandeja de mensajes
1. Query `getMensajes()`: SELECT ORDER BY `created_at DESC`. Paginación de 20 por página.
2. `MensajesTable`: columnas: nombre, asunto, fecha, badge "No leído" (destacado en ámbar). Click en fila → detalle.
3. Página detalle `/admin/contacto/[id]`: muestra todos los campos. Al cargar, Server Action `marcarLeido(id)` hace UPDATE `leido = true` + `revalidatePath('/admin/contacto')`.
4. Botón "Eliminar mensaje" con confirmación → `deleteMensaje(id)`.
5. `UnreadBadge`: Client Component que muestra el count de mensajes no leídos. Usado en el sidebar del admin (`AdminSidebar.tsx` de feature 001). Query `countUnread()` en Server Component del layout admin.

---

## Complexity Tracking

> No hay violaciones. El rate limiting en DB es levemente más complejo que en memoria pero es la opción correcta para un entorno serverless (Vercel) donde no hay estado compartido entre instancias.
