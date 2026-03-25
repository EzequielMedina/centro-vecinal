-- ============================================================
-- Tabla: galeria
-- Imágenes de la galería del centro vecinal
-- ============================================================

CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TABLE public.galeria (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT        NOT NULL DEFAULT '',
  descripcion TEXT        NOT NULL DEFAULT '',
  url         TEXT        NOT NULL,
  categoria   TEXT        NOT NULL DEFAULT '',
  orden       INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_galeria_orden_created ON public.galeria (orden ASC, created_at DESC);

CREATE TRIGGER set_galeria_updated_at
  BEFORE UPDATE ON public.galeria
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.galeria ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "galeria_select_public"
  ON public.galeria FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE solo para admins autenticados
CREATE POLICY "galeria_all_admin"
  ON public.galeria FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
