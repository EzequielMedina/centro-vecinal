# CLAUDE.md — Reglas de Desarrollo: Centro Vecinal Centro América

Este archivo define las reglas y estándares que deben respetarse en **cada tarea de desarrollo** de este proyecto. Claude debe leerlas y aplicarlas en todo momento sin necesidad de que el usuario las repita.

---

## Stack de referencia

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript 5+ en modo estricto
- **Estilos**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js Server Actions + API Route Handlers
- **Base de datos**: PostgreSQL via Supabase
- **Auth**: Supabase Auth (`@supabase/ssr`)
- **Storage**: Supabase Storage
- **Emails**: Resend
- **Animaciones**: Framer Motion
- **Validación**: Zod (cliente y servidor)
- **Formularios**: React Hook Form
- **Iconos**: Lucide React
- **Drag & Drop**: @dnd-kit
- **Editor WYSIWYG**: TipTap
- **Procesamiento de imágenes**: sharp
- **Testing**: Vitest + React Testing Library + Playwright

---

## 1. TypeScript — Reglas estrictas

```typescript
// NUNCA usar `any`. Siempre tipar correctamente.
// MAL
const data: any = await fetchData()

// BIEN
const data: Aviso[] = await fetchData()
```

- Activar `"strict": true` en `tsconfig.json`. Sin excepciones.
- Preferir `type` sobre `interface` para modelos de datos; usar `interface` solo para contratos extensibles.
- Nunca usar `as` para castear excepto cuando sea estrictamente necesario y con comentario explicando por qué.
- Derivar tipos del schema de Supabase usando `Database['public']['Tables']['tabla']['Row']`.
- Los retornos de Server Actions deben tener tipo explícito: `Promise<{ success: true } | { error: string }>`.

---

## 2. Principios SOLID

### S — Single Responsibility
Cada archivo tiene UNA responsabilidad. No mezclar en el mismo módulo:

| Archivo | Solo contiene |
|---------|--------------|
| `lib/queries/avisos.ts` | Consultas de lectura a la DB |
| `lib/actions/avisos.ts` | Mutaciones (Server Actions) |
| `lib/validations/avisos.ts` | Schemas Zod |
| `components/avisos/AvisoCard.tsx` | Renderizado de una card |

```typescript
// MAL: query + mutación + validación en el mismo archivo
// BIEN: cada concern en su propio módulo
```

### O — Open/Closed
Los componentes deben ser extensibles via props, sin modificar su código interno:

```typescript
// BIEN: extensible via props
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
} & React.ButtonHTMLAttributes<HTMLButtonElement>
```

### L — Liskov Substitution
Los componentes que reemplazan a otros deben mantener el mismo contrato de props.

### I — Interface Segregation
No crear props gigantes. Dividir en interfaces pequeñas y específicas:

```typescript
// MAL
type GiantProps = { titulo: string; fecha: Date; contenido: string; autor: string; imagen: string; slug: string; activo: boolean }

// BIEN
type AvisoCardProps = Pick<Aviso, 'titulo' | 'slug' | 'imagen_url' | 'created_at'>
```

### D — Dependency Inversion
Los Server Actions y componentes dependen de abstracciones (queries), no de Supabase directamente:

```typescript
// MAL: Supabase acoplado al componente
const { data } = await supabase.from('avisos').select('*')

// BIEN: depender de la abstracción
import { getAvisos } from '@/lib/queries/avisos'
const avisos = await getAvisos()
```

---

## 3. Arquitectura del Proyecto

### Regla de capas — flujo unidireccional estricto

```
UI (components)
    ↓ llama
Server Actions / Route Handlers  (app/api/, lib/actions/)
    ↓ usa
Queries / Mutations               (lib/queries/, funciones dentro de actions)
    ↓ usa
Supabase Client                   (lib/supabase/server.ts)
    ↓ conecta
PostgreSQL (Supabase)
```

**Nunca saltear capas**: un componente no llama directamente a Supabase. Un action no renderiza JSX.

### Server Components por defecto
- Todo componente es Server Component salvo que necesite: estado React, eventos del browser, hooks, librerías solo-cliente.
- Agregar `'use client'` solo cuando sea estrictamente necesario y en el componente más profundo posible.
- Los datos se fetchean en Server Components y se pasan como props a Client Components.

```typescript
// BIEN: fetch en servidor, interactividad en el cliente
// app/avisos/page.tsx (Server Component)
const avisos = await getAvisos()
return <AvisosGrid avisos={avisos} />  // AvisosGrid puede ser Server Component

// components/avisos/AvisoLikeButton.tsx → 'use client' solo acá
```

