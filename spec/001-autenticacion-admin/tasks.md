# Tasks: Autenticación de Administradores

**Branch**: `001-autenticacion-admin`
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

---

## Fase 0 — Setup de Supabase Auth

- [ ] **T001** Habilitar Email Auth en Supabase Dashboard y deshabilitar registro público
- [ ] **T002** Crear migración `supabase/migrations/001_admin_users.sql` con tabla `admin_users` (id, email, nombre, rol, created_at)
- [ ] **T003** Configurar RLS en `admin_users`: lectura solo para el propio usuario; escritura solo para `service_role`
- [ ] **T004** Crear el primer superadmin manualmente desde el dashboard de Supabase
- [ ] **T005** Agregar variables de entorno al `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **T006** Instalar `@supabase/ssr` y crear `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`

---

## Fase 1 — Middleware de protección de rutas

- [ ] **T007** Crear `middleware.ts` en la raíz del proyecto que intercepte rutas `/admin/*`
- [ ] **T008** Implementar lógica: sin sesión → redirigir a `/admin/login?redirect=[url-original]`
- [ ] **T009** Implementar lógica: sesión activa en `/admin/login` → redirigir a `/admin/dashboard`
- [ ] **T010** Implementar refresh automático de token en el middleware via `supabase.auth.getSession()`
- [ ] **T011** Test manual: acceder a `/admin/dashboard` sin sesión → confirmar redirección a login

---

## Fase 2 — Página de Login

- [ ] **T012** Crear `app/(admin)/login/page.tsx` con layout centrado y logo del centro
- [ ] **T013** Crear `LoginForm` Client Component con React Hook Form + Zod (campos: email, contraseña)
- [ ] **T014** Implementar Server Action `signIn(formData)` que llama a `supabase.auth.signInWithPassword()`
- [ ] **T015** En éxito: redirigir al `redirect` param o `/admin/dashboard`
- [ ] **T016** En error: mostrar mensaje genérico "Credenciales incorrectas" (sin revelar si el email existe)
- [ ] **T017** Deshabilitar botón "Ingresar" durante el pending state via `useFormStatus`
- [ ] **T018** Test: login con credenciales válidas → redirección a dashboard
- [ ] **T019** Test: login con credenciales inválidas → mensaje de error visible

---

## Fase 3 — Layout del panel admin + Logout

- [ ] **T020** Crear `app/(admin)/admin/layout.tsx` con sidebar fijo y área de contenido
- [ ] **T021** Crear `AdminSidebar.tsx` con links de navegación y botón "Cerrar sesión"
- [ ] **T022** Crear `AdminNavbar.tsx` que muestra el nombre del admin logueado (desde sesión servidor)
- [ ] **T023** Implementar Server Action `signOut()` que llama a `supabase.auth.signOut()` y redirige a `/admin/login`
- [ ] **T024** Crear página `app/(admin)/admin/dashboard/page.tsx` con métricas básicas (placeholder por ahora)
- [ ] **T025** Test: hacer logout → confirmar que rutas admin ya no son accesibles

---

## Fase 4 — Gestión de usuarios (superadmin)

- [ ] **T026** Crear `app/(admin)/admin/usuarios/page.tsx` con guard de rol (`rol !== 'superadmin'` → retornar 403)
- [ ] **T027** Crear `UsuariosTable.tsx` con columnas: nombre, email, rol, fecha de creación, acciones
- [ ] **T028** Crear `app/(admin)/admin/usuarios/nuevo/page.tsx` con `NuevoAdminForm`
- [ ] **T029** Implementar Server Action `createAdmin(formData)`: crear en Supabase Auth + INSERT en `admin_users`
- [ ] **T030** Implementar Server Action `deleteAdmin(id)`: DELETE de `admin_users` + eliminar de Supabase Auth
- [ ] **T031** Validar en `deleteAdmin`: impedir que el superadmin se elimine a sí mismo
- [ ] **T032** Validar en `createAdmin`: retornar error si el email ya existe en Supabase Auth
- [ ] **T033** Test: admin con rol `admin` intenta acceder a `/admin/usuarios` → error 403
- [ ] **T034** Test: superadmin crea nuevo admin → nuevo usuario puede loguearse

---

## Criterios de Done

- [ ] 100% de rutas `/admin/*` redirigen al login sin sesión activa
- [ ] Login funciona con email/contraseña válidos
- [ ] Logout destruye la sesión completamente (back-button no restaura)
- [ ] Superadmin puede crear y eliminar admins
- [ ] Admin regular recibe 403 al intentar acceder a gestión de usuarios
