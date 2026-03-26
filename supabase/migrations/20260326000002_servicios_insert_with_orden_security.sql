-- ============================================================
-- Patch de seguridad para insert_servicio_with_orden
-- Agrega verificación de admin antes del LOCK TABLE para
-- evitar que usuarios autenticados no-admin puedan provocar
-- bloqueos de tabla.
-- ============================================================
CREATE OR REPLACE FUNCTION public.insert_servicio_with_orden(
  p_nombre      TEXT,
  p_descripcion TEXT,
  p_icono       TEXT,
  p_activo      BOOLEAN
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_orden INT;
  v_id    UUID;
BEGIN
  -- Verificar que el llamante sea admin antes de adquirir cualquier lock
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  LOCK TABLE public.servicios IN SHARE ROW EXCLUSIVE MODE;
  SELECT COALESCE(MAX(orden), -1) + 1 INTO v_orden FROM public.servicios;
  INSERT INTO public.servicios (nombre, descripcion, icono, activo, orden)
    VALUES (p_nombre, p_descripcion, p_icono, p_activo, v_orden)
    RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
