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
