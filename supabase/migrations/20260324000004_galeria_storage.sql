-- ============================================================
-- Storage: bucket y policies para galería
-- ============================================================

-- Crear bucket 'galeria' (idempotente)
INSERT INTO storage.buckets (id, name, public)
VALUES ('galeria', 'galeria', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública solo para objetos del bucket 'galeria'
CREATE POLICY "galeria_storage_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'galeria');

-- Acceso completo a objetos de 'galeria' solo para admins autenticados
CREATE POLICY "galeria_storage_all_admin"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'galeria'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    bucket_id = 'galeria'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
