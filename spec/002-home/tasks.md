# Tasks: Página de Inicio (Home)

**Branch**: `002-home`
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

> **Dependencia**: Requiere que `003-avisos` y `004-actividades` tengan sus tablas y datos de prueba en DB.

---

## Fase 0 — Sistema de diseño base

- [ ] **T001** Configurar paleta de colores en `tailwind.config.ts`: teal `#2D6A7F`, rojo `#D32F2F`, ámbar `#F59E0B`, salvia `#6B8C7A`
- [ ] **T002** Configurar fuentes en `app/layout.tsx` via `next/font/google`: Poppins (títulos) + Inter (cuerpo)
- [ ] **T003** Instalar y configurar shadcn/ui: `npx shadcn@latest init` con el tema basado en la paleta
- [ ] **T004** Agregar componentes shadcn base: `Button`, `Card`, `Badge`
- [ ] **T005** Crear componente `EmptyStateCard.tsx` reutilizable (ícono + título + descripción para estados vacíos)
- [ ] **T006** Crear `app/layout.tsx` global con Navbar pública y Footer

---

## Fase 1 — Queries de datos

- [ ] **T007** Implementar `getAvisosDestacados()` en `lib/queries/avisos.ts`: SELECT WHERE `destacado = true AND activo = true` ORDER BY `created_at DESC` LIMIT 3
- [ ] **T008** Implementar `getProximasActividades()` en `lib/queries/actividades.ts`: SELECT WHERE `fecha_inicio > NOW() AND activa = true` ORDER BY `fecha_inicio ASC` LIMIT 3
- [ ] **T009** Implementar `getServiciosActivos()` en `lib/queries/servicios.ts`: SELECT WHERE `activo = true` ORDER BY `orden ASC`
- [ ] **T010** Tipar los retornos de todas las queries con tipos derivados del schema de Supabase

---

## Fase 2 — Componentes de secciones

- [ ] **T011** Crear `HeroSection.tsx`: logo con `next/image priority`, nombre del centro, tagline, botón CTA → `/actividades`. Fondo con gradiente suave de la paleta
- [ ] **T012** Crear `AvisosDestacadosSection.tsx`: grid 1→3 columnas, cards con título, fecha formateada, resumen sin HTML (strip + truncar 150 chars), imagen, link a `/avisos/[slug]`
- [ ] **T013** Crear `ProximasActividadesSection.tsx`: cards con título, fecha, badge categoría con color, imagen, link a `/actividades/[slug]`
- [ ] **T014** Crear `ServiciosResumenSection.tsx`: grid de ícono Lucide + nombre de servicio. Link "Ver todos" → `/servicios`
- [ ] **T015** Crear `ContactoInfoSection.tsx`: dirección (link Google Maps), horarios, teléfono (link `tel:`), email (link `mailto:`)
- [ ] **T016** Aplicar estado vacío (`EmptyStateCard`) en cada sección cuando no hay datos en DB

---

## Fase 3 — Página principal e ISR

- [ ] **T017** Crear `app/(public)/page.tsx` como Server Component con `Promise.all` de las 3 queries en paralelo
- [ ] **T018** Agregar `export const revalidate = 60` para ISR de 60 segundos
- [ ] **T019** Implementar `generateMetadata()` con title, description, Open Graph image y URL canónica
- [ ] **T020** Agregar JSON-LD schema `LocalBusiness` con nombre, dirección, horarios y teléfono del centro

---

## Fase 4 — Animaciones y performance

- [ ] **T021** Instalar Framer Motion e implementar animaciones `useInView` en la entrada de cada sección
- [ ] **T022** Respetar `prefers-reduced-motion`: deshabilitar animaciones si el usuario lo tiene activo
- [ ] **T023** Auditar con Lighthouse mobile y corregir hasta alcanzar score ≥ 85
- [ ] **T024** Verificar que todas las imágenes del hero usan `priority` y el resto `loading="lazy"`
- [ ] **T025** Verificar contraste WCAG AA en todos los textos sobre fondos de color

---

## Criterios de Done

- [ ] Home carga con todas sus secciones sin errores en mobile y desktop
- [ ] Avisos destacados y próximas actividades se muestran si existen en DB
- [ ] Cada sección muestra su `EmptyStateCard` cuando no hay datos
- [ ] Lighthouse Performance mobile ≥ 85
- [ ] Meta tags Open Graph correctos (verificar con og:debugger)
