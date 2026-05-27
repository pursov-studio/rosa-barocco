
-- Allow anonymous users to read product images (bucket is public-facing storefront)
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

-- Lock down SECURITY DEFINER helpers so they aren't directly callable via the API
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- has_role is invoked by RLS policies running as 'authenticated', keep that grant
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
