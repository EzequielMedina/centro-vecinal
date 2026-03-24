-- ============================================================
-- Tabla: servicios
-- Servicios que ofrece el centro vecinal
-- ============================================================

CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TABLE public.servicios (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT        NOT NULL UNIQUE,
  descripcion TEXT        NOT NULL DEFAULT '',
  icono       TEXT        NOT NULL DEFAULT 'circle',   -- nombre del ícono Lucide
  orden       INT         NOT NULL DEFAULT 0,
  activo      BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_servicios_activo_orden ON public.servicios (activo, orden);

CREATE TRIGGER set_servicios_updated_at
  BEFORE UPDATE ON public.servicios
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;

-- Lectura pública para servicios activos
CREATE POLICY "servicios_select_public"
  ON public.servicios FOR SELECT
  USING (activo = true);

-- CRUD solo para admins autenticados
CREATE POLICY "servicios_all_admin"
  ON public.servicios FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
