-- Tabla de mensajes de contacto
CREATE TABLE public.contacto_mensajes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  asunto      TEXT        NOT NULL,
  mensaje     TEXT        NOT NULL,
  leido       BOOLEAN     NOT NULL DEFAULT false,
  ip          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contacto_mensajes ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede insertar (enviar un mensaje)
CREATE POLICY "contacto_mensajes_insert_public"
  ON public.contacto_mensajes FOR INSERT
  TO public
  WITH CHECK (true);

-- Solo admins autenticados pueden leer, actualizar y eliminar
CREATE POLICY "contacto_mensajes_select_admin"
  ON public.contacto_mensajes FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "contacto_mensajes_update_admin"
  ON public.contacto_mensajes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "contacto_mensajes_delete_admin"
  ON public.contacto_mensajes FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

