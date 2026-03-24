-- ============================================================
-- Tabla: avisos
-- Publicaciones/noticias del centro vecinal
-- ============================================================

CREATE TABLE public.avisos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  contenido   TEXT        NOT NULL,
  imagen_url  TEXT,
  destacado   BOOLEAN     NOT NULL DEFAULT false,
  activo      BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX avisos_slug_idx     ON public.avisos (slug);
CREATE INDEX avisos_activo_idx   ON public.avisos (activo);
CREATE INDEX avisos_destacado_idx ON public.avisos (destacado) WHERE destacado = true;

-- Trigger para updated_at automático
CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TRIGGER avisos_updated_at
  BEFORE UPDATE ON public.avisos
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- ── Storage bucket ──────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('avisos', 'avisos', true)
ON CONFLICT (id) DO NOTHING;

-- ── Row Level Security ──────────────────────────────────────

ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo avisos activos
CREATE POLICY "lectura publica avisos activos"
  ON public.avisos
  FOR SELECT
  USING (activo = true);

-- Escritura: solo usuarios autenticados (admins)
CREATE POLICY "admins pueden escribir avisos"
  ON public.avisos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
