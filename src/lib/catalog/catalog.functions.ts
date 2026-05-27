import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listCategoriesPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
});

export const listProductsPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("sort", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
});

export const getProductBySlugPublic = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return product;
  });

export const getSiteContent = createServerFn({ method: "GET" })
  .inputValidator((data: { key: string }) => data)
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", data.key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row?.value ?? {}) as Record<string, unknown>;
  });