### Estructura de carpetas — no inventar nuevas
Respetar la estructura definida en `spec/*/plan.md` de cada feature. Antes de crear un archivo, verificar si ya existe un lugar establecido para él.

---

## 4. Patrones de Diseño

### Pattern: Server Action como caso de uso
Cada Server Action representa UNA operación de negocio completa:

```typescript
// lib/actions/avisos.ts
export async function createAviso(formData: FormData): Promise<ActionResult> {
  // 1. Autenticación
  const session = await requireAuth()  // lanza si no hay sesión

  // 2. Validación
  const parsed = AvisoCreateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  // 3. Lógica de negocio
  const slug = await uniqueSlug(parsed.data.titulo)
  const contenido = sanitizeHtml(parsed.data.contenido)

  // 4. Persistencia
  const { error } = await supabase.from('avisos').insert({ ...parsed.data, slug, contenido })
  if (error) return { error: 'Error al guardar el aviso' }

  // 5. Efectos secundarios
  revalidatePath('/avisos')
  revalidatePath('/')

  return { success: true }
}
```

### Pattern: Composición de componentes sobre herencia

```typescript
// BIEN: composición
<Card>
  <CardHeader>
    <CardTitle>{aviso.titulo}</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Pattern: Empty State explícito
Todo componente que renderiza listas DEBE manejar el estado vacío:

```typescript
if (items.length === 0) return <EmptyStateCard mensaje="No hay elementos" />
```

### Pattern: Loading y Error boundaries
Usar `loading.tsx` y `error.tsx` de Next.js App Router en rutas que fetchean datos.

### Pattern: Optimistic UI en acciones simples (toggle, delete)
Para acciones rápidas como toggle activo/inactivo, usar `useOptimistic` de React para respuesta inmediata.

---

## 5. Seguridad — Reglas no negociables

### 5.1 Autenticación y autorización

```typescript
// En TODO Server Action que muta datos: verificar sesión SIEMPRE
// Aunque el middleware proteja las rutas, los Server Actions son llamables directamente
async function requireAuth() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No autorizado')
  return session
}

// En rutas de superadmin: verificar ROL además de sesión
async function requireSuperAdmin() {
  const session = await requireAuth()
  const { data: user } = await supabase.from('admin_users').select('rol').eq('id', session.user.id).single()
  if (user?.rol !== 'superadmin') throw new Error('Acceso denegado')
}
```

### 5.2 Validación de inputs — Zod en TODO boundary

```typescript
// NUNCA confiar en datos del cliente sin validar con Zod
// Esto aplica en: Server Actions, Route Handlers, y cualquier función que reciba datos externos
const parsed = Schema.safeParse(input)
if (!parsed.success) return { error: 'Datos inválidos' }
// Solo a partir de acá usar parsed.data
```

### 5.3 Sanitización de HTML — obligatorio antes de persistir

```typescript
// Todo HTML que venga del editor WYSIWYG DEBE sanitizarse antes del INSERT
import { sanitizeHtml } from '@/lib/utils/sanitize'
const contenidoSeguro = sanitizeHtml(contenidoDelEditor)
// Guardar contenidoSeguro, nunca el original
```

### 5.4 Variables de entorno — nunca en el cliente sin NEXT_PUBLIC_

```typescript
// Variables SIN NEXT_PUBLIC_ son solo del servidor
// NUNCA acceder a SUPABASE_SERVICE_ROLE_KEY en un Client Component
// Si una variable no necesita estar en el cliente, no agregarle NEXT_PUBLIC_
```

### 5.5 Subida de archivos — validar SIEMPRE en servidor

```typescript
// Validar MIME type en servidor, no solo en cliente
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Tipo de archivo no permitido')
if (file.size > MAX_SIZE) throw new Error('Archivo demasiado grande')
// El cliente puede mentir sobre el tipo — el servidor siempre revalida
```

### 5.6 Rate limiting en endpoints públicos

```typescript
// Todo endpoint público que muta datos (formulario de contacto, etc.)
// DEBE verificar rate limit antes de procesar
const { allowed } = await checkRateLimit(ip)
if (!allowed) return { error: 'Demasiados intentos' }
```

### 5.7 Mensajes de error — no revelar información interna

```typescript
// MAL: revela estructura interna
return { error: 'duplicate key value violates unique constraint "avisos_slug_key"' }

