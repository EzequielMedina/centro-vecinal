-- Habilitar Realtime en la tabla de mensajes de contacto
-- para que el panel admin reciba notificaciones en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacto_mensajes;
