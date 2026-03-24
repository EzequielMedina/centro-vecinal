-- ============================================================
-- Seed de desarrollo local
-- Crea el superadmin inicial para poder testear el login
-- ============================================================

-- Crear usuario en auth.users (Supabase Auth)
-- Contraseña: Admin1234! (solo para desarrollo local)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change_token,
  reauthentication_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@centrovecinal.local',
  crypt('Admin1234!', gen_salt('bf')),
  NOW(),
  '{"nombre": "Administrador Local"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- Crear identidad asociada
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  created_at,
  updated_at,
  last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'admin@centrovecinal.local',
  'email',
  '{"sub": "00000000-0000-0000-0000-000000000001", "email": "admin@centrovecinal.local"}',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Crear perfil en admin_users
INSERT INTO public.admin_users (id, email, nombre, rol) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@centrovecinal.local',
  'Administrador Local',
  'superadmin'
)
ON CONFLICT (id) DO NOTHING;

-- ── Avisos de prueba ─────────────────────────────────────────

INSERT INTO public.avisos (id, titulo, slug, contenido, destacado, activo, created_at) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'Reunión vecinal mensual',
  'reunion-vecinal-mensual',
  '<p>Este mes nos reunimos el <strong>último viernes a las 19:00 hs</strong> en el salón del centro vecinal.</p><p>Se tratarán temas de seguridad barrial, mejoras en los espacios verdes y organización de las fiestas de fin de año.</p><p>¡Los esperamos a todos!</p>',
  true,
  true,
  NOW() - INTERVAL '2 days'
),
(
  '10000000-0000-0000-0000-000000000002',
  'Corte de agua programado',
  'corte-de-agua-programado',
  '<p>Se informa a los vecinos que el día <strong>jueves 27 de marzo</strong> habrá un corte de agua programado entre las <strong>9:00 y las 17:00 hs</strong> por trabajos de mantenimiento en la red.</p><p>Se recomienda tener agua almacenada con anticipación.</p>',
  false,
  true,
  NOW() - INTERVAL '5 days'
),
(
  '10000000-0000-0000-0000-000000000003',
  'Aviso de prueba inactivo',
  'aviso-prueba-inactivo',
  '<p>Este aviso está inactivo y no debe verse en la página pública.</p>',
  false,
  false,
  NOW() - INTERVAL '10 days'
)
ON CONFLICT (id) DO NOTHING;

-- ── Actividades de prueba ─────────────────────────────────────

INSERT INTO public.actividades (id, titulo, slug, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad, categoria, activa, autor_id) VALUES
(
  '20000000-0000-0000-0000-000000000001',
  'Taller de cerámica para adultos',
  'taller-ceramica-adultos',
  '<p>Aprendé técnicas de modelado en arcilla con la instructora Marta Gómez. No se requiere experiencia previa.</p><ul><li>Materiales incluidos</li><li>Grupos reducidos</li></ul>',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '2 hours',
  'Salón de usos múltiples — Centro Vecinal',
  20,
  'taller',
  true,
  '00000000-0000-0000-0000-000000000001'
),
(
  '20000000-0000-0000-0000-000000000002',
  'Apoyo escolar matemáticas — nivel secundario',
  'apoyo-escolar-matematicas-secundario',
  '<p>Clases de apoyo en matemáticas para alumnos de secundaria. Dictadas por docentes voluntarios del barrio.</p><p><strong>Horarios:</strong> Martes y jueves de 17:00 a 19:00 hs.</p>',
  NOW() + INTERVAL '2 days',
  NULL,
  'Aula 1 — Centro Vecinal',
  15,
  'apoyo-estudiantil',
  true,
  '00000000-0000-0000-0000-000000000001'
),
(
  '20000000-0000-0000-0000-000000000003',
  'Torneo de fútbol barrial',
  'torneo-futbol-barrial',
  '<p>Torneo de fútbol 5 para vecinos del barrio. Inscripción por equipos de 6 jugadores.</p>',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days' + INTERVAL '4 hours',
  'Cancha municipal — Av. San Martín 1200',
  NULL,
  'deporte',
  true,
  '00000000-0000-0000-0000-000000000001'
),
(
  '20000000-0000-0000-0000-000000000004',
  'Actividad inactiva de prueba',
  'actividad-inactiva-prueba',
  '<p>Esta actividad no debe verse en el sitio público.</p>',
  NOW() + INTERVAL '30 days',
  NULL,
  'Sin ubicación',
  NULL,
  'otro',
  false,
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-- ── Servicios de prueba ────────────────────────────────────
INSERT INTO public.servicios (id, nombre, descripcion, icono, orden, activo) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Talleres y Cursos',       'Talleres de manualidades, computación, cocina y más.',         'BookOpen',      1, true),
  ('30000000-0000-0000-0000-000000000002', 'Actividades Deportivas',  'Clases de fútbol, gimnasia y deportes para todas las edades.', 'Trophy',        2, true),
  ('30000000-0000-0000-0000-000000000003', 'Apoyo Escolar',           'Refuerzo educativo para niños y adolescentes.',               'GraduationCap', 3, true),
  ('30000000-0000-0000-0000-000000000004', 'Eventos Culturales',      'Obras de teatro, música en vivo y exposiciones.',             'Music',         4, true),
  ('30000000-0000-0000-0000-000000000005', 'Asesoramiento Legal',     'Consultas gratuitas con profesionales del barrio.',           'Scale',         5, true),
  ('30000000-0000-0000-0000-000000000006', 'Biblioteca Popular',      'Préstamo de libros y sala de lectura abierta.',               'Library',       6, false)
ON CONFLICT (id) DO NOTHING;