// BIEN: mensaje amigable y seguro
return { error: 'Ya existe un aviso con ese título' }
```

### 5.8 RLS en Supabase — siempre configurado
Cada tabla nueva DEBE tener RLS habilitado y políticas definidas antes de ser usada. Sin RLS, cualquier usuario con la `anon_key` puede leer/escribir todos los registros.

### 5.9 Cookies y sesión
- Usar siempre cookies `httpOnly` para tokens de sesión (Supabase SSR lo hace por defecto).
- Nunca guardar tokens de auth en `localStorage`.

---

## 6. Convenciones de Código

### Nombres de archivos

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componente React | PascalCase | `AvisoCard.tsx` |
| Server Action / Query | camelCase | `avisos.ts` |
| Utilidad / helper | camelCase | `slugify.ts` |
| Página Next.js | lowercase | `page.tsx`, `layout.tsx` |
| Constante global | UPPER_SNAKE | `DEFAULT_CONTENT` |

### Nombres de funciones

```typescript
// Queries de lectura: verbo get + entidad
getAvisos(), getAvisoBySlug(), getAvisosDestacados()

// Server Actions: verbo de negocio + entidad
createAviso(), updateAviso(), deleteAviso(), toggleActivo()

// Helpers: verbo descriptivo
slugify(), sanitizeHtml(), checkRateLimit()

// Componentes: sustantivo descriptivo
AvisoCard, AvisosGrid, ConfirmDeleteDialog
```

### Imports — orden estricto

```typescript
// 1. React / Next.js
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Image from 'next/image'

// 2. Librerías externas
import { z } from 'zod'
import { useForm } from 'react-hook-form'

// 3. Componentes internos (alias @/)
import { Button } from '@/components/ui/button'
import { AvisoCard } from '@/components/avisos/AvisoCard'

// 4. Lib / utils / queries / actions
import { getAvisos } from '@/lib/queries/avisos'
import { createAviso } from '@/lib/actions/avisos'

// 5. Tipos
import type { Aviso } from '@/types'
```

### Funciones pequeñas y enfocadas
- Máximo ~40 líneas por función. Si supera, extraer responsabilidades.
- Una función hace UNA cosa. Si el nombre tiene "y" en el medio, dividirla.

### No comentarios obvios — solo donde la lógica no es evidente

```typescript
// MAL: comentario que repite el código
// Obtenemos el aviso por slug
const aviso = await getAvisoBySlug(slug)

// BIEN: comentario que explica el por qué
// El contenido viene sanitizado de la DB, es seguro renderizarlo directamente
<div dangerouslySetInnerHTML={{ __html: aviso.contenido }} />
```

---

## 7. Tailwind CSS y Estilo Visual

### Paleta oficial del proyecto (del logo)

```
teal-primary:   #2D6A7F  → Navbar, botones primarios, headings principales
red-accent:     #D32F2F  → Alertas, badges destructivos, CTA urgentes
amber-highlight:#F59E0B  → Badges de actividad, highlights, "No leído"
sage-neutral:   #6B8C7A  → Tags, chips, elementos secundarios
```

Extender en `tailwind.config.ts` con nombres semánticos:
```typescript
colors: {
  primary: '#2D6A7F',
  accent: '#D32F2F',
  highlight: '#F59E0B',
  neutral-sage: '#6B8C7A',
}
```

### Reglas de estilo

- **Mobile-first siempre**: escribir estilos base para mobile, luego `sm:`, `md:`, `lg:`.
- **No hardcodear colores** en clases Tailwind si ya están en la paleta del proyecto — usar las variables semánticas.
- **Consistencia en espaciado**: usar la escala de Tailwind (4, 6, 8, 12, 16...). No usar valores arbitrarios como `p-[13px]` salvo que sea absolutamente necesario.
- **Accesibilidad**: todo elemento interactivo tiene `focus-visible` visible. Contraste WCAG AA mínimo.
- **No usar `!important`** en clases Tailwind salvo override documentado.

### Componentes shadcn/ui
- Usar siempre los componentes de shadcn/ui antes de crear uno desde cero.
- Si se necesita personalizar un componente de shadcn, extenderlo via props, no modificar el archivo generado en `components/ui/`.

---

## 8. Manejo de Errores

### En Server Actions — siempre retornar, nunca lanzar al cliente

```typescript
// Server Actions retornan un resultado tipado, no lanzan excepciones al cliente
type ActionResult = { success: true } | { error: string } | { errors: Record<string, string[]> }

