-- ============================================================
-- Tabla: actividades
-- Eventos y actividades del centro vecinal
-- ============================================================

CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TABLE public.actividades (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       TEXT        NOT NULL,
  slug         TEXT        NOT NULL UNIQUE,
  descripcion  TEXT        NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin    TIMESTAMPTZ,
  ubicacion    TEXT        NOT NULL DEFAULT '',
  capacidad    INT         CHECK (capacidad > 0),
  categoria    TEXT        NOT NULL
                           CHECK (categoria IN ('taller','deporte','cultural','apoyo-estudiantil','otro')),
  imagen_url   TEXT,
  activa       BOOLEAN     NOT NULL DEFAULT true,
  autor_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX actividades_slug_idx      ON public.actividades (slug);
CREATE INDEX actividades_activa_idx    ON public.actividades (activa);
CREATE INDEX actividades_categoria_idx ON public.actividades (categoria);
CREATE INDEX actividades_fecha_idx     ON public.actividades (fecha_inicio ASC);

-- Trigger para updated_at automático
CREATE TRIGGER actividades_updated_at
  BEFORE UPDATE ON public.actividades
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- ── Storage bucket ──────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('actividades', 'actividades', true)
ON CONFLICT (id) DO NOTHING;

-- ── Row Level Security ──────────────────────────────────────

ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo actividades activas
CREATE POLICY "lectura publica actividades activas"
  ON public.actividades
  FOR SELECT
  USING (activa = true);

-- Escritura: solo usuarios registrados en admin_users
CREATE POLICY "admins pueden escribir actividades"
  ON public.actividades
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- ── Storage policies (bucket: actividades) ──────────────────

CREATE POLICY "lectura publica storage actividades"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'actividades');

CREATE POLICY "admins pueden escribir storage actividades"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'actividades' AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (bucket_id = 'actividades' AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
