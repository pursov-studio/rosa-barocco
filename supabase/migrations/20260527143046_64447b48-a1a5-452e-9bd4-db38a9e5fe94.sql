
-- Fix search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Restrict has_role execute to authenticated only (needed for RLS policies)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- Restrict storage.objects SELECT to authenticated (public CDN access still works via bucket.public=true)
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
CREATE POLICY "Authenticated read product-images" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-images');
