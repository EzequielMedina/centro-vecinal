-- ============================================================
-- Tabla: admin_users
-- Extiende auth.users de Supabase con datos del perfil admin
-- ============================================================

CREATE TABLE public.admin_users (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL UNIQUE,
  nombre     TEXT        NOT NULL,
  rol        TEXT        NOT NULL DEFAULT 'admin'
                         CHECK (rol IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsqueda por email
CREATE INDEX admin_users_email_idx ON public.admin_users (email);

-- ── Row Level Security ──────────────────────────────────────

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Un admin solo puede leer su propio perfil
CREATE POLICY "admin puede ver su propio perfil"
  ON public.admin_users
  FOR SELECT
  USING (auth.uid() = id);

-- Solo service_role puede insertar/actualizar/eliminar
-- (las operaciones de gestión de usuarios usan el cliente con service_role)
CREATE POLICY "solo service_role puede escribir"
  ON public.admin_users
  FOR ALL
  USING (auth.role() = 'service_role');

-- ── Tabla rate_limit (para formulario de contacto) ──────────

CREATE TABLE public.rate_limit (
  ip           TEXT        PRIMARY KEY,
  count        INT         NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rate_limit ENABLE ROW LEVEL SECURITY;

-- Solo service_role opera rate_limit
CREATE POLICY "solo service_role"
  ON public.rate_limit
  FOR ALL
  USING (auth.role() = 'service_role');