// El componente cliente maneja el resultado
const result = await createAviso(formData)
if ('error' in result) {
  setError(result.error)
  return
}
// proceder con éxito
```

### En queries — logging interno, error genérico hacia afuera

```typescript
const { data, error } = await supabase.from('avisos').select('*')
if (error) {
  console.error('[getAvisos]', error.message)  // log interno
  throw new Error('Error al obtener los avisos')  // mensaje genérico hacia afuera
}
```

### En Route Handlers — códigos HTTP correctos

```typescript
// 400 → validación fallida
// 401 → no autenticado
// 403 → autenticado pero sin permiso
// 404 → recurso no encontrado
// 413 → payload demasiado grande
// 429 → rate limit
// 500 → error interno
```

---

## 9. Performance

- **`next/image` siempre** para imágenes. Nunca `<img>` directamente.
- **`priority` solo en imágenes above-the-fold** (hero, logo). El resto usa `loading="lazy"`.
- **`Promise.all`** cuando se fetchean múltiples datos independientes en un Server Component.
- **ISR (`revalidate`)** en páginas con contenido que cambia pero no en tiempo real. Valores orientativos:
  - Home: 60s
  - Avisos/Actividades: 30s
  - Servicios/Sobre Nosotros: 300s
- **`revalidatePath`** en Server Actions después de cada mutación — no depender de la expiración del cache.
- **Lazy load de componentes pesados** (lightbox, editor) con `dynamic(() => import(...), { ssr: false })`.

---

## 10. Testing

- **Unit tests (Vitest)**: funciones puras en `lib/utils/` y validaciones Zod. Siempre.
- **Integration tests**: Server Actions críticos (createAviso, enviarMensaje) contra Supabase local (Docker).
- **E2E tests (Playwright)**: flujos críticos de usuario: login, crear aviso, enviar formulario de contacto.
- Los tests van en `__tests__/` junto al archivo que testean, o en carpeta `tests/` en la raíz para E2E.
- Un test describe UNA cosa. Nombres en español descriptivos: `"debe retornar error si el slug ya existe"`.

---

## 11. Git y Commits

### Estrategia de branches — obligatoria

El flujo de trabajo tiene tres niveles de branches:

```
main                                   ← producción
 └── develop                           ← integración
      └── 001-autenticacion-admin      ← branch de feature (del spec)
           ├── task/001-T007-middleware     ← branch de task
           ├── task/001-T012-login-page     ← branch de task
           └── task/001-T020-layout-admin   ← branch de task
```

#### Regla: una task = una branch = un PR hacia la feature branch

**Al iniciar cualquier task**, antes de escribir código:

```bash
# 1. Asegurarse de estar en la branch de feature y actualizada
git checkout 001-autenticacion-admin
git pull origin 001-autenticacion-admin

# 2. Crear branch de task con el formato: task/[feature-id]-[task-id]-[descripcion-corta]
git checkout -b task/001-T007-middleware
```

**Formato de nombre de branch de task:**
```
task/[###]-[TXXX]-[descripcion-en-kebab-case]

Ejemplos:
task/001-T007-middleware-proteccion-rutas
task/003-T026-server-action-create-aviso
task/005-T011-route-handler-upload-imagen
```

**Al completar la task:**
```bash
# Commit con formato convencional
git add <archivos-relevantes>
git commit -m "feat(auth): implementar middleware de protección de rutas /admin/*"

# Push y merge a la feature branch (sin PR externo necesario — merge directo local)
git checkout 001-autenticacion-admin
git merge task/001-T007-middleware --no-ff
git push origin 001-autenticacion-admin

# Eliminar la branch de task una vez mergeada
git branch -d task/001-T007-middleware
```

**Al completar TODA la feature**, abrir PR de la feature branch hacia `develop`:
```bash
gh pr create --base develop --head 001-autenticacion-admin \
  --title "feat: autenticación de administradores" \
  --body "Implementa login, middleware de protección, logout y gestión de usuarios admin."
```

### Formato de commits

```
tipo(scope): descripción en español

feat(avisos): agregar CRUD de avisos en panel admin
fix(auth): corregir redirección post-login
refactor(queries): extraer getAvisosDestacados a lib/queries
test(contacto): agregar test de rate limiting
chore(deps): instalar @tiptap/react y extensiones
```

### Otras reglas

- Nunca commitear `.env.local` ni archivos con credenciales.
- Nunca hacer `git push --force` a `main`.
- Nunca trabajar directamente en `main`.
- Commits pequeños y atómicos: un commit por task completada.

---

## 12. Checklist antes de dar una tarea por terminada

Antes de considerar cualquier task completada, verificar:

- [ ] TypeScript sin errores (`npx tsc --noEmit`)
- [ ] Sin `any` introducidos
- [ ] Input validado con Zod en el server
- [ ] HTML del WYSIWYG sanitizado antes de persistir
- [ ] Server Action verifica sesión activa
- [ ] RLS configurado en tablas nuevas
- [ ] `revalidatePath` llamado después de mutaciones
- [ ] Estado vacío manejado en componentes de lista
- [ ] Funciona en mobile (viewport 375px mínimo)
- [ ] Sin `console.log` de debug en el código final
- [ ] Sin secrets o API keys hardcodeadas
