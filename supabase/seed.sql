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
