-- Índices para countUnread() y ordenamiento de bandeja
CREATE INDEX contacto_mensajes_leido_created_at_idx
  ON public.contacto_mensajes (leido, created_at DESC);

-- El INSERT público permite bypass del rate limiting vía anon key.
-- Las inserciones se hacen exclusivamente desde el Server Action con service_role.
DROP POLICY IF EXISTS "contacto_mensajes_insert_public" ON public.contacto_mensajes;

CREATE POLICY "contacto_mensajes_insert_service"
  ON public.contacto_mensajes FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Función atómica de rate limiting (evita condición de carrera).
-- Lee e incrementa el contador en una sola operación dentro de la DB.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  ip_address      TEXT,
  ventana_minutos INT  DEFAULT 10,
  max_intentos    INT  DEFAULT 3
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count        INT;
  v_window_start TIMESTAMPTZ;
BEGIN
  SELECT count, window_start
    INTO v_count, v_window_start
    FROM public.rate_limit
   WHERE ip = ip_address;

  IF NOT FOUND THEN
    INSERT INTO public.rate_limit (ip, count, window_start)
    VALUES (ip_address, 1, NOW());
    RETURN TRUE;
  END IF;

  -- Ventana expirada: resetear
  IF v_window_start < NOW() - (ventana_minutos || ' minutes')::INTERVAL THEN
    UPDATE public.rate_limit
       SET count = 1, window_start = NOW()
     WHERE ip = ip_address;
    RETURN TRUE;
  END IF;

  -- Límite alcanzado
  IF v_count >= max_intentos THEN
    RETURN FALSE;
  END IF;

  -- Incrementar dentro de la misma transacción
  UPDATE public.rate_limit
     SET count = count + 1
   WHERE ip = ip_address;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO service_role;
