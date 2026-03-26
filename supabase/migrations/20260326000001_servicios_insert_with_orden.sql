-- ============================================================
-- Función: insert_servicio_with_orden
-- Inserta un nuevo servicio asignando orden = MAX(orden)+1 de
-- forma atómica, evitando duplicados de orden ante inserciones
-- concurrentes.
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
  LOCK TABLE public.servicios IN SHARE ROW EXCLUSIVE MODE;
  SELECT COALESCE(MAX(orden), -1) + 1 INTO v_orden FROM public.servicios;
  INSERT INTO public.servicios (nombre, descripcion, icono, activo, orden)
    VALUES (p_nombre, p_descripcion, p_icono, p_activo, v_orden)
    RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Permiso de ejecución para usuarios autenticados
GRANT EXECUTE ON FUNCTION public.insert_servicio_with_orden TO authenticated;
