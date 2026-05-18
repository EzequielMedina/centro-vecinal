-- Habilitar Realtime en la tabla de mensajes de contacto
-- para que el panel admin reciba notificaciones en tiempo real.
-- Idempotente: solo agrega la tabla si aún no está en la publicación.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname    = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename  = 'contacto_mensajes'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.contacto_mensajes';
  END IF;
END
$$;
