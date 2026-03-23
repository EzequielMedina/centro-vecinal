# Documento Técnico — Sitio Web Centro Vecinal Centro América
**Versión:** 1.2
**Fecha:** Marzo 2026
**Autor:** Equipo de Desarrollo

---

## Índice

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Identidad Visual y Diseño](#2-identidad-visual-y-diseño)
3. [Funcionalidades Requeridas](#3-funcionalidades-requeridas)
4. [Stack Tecnológico Recomendado](#4-stack-tecnológico-recomendado)
5. [Arquitectura del Sistema](#5-arquitectura-del-sistema)
6. [Estructura del Proyecto](#6-estructura-del-proyecto)
7. [Base de Datos — Modelo de Datos](#7-base-de-datos--modelo-de-datos)
8. [Panel de Administración](#8-panel-de-administración)
9. [Despliegue y Hosting](#9-despliegue-y-hosting)
10. [Seguridad](#10-seguridad)
11. [Dockerización — Evaluación](#11-dockerización--evaluación)
12. [Roadmap de Desarrollo](#12-roadmap-de-desarrollo)
13. [Estimación de Costos](#13-estimación-de-costos)

---

## 1. Visión General del Proyecto

### ¿Qué es?
Una aplicación web moderna, responsive y accesible para el **Centro Vecinal Centro América**, que sirva como punto de información digital para el barrio, permitiendo a los vecinos consultar actividades, avisos y servicios, y a los administradores gestionar contenido de forma autónoma sin conocimientos técnicos.

### Objetivos principales
- Digitalizar la comunicación del centro vecinal con los vecinos
- Permitir a administradores publicar avisos, actividades y noticias de forma sencilla
- Informar sobre servicios disponibles (talleres, actividades culturales, deportivas, educativas, etc.)
- Ser accesible desde celulares (la mayoría de vecinos accede desde móvil)
- Imagen profesional y moderna acorde al logo institucional

### Público objetivo
- **Vecinos del barrio** — consultan información, actividades y avisos
- **Administradores del centro** — cargan contenido sin necesidad de saber programar
- **Nuevos vecinos** — conocen el centro y sus servicios

---

## 2. Identidad Visual y Diseño

### Paleta de colores (extraída del logo)

```
Color Principal (Teal Oscuro)  →  #2D6A7F  — Textos, navbar, botones primarios
Color Secundario (Rojo)        →  #D32F2F  — Acentos, alertas, llamadas a la acción
Color Terciario (Ámbar/Dorado) →  #F59E0B  — Highlights, badges, iconos de actividad
Color Neutro (Verde Salvia)    →  #6B8C7A  — Tags, chips, elementos secundarios
Fondo claro                    →  #F8F9FA  — Background general
Fondo blanco                   →  #FFFFFF  — Cards y paneles
Texto principal                →  #1A1A2E  — Títulos y cuerpo de texto
Texto secundario               →  #6B7280  — Subtítulos y metadata
```

### Tipografía recomendada
- **Títulos:** `Poppins` (700/600) — moderna, amigable, legible
- **Cuerpo:** `Inter` (400/500) — altamente legible en pantalla
- **Accent/Quotes:** `Lora` (italic) — para frases destacadas del centro

### Principios de diseño
- **Mobile-first** — diseño que parte desde celular y escala a desktop
- **Glassmorphism suave** — cards con blur y transparencia para modernidad
- **Gradientes suaves** — basados en la paleta del logo
- **Animaciones micro** — hover effects, transiciones fluidas con Framer Motion
- **Accesibilidad WCAG 2.1 AA** — contraste adecuado, textos legibles

---

## 3. Funcionalidades Requeridas

### 3.1 Páginas públicas (acceso sin login)

| Página | Descripción |
|--------|-------------|
| **Inicio (Home)** | Hero con info del centro, últimas actividades, avisos destacados |
| **Sobre Nosotros** | Historia, misión, valores, equipo directivo |
| **Actividades** | Listado y detalle de actividades con filtros por categoría (talleres, deporte, cultural, apoyo estudiantil, etc.) |
| **Avisos** | Tablero de anuncios públicos del barrio |
| **Servicios** | Detalle de todos los servicios que ofrece el centro |
| **Galería** | Fotos de eventos y actividades del centro |
| **Contacto** | Formulario, mapa de ubicación, horarios de atención |

### 3.2 Panel de Administración (solo admin con login)

| Módulo | Acciones |
|--------|----------|
| **Gestión de Avisos** | Crear, editar, eliminar, destacar avisos |
| **Gestión de Actividades** | Crear, editar, eliminar actividades con fechas, imágenes y categoría (incluye apoyo estudiantil) |
| **Galería** | Subir, organizar y eliminar imágenes |
| **Servicios** | Editar descripción de los servicios ofrecidos |
| **Usuarios Admin** | Crear/eliminar cuentas de administradores |
| **Mensajes de contacto** | Ver mensajes recibidos desde el formulario |

### 3.3 Funcionalidades técnicas
- Sistema de autenticación seguro (JWT + refresh tokens)
- Subida de imágenes con compresión automática
- Editor de texto enriquecido (WYSIWYG) para los administradores
- Notificaciones push / email para avisos importantes (opcional fase 2)
- SEO optimizado (meta tags, Open Graph, sitemap.xml)
- PWA (Progressive Web App) — los vecinos pueden "instalar" la web en su celular

---

## 4. Stack Tecnológico Recomendado

### Decisión: Next.js Full-Stack (Monorepo)

Se recomienda un stack unificado con **Next.js** que permite frontend + backend en un solo repositorio, simplificando el desarrollo y el despliegue. Es la solución ideal para un proyecto de este tamaño.

---

### 4.1 Frontend

| Tecnología | Versión | Rol | Por qué |
|-----------|---------|-----|---------|
| **Next.js** | 14+ (App Router) | Framework principal | SSR/SSG para SEO, routing, API routes integradas |
| **React** | 18+ | UI Library | Base de Next.js, componentes reutilizables |
| **TypeScript** | 5+ | Tipado estático | Evita bugs en runtime, mejor DX |
| **Tailwind CSS** | 3+ | Estilos | Desarrollo rápido, mobile-first, customizable |
| **shadcn/ui** | Latest | Componentes UI | Componentes accesibles y modernos sobre Tailwind |
| **Framer Motion** | 11+ | Animaciones | Animaciones fluidas y profesionales |
| **React Hook Form** | 7+ | Formularios | Manejo eficiente de formularios + validación |
| **Zod** | 3+ | Validación | Schemas de validación tipados |
| **TipTap** | 2+ | Editor WYSIWYG | Editor de texto enriquecido para el panel admin |
| **Lucide React** | Latest | Iconos | Set de iconos moderno y consistente |

### 4.2 Backend (API Routes dentro de Next.js)

| Tecnología | Versión | Rol | Por qué |
|-----------|---------|-----|---------|
| **Next.js API Routes** | 14+ | API REST / Server Actions | Backend integrado, sin servidor separado |
| **Supabase** | Latest | BaaS (Backend as a Service) | DB + Auth + Storage + Realtime todo en uno |
| **PostgreSQL** | 15+ | Base de datos | Robusto, relacional, gratis en Supabase |
| **Supabase Auth** | Latest | Autenticación | JWT seguro, sesiones, roles de usuario |
| **Supabase Storage** | Latest | Almacenamiento de archivos | Subida de imágenes con URL pública |
| **Resend** | Latest | Envío de emails | Notificaciones de contacto, alertas |

### 4.3 Herramientas de desarrollo

| Herramienta | Uso |
|------------|-----|
| **ESLint + Prettier** | Linting y formateo de código |
| **Husky + lint-staged** | Pre-commit hooks |
| **Git + GitHub** | Control de versiones |
| **Vercel** | CI/CD y despliegue automático |

---

### ¿Por qué NO otras alternativas?

| Alternativa | Motivo para descartarla |
|------------|------------------------|
| WordPress | Anticuado, lento, inseguro, UX admin compleja |
| Angular | Curva de aprendizaje alta, verboso, excesivo para este proyecto |
| Vue + Laravel | Dos repos separados, más mantenimiento, hosting más costoso |
| Django + React | Stack separado innecesariamente complejo para este alcance |

---

## 5. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Vercel    │  (CDN + Edge Network global)
                    │  (Hosting)  │
                    └──────┬──────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
   ┌──────▼──────┐                  ┌───────▼──────┐
   │  Next.js    │                  │  Next.js     │
   │  Frontend   │                  │  API Routes  │
   │  (React +   │                  │  (Backend)   │
   │  Tailwind)  │                  │              │
   └─────────────┘                  └───────┬──────┘
                                            │
                              ┌─────────────▼──────────────┐
                              │         SUPABASE            │
                              │  ┌──────────────────────┐  │
                              │  │  PostgreSQL Database  │  │
                              │  ├──────────────────────┤  │
                              │  │   Supabase Auth       │  │
                              │  ├──────────────────────┤  │
                              │  │   Supabase Storage    │  │
                              │  │   (imágenes/archivos) │  │
                              │  └──────────────────────┘  │
                              └────────────────────────────┘
                                            │
                              ┌─────────────▼──────────────┐
                              │         RESEND              │
                              │   (Envío de emails)         │
                              └────────────────────────────┘
```

### Flujo de autenticación admin

```
Admin ingresa email/password
        │
        ▼
Supabase Auth valida credenciales
        │
        ▼
Genera JWT + Refresh Token
        │
        ▼
Next.js guarda sesión en cookie segura (httpOnly)
        │
        ▼
Middleware de Next.js protege rutas /admin/*
        │
        ▼
Admin accede al panel de gestión
```

---

## 6. Estructura del Proyecto

```
centro-vecinal/
├── app/                          # App Router de Next.js
│   ├── (public)/                 # Rutas públicas
│   │   ├── page.tsx              # Home
│   │   ├── sobre-nosotros/
│   │   ├── actividades/
│   │   │   ├── page.tsx          # Listado con filtro por categoría
│   │   │   └── [slug]/page.tsx   # Detalle de actividad
│   │   ├── avisos/
│   │   ├── servicios/
│   │   ├── galeria/
│   │   └── contacto/
│   ├── (admin)/                  # Rutas del panel admin (protegidas)
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── avisos/
│   │   │   ├── actividades/      # Incluye la categoría apoyo estudiantil
│   │   │   ├── galeria/
│   │   │   └── usuarios/
│   │   └── login/
│   └── api/                      # API Routes (backend)
│       ├── avisos/
│       ├── actividades/
│       ├── contacto/
│       └── upload/
├── components/
│   ├── ui/                       # Componentes de shadcn/ui
│   ├── layout/                   # Navbar, Footer, Sidebar
│   ├── home/                     # Componentes específicos del home
│   ├── actividades/
│   ├── avisos/
│   └── admin/                    # Componentes del panel admin
├── lib/
│   ├── supabase/                 # Cliente y tipos de Supabase
│   ├── validations/              # Schemas de Zod
│   └── utils/                    # Funciones utilitarias
├── hooks/                        # Custom React hooks
├── types/                        # Tipos TypeScript globales
├── public/
│   ├── logo.png
│   └── icons/
├── middleware.ts                 # Protección de rutas admin
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 7. Base de Datos — Modelo de Datos

### Tablas principales (PostgreSQL en Supabase)

```sql
-- Usuarios administradores
CREATE TABLE admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  nombre      TEXT NOT NULL,
  rol         TEXT DEFAULT 'admin',  -- 'superadmin' | 'admin'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Avisos del centro vecinal
CREATE TABLE avisos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       TEXT NOT NULL,
  contenido    TEXT NOT NULL,           -- HTML del editor WYSIWYG
  destacado    BOOLEAN DEFAULT FALSE,   -- aparece en home
  activo       BOOLEAN DEFAULT TRUE,
  imagen_url   TEXT,
  autor_id     UUID REFERENCES admin_users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Actividades / Eventos
CREATE TABLE actividades (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  descripcion     TEXT NOT NULL,
  fecha_inicio    TIMESTAMPTZ NOT NULL,
  fecha_fin       TIMESTAMPTZ,
  ubicacion       TEXT,
  capacidad       INTEGER,
  categoria       TEXT NOT NULL,        -- 'taller' | 'deporte' | 'cultural' | 'apoyo-estudiantil' | 'otro'
  imagen_url      TEXT,
  activa          BOOLEAN DEFAULT TRUE,
  autor_id        UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Galería de imágenes
CREATE TABLE galeria (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT,
  descripcion TEXT,
  url         TEXT NOT NULL,            -- URL de Supabase Storage
  categoria   TEXT,
  orden       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Mensajes de contacto
CREATE TABLE contacto_mensajes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  email       TEXT NOT NULL,
  asunto      TEXT NOT NULL,
  mensaje     TEXT NOT NULL,
  leido       BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Servicios del centro
CREATE TABLE servicios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  icono       TEXT,                     -- nombre del icono de Lucide
  activo      BOOLEAN DEFAULT TRUE,
  orden       INTEGER DEFAULT 0
);
```

---

## 8. Panel de Administración

### Características del panel admin

- **Dashboard** con métricas rápidas: avisos activos, próximas actividades, mensajes no leídos
- **Diseño limpio** tipo SaaS con sidebar fijo + área de contenido
- **Editor WYSIWYG (TipTap)** para redactar avisos y descripciones con formato
- **Subida de imágenes** drag & drop con preview inmediato
- **Tabla de datos** con búsqueda, filtros y paginación (usando TanStack Table)
- **Confirmación antes de eliminar** — modal de confirmación
- **Gestión de roles** — superadmin puede crear y eliminar admins
- **Responsive** — funciona desde tablet/celular

### Flujo de publicación de un aviso (ejemplo)

```
Admin hace click en "Nuevo Aviso"
        │
        ▼
Formulario: título, contenido (WYSIWYG), imagen, destacado
        │
        ▼
Validación con Zod en cliente
        │
        ▼
POST /api/avisos → Supabase guarda en DB
        │
        ▼
Si hay imagen → Supabase Storage guarda el archivo
        │
        ▼
Revalidación de caché en Next.js (revalidatePath)
        │
        ▼
El aviso aparece inmediatamente en el sitio público
```

---

## 9. Despliegue y Hosting

### Opción Recomendada: Vercel + Supabase (GRATIS para comenzar)

| Servicio | Plan | Costo mensual | Límites |
|---------|------|---------------|---------|
| **Vercel** | Hobby (Free) | $0 | 100GB bandwidth, dominios custom, SSL |
| **Supabase** | Free | $0 | 500MB DB, 1GB Storage, 50k auth users |
| **Dominio propio** | Namecheap/NIC.ar | ~$10/año | `.com.ar` o `.com` |
| **Resend** | Free | $0 | 3.000 emails/mes |
| **TOTAL** | | **~$10/año** | Perfecto para comenzar |

Cuando el proyecto crezca y necesite más recursos:

| Servicio | Plan Pro | Costo mensual |
|---------|---------|---------------|
| **Vercel** | Pro | $20/mes |
| **Supabase** | Pro | $25/mes |
| **TOTAL** | | ~$45/mes |

---

### Opción Alternativa: Hostinger

Si el cliente prefiere Hostinger por familiaridad o precio:

| Plan | Precio | Incluye |
|-----|--------|---------|
| **Business Web Hosting** | ~$3-4/mes | 100GB SSD, SSL, email |

**Consideraciones con Hostinger:**
- Next.js necesita Node.js — Hostinger lo soporta en planes Business+
- La DB PostgreSQL puede hostearse en **Supabase Free** de todas formas
- El despliegue es manual (FTP/SSH) vs. automático en Vercel
- **Recomendación:** usar Hostinger solo para el dominio, Vercel para el app

---

### Pipeline de CI/CD con Vercel

```
Developer hace git push a GitHub
        │
        ▼
Vercel detecta el push automáticamente
        │
        ▼
Build automático (npm run build)
        │
        ▼
Tests (si están configurados)
        │
        ▼
Deploy a producción en segundos
        │
        ▼
URL disponible: centrovecinal-centroamerica.vercel.app
        (+ dominio propio: www.centrovecinalcentroamerica.com.ar)
```

---

## 10. Seguridad

### Medidas implementadas

| Área | Medida | Implementación |
|------|--------|---------------|
| **Autenticación** | JWT con expiración corta + refresh token | Supabase Auth |
| **Rutas admin** | Middleware que verifica sesión en CADA request | Next.js middleware.ts |
| **Contraseñas** | Hashing bcrypt (nunca texto plano) | Supabase Auth |
| **API** | Rate limiting para prevenir abuso | Vercel Edge Config |
| **Subida de archivos** | Validación de tipo MIME y tamaño máximo | Sharp + Supabase Storage |
| **SQL Injection** | Consultas parametrizadas siempre | Supabase Client SDK |
| **XSS** | Sanitización del contenido WYSIWYG | DOMPurify |
| **HTTPS** | Certificado SSL automático | Vercel (gratis) |
| **Variables de entorno** | Keys nunca en el código | .env.local + Vercel Env |
| **CORS** | Headers configurados solo para el dominio propio | Next.js config |

---

## 11. Dockerización — Evaluación

### Veredicto: Docker parcial (solo entorno de desarrollo)

Con el stack elegido (Next.js + Supabase + Vercel), dockerizar la aplicación completa para producción **no aporta valor** — en cambio agrega complejidad innecesaria. Sin embargo, Docker **sí tiene sentido** para estandarizar el entorno de desarrollo local.

### ¿Por qué NO dockerizar para producción?

| Razón | Detalle |
|-------|---------|
| **Vercel ya containeriza internamente** | Vercel corre la app en su propia infraestructura de Edge Functions y serverless. Agregar un `Dockerfile` encima es redundante. |
| **Supabase es un servicio gestionado** | La DB, Auth y Storage corren en los servidores de Supabase. No hay nada que containerizar del lado del backend. |
| **CI/CD automático incluido** | Vercel detecta el push en GitHub y hace el build/deploy sin necesidad de orquestar contenedores. |
| **Complejidad sin ganancia** | Mantener imágenes Docker, registry, y orquestación (ECS, Railway, etc.) implica tiempo y costo extra que no se justifica para este proyecto. |

### ¿Por qué SÍ dockerizar el entorno de desarrollo local?

Supabase CLI usa Docker internamente para levantar una réplica local completa (PostgreSQL + Auth + Storage + Studio). Esto permite:

- **Desarrollar sin internet** — la DB corre en tu máquina
- **Consistencia entre devs** — cualquier colaborador levanta el mismo entorno con un comando
- **Pruebas seguras** — los cambios de schema se prueban localmente antes de aplicarlos en producción
- **Migraciones versionadas** — los cambios a la DB se guardan como archivos SQL en el repo

### Setup de desarrollo local con Docker

#### Prerrequisitos
```bash
# Instalar Docker Desktop (Windows/Mac/Linux)
# https://www.docker.com/products/docker-desktop/

# Instalar Supabase CLI
npm install -g supabase
```

#### Inicializar y levantar Supabase local

```bash
# Dentro de la carpeta del proyecto
supabase init

# Levanta los contenedores Docker de Supabase (primera vez tarda ~2 min)
supabase start
```

Al ejecutar `supabase start`, Docker levanta automáticamente estos contenedores:

```
CONTAINER                    PUERTO LOCAL
supabase_db_[proyecto]       5432   → PostgreSQL local
supabase_auth_[proyecto]     9999   → GoTrue Auth
supabase_storage_[proyecto]  5000   → Storage API
supabase_studio_[proyecto]   54323  → Panel visual de la DB (como pgAdmin)
supabase_inbucket_[proyecto] 54324  → Bandeja de emails de prueba
```

#### Variables de entorno para desarrollo local

```env
# .env.local (desarrollo)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clave-local-generada-por-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<clave-local-generada-por-supabase-start>
```

Las claves locales las muestra el CLI al ejecutar `supabase start`. Son distintas a las de producción y están en tu máquina únicamente.

#### Flujo de trabajo con migraciones

```bash
# Crear una migración nueva (ej: agregar tabla avisos)
supabase migration new crear_tabla_avisos

# Editar el archivo generado en supabase/migrations/
# Aplicar la migración en local
supabase db reset

# Cuando está lista, aplicar en producción
supabase db push
```

Los archivos de migración se guardan en el repo y documentan toda la historia del schema:

```
supabase/
├── migrations/
│   ├── 20260323_001_crear_tabla_avisos.sql
│   ├── 20260323_002_crear_tabla_actividades.sql
│   └── 20260323_003_crear_tabla_galeria.sql
├── seed.sql       # Datos de prueba para desarrollo
└── config.toml    # Configuración del proyecto Supabase
```

### Diagrama: entornos separados

```
┌──────────────────────────────┐     ┌──────────────────────────────┐
│   DESARROLLO LOCAL           │     │   PRODUCCIÓN                 │
│                              │     │                              │
│  Next.js  →  localhost:3000  │     │  Next.js  →  Vercel          │
│                              │     │                              │
│  Supabase local (Docker)     │     │  Supabase Cloud              │
│  ├── PostgreSQL :5432        │     │  ├── PostgreSQL (managed)    │
│  ├── Auth :9999              │     │  ├── Auth (managed)          │
│  ├── Storage :5000           │     │  ├── Storage (managed)       │
│  └── Studio :54323           │     │  └── Dashboard online        │
└──────────────────────────────┘     └──────────────────────────────┘
         git push  ────────────────────────────▶  deploy automático
         supabase db push  ────────────────────▶  migración aplicada
```

### Resumen de decisión

| Escenario | ¿Usar Docker? | Herramienta |
|-----------|--------------|-------------|
| Desarrollo local | **Sí** | Supabase CLI (Docker interno) |
| CI/CD y build | No necesario | Vercel (automático) |
| Base de datos producción | No necesario | Supabase Cloud |
| Servidor de la app producción | No necesario | Vercel |
| Escenario futuro: migrar a VPS propio | Sí | Docker Compose completo |

> **Nota para el futuro:** Si en algún momento se decide abandonar Vercel y hostearlo en un VPS propio (DigitalOcean, Contabo, etc.), ahí sí correspondería un `docker-compose.yml` completo con Next.js + Nginx + Supabase self-hosted. Ese escenario implicaría mayor control pero también mayor responsabilidad operativa.

---

## 12. Roadmap de Desarrollo

### Fase 1 — MVP (4-6 semanas)
- [ ] Setup del proyecto (Next.js + Supabase + Tailwind)
- [ ] Diseño del sistema (colores, tipografía, componentes base)
- [ ] Página de inicio con hero, actividades próximas y avisos
- [ ] Página de Avisos (listado público)
- [ ] Página de Actividades (listado + detalle + filtro por categoría)
- [ ] Página de Contacto con formulario
- [ ] Sistema de login para administradores
- [ ] Panel admin: CRUD de Avisos
- [ ] Panel admin: CRUD de Actividades
- [ ] Despliegue en Vercel con dominio

### Fase 2 — Completado (2-3 semanas)
- [ ] Página Sobre Nosotros
- [ ] Galería de imágenes con lightbox
- [ ] Panel admin: módulo de Galería
- [ ] Panel admin: ver mensajes de contacto
- [ ] SEO avanzado (sitemap.xml, robots.txt, Open Graph)
- [ ] PWA (instalar en celular)

### Fase 3 — Mejoras (futuro)
- [ ] Sistema de inscripción online a actividades
- [ ] Notificaciones por WhatsApp/email de avisos importantes
- [ ] Encuestas online para vecinos
- [ ] Blog de noticias del barrio
- [ ] Mapa interactivo del barrio
- [ ] Multi-idioma (español + lengua de señas argentina)

---

## 13. Estimación de Costos

### Desarrollo (horas estimadas)

| Módulo | Horas estimadas |
|--------|----------------|
| Setup + configuración inicial | 4h |
| Sistema de diseño + componentes base | 8h |
| Páginas públicas (todas) | 20h |
| Sistema de autenticación admin | 6h |
| Panel admin completo | 20h |
| API Routes + integración Supabase | 12h |
| Subida de imágenes | 4h |
| SEO + PWA | 4h |
| Testing y ajustes | 6h |
| Despliegue y configuración DNS | 2h |
| **TOTAL** | **~86 horas** |

### Infraestructura mensual (operativa)

| Escenario | Costo/mes |
|----------|-----------|
| Inicio (Free tiers) | $0 |
| Dominio propio | ~$1/mes (amortizado anual) |
| Crecimiento moderado (Pro) | ~$45/mes |

---

## Apéndice A — Comandos iniciales para crear el proyecto

```bash
# 1. Crear el proyecto Next.js con TypeScript y Tailwind
npx create-next-app@latest centro-vecinal \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

# 2. Instalar dependencias principales
cd centro-vecinal
npm install @supabase/supabase-js @supabase/ssr
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
npm install framer-motion
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react
npm install @tanstack/react-table
npm install resend

# 3. Instalar shadcn/ui
npx shadcn@latest init

# 4. Agregar componentes de shadcn/ui
npx shadcn@latest add button card input label badge
npx shadcn@latest add dialog alert-dialog toast
npx shadcn@latest add table form select textarea
```

---

## Apéndice B — Variables de entorno necesarias

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx  # Solo en servidor, nunca exponer

# Resend (emails)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@centrovecinalcentroamerica.com.ar
EMAIL_TO=admin@centrovecinalcentroamerica.com.ar

# App
NEXT_PUBLIC_APP_URL=https://www.centrovecinalcentroamerica.com.ar
```

---

*Documento generado para el proyecto Centro Vecinal Centro América — Marzo 2026*
