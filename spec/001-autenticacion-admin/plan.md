# Implementation Plan: Autenticación de Administradores

**Branch**: `001-autenticacion-admin` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `spec/001-autenticacion-admin/spec.md`

---

## Summary

Implementar el sistema completo de autenticación para administradores del Centro Vecinal usando Supabase Auth (JWT + refresh token via cookies httpOnly). Incluye la página de login, middleware de protección de rutas, cierre de sesión y gestión de cuentas admin por parte del superadmin. Es el prerequisito bloqueante de todas las demás features administrativas.

---

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+
**Primary Dependencies**: Next.js 14 (App Router), Supabase Auth (`@supabase/ssr`), React Hook Form, Zod
**Storage**: PostgreSQL via Supabase — tabla `admin_users` con campo `rol` (`admin` | `superadmin`)
**Testing**: Vitest + React Testing Library (unit), Playwright (E2E login flow)
**Target Platform**: Web — Chrome, Firefox, Safari, mobile browsers
**Project Type**: Full-stack web app (monorepo Next.js)
**Performance Goals**: Redirección de rutas protegidas en <200ms (middleware edge)
**Constraints**: Supabase Free tier — 50.000 usuarios auth incluidos; cookies httpOnly para evitar XSS
**Scale/Scope**: 2–5 administradores activos; acceso exclusivo desde panel `/admin/*`

---

## Constitution Check

| Gate | Estado | Detalle |
|------|--------|---------|
| ¿Se usa la solución más simple posible? | ✅ Pasa | Supabase Auth maneja JWT, refresh, y hashing — no se reimplementa nada |
| ¿Se evita sobre-ingeniería? | ✅ Pasa | Sin OAuth, sin 2FA por ahora — email/password es suficiente para el alcance |
| ¿Hay dependencias innecesarias? | ✅ Pasa | `@supabase/ssr` es la librería oficial recomendada para Next.js App Router |
| ¿La protección cubre todas las rutas? | ✅ Requiere atención | El middleware debe cubrir `/admin/*` exhaustivamente y verificarse con Playwright |

---

## Project Structure

### Documentation (this feature)

```text
spec/001-autenticacion-admin/
├── spec.md          # Requerimientos y user stories
├── plan.md          # Este archivo
└── tasks.md         # Pendiente — generado en siguiente fase
```

### Source Code (repository root)

```text
app/
├── (admin)/
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Primera página post-login
│   │   └── usuarios/
│   │       ├── page.tsx              # Lista de admins (solo superadmin)
│   │       └── nuevo/page.tsx        # Crear nuevo admin
│   └── login/
│       └── page.tsx                  # Página de login
│
├── api/
│   └── auth/
│       └── signout/route.ts          # Server Action / Route para logout
│
middleware.ts                         # Protección global de rutas /admin/*

components/
├── admin/
│   ├── layout/
│   │   ├── AdminSidebar.tsx          # Sidebar con link "Cerrar sesión"
│   │   └── Adminnavbar.tsx           # Navbar con nombre del admin logueado
│   └── usuarios/
│       ├── UsuariosTable.tsx         # Tabla de admins
│       └── NuevoAdminForm.tsx        # Formulario crear admin

lib/
└── supabase/
    ├── client.ts                     # Cliente Supabase para componentes cliente
    ├── server.ts                     # Cliente Supabase para Server Components
    └── middleware.ts                 # Helper para refresh de sesión en middleware
```

**Structure Decision**: Monorepo Next.js con App Router. La autenticación vive en el middleware de Next.js (`middleware.ts` en la raíz) que intercepta todos los requests a `/admin/*` antes de llegar a los componentes. Supabase `@supabase/ssr` maneja las cookies en el servidor. No hay backend separado.

---

## Fases de Implementación

### Fase 0 — Setup de Supabase Auth
1. Configurar proyecto en Supabase: habilitar Email Auth, deshabilitar registro público.
2. Crear tabla `admin_users` con campos `id`, `email`, `nombre`, `rol`.
3. Configurar Row Level Security (RLS): solo `service_role` puede insertar/eliminar.
4. Crear el primer superadmin manualmente desde el dashboard de Supabase.
5. Agregar variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

### Fase 1 — Middleware de protección de rutas
1. Implementar `middleware.ts` en la raíz del proyecto.
2. El middleware verifica sesión activa en cada request a `/admin/*`.
3. Si no hay sesión: redirige a `/admin/login?redirect=[url-original]`.
4. Si hay sesión válida intentando acceder a `/admin/login`: redirige a `/admin/dashboard`.
5. Implementar refresh automático de token en el middleware.

### Fase 2 — Página de Login
1. Crear `app/(admin)/login/page.tsx` con formulario (React Hook Form + Zod).
2. Campos: email, contraseña. Validación de formato en cliente.
3. Server Action que llama a `supabase.auth.signInWithPassword()`.
4. En éxito: redirigir a `redirect` param o `/admin/dashboard`.
5. En error: mostrar mensaje "Credenciales incorrectas" sin revelar si el email existe.
6. Bloqueo de UI (loading state) durante el submit.

### Fase 3 — Layout del Panel Admin + Logout
1. Crear layout `app/(admin)/admin/layout.tsx` con sidebar y navbar.
2. Navbar muestra nombre del admin logueado (obtenido de la sesión del servidor).
3. Botón "Cerrar sesión" llama Server Action que invoca `supabase.auth.signOut()`.
4. Post-logout: redirigir a `/admin/login` y limpiar cookies.

### Fase 4 — Gestión de usuarios (superadmin)
1. Crear página `app/(admin)/admin/usuarios/page.tsx` con tabla de admins.
2. Guard adicional en la página: verificar que `rol === 'superadmin'`, sino retornar 403.
3. Formulario "Nuevo Admin": nombre, email, contraseña temporal.
4. Server Action: crear usuario en Supabase Auth + insertar en tabla `admin_users`.
5. Eliminar admin: borrar de Supabase Auth y de `admin_users` en transacción.
6. Validación: impedir que superadmin se elimine a sí mismo.

---

## Complexity Tracking

> No hay violaciones. El sistema usa Supabase Auth como solución estándar sin capas adicionales.
