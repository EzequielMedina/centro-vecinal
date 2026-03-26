-- ============================================================
-- Storage bucket: equipo
-- Fotos de los miembros del equipo directivo
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('equipo', 'equipo', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública
CREATE POLICY "equipo_storage_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'equipo');

-- Upload solo para admins autenticados
CREATE POLICY "equipo_storage_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'equipo'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- Delete solo para admins
CREATE POLICY "equipo_storage_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'equipo'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
