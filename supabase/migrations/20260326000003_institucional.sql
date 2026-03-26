-- ============================================================
-- Tablas: contenido_institucional y equipo_miembros
-- Página "Sobre Nosotros"
-- ============================================================

-- ── contenido_institucional ───────────────────────────────
CREATE TABLE public.contenido_institucional (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  seccion     TEXT        NOT NULL UNIQUE
                          CONSTRAINT seccion_enum CHECK (seccion IN ('historia', 'mision', 'valores')),
  contenido   TEXT        NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_contenido_institucional_updated_at
  BEFORE UPDATE ON public.contenido_institucional
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Filas iniciales: el admin edita, nunca crea desde cero
INSERT INTO public.contenido_institucional (seccion) VALUES
  ('historia'),
  ('mision'),
  ('valores');

ALTER TABLE public.contenido_institucional ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "institucional_select_public"
  ON public.contenido_institucional FOR SELECT
  USING (true);

-- Escritura solo para admins
CREATE POLICY "institucional_update_admin"
  ON public.contenido_institucional FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- ── equipo_miembros ────────────────────────────────────────
CREATE TABLE public.equipo_miembros (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT        NOT NULL,
  cargo       TEXT        NOT NULL,
  foto_url    TEXT,
  orden       INT         NOT NULL DEFAULT 0,
  activo      BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_equipo_activo_orden ON public.equipo_miembros (activo, orden);

CREATE TRIGGER set_equipo_miembros_updated_at
  BEFORE UPDATE ON public.equipo_miembros
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

ALTER TABLE public.equipo_miembros ENABLE ROW LEVEL SECURITY;

-- Lectura pública para miembros activos
CREATE POLICY "equipo_select_public"
  ON public.equipo_miembros FOR SELECT
  USING (activo = true);

-- CRUD solo para admins
CREATE POLICY "equipo_all_admin"
  ON public.equipo_miembros FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
