import type { Product, ProductVariant, CategorySlug } from "./types";

type DBVariant = {
  id: string;
  volume_ml: number;
  price: number;
  sku: string | null;
  in_stock: boolean;
  sort: number;
};

type DBProduct = {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  category_slug: string;
  price: number;
  short_description: string;
  composition: string | null;
  usage: string | null;
  volume_ml: number | null;
  weight_g: number | null;
  areas: string[] | null;
  skin_type: string[] | null;
  target: string | null;
  image_url: string | null;
  images?: string[] | null;
  in_stock: boolean;
  is_set: boolean;
  bundle_items: string[] | null;
  sort: number;
  product_variants?: DBVariant[] | null;
};

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'><rect width='800' height='800' fill='%23f4efe7'/><text x='50%' y='50%' dy='.3em' fill='%23b9aa92' font-family='serif' font-size='40' text-anchor='middle'>ROSA&amp;BAROCCO</text></svg>`,
  );

export function normalizeProduct(row: DBProduct): Product {
  const variants: ProductVariant[] = (row.product_variants ?? [])
    .map((v) => ({
      id: v.id,
      volumeMl: v.volume_ml,
      price: v.price,
      sku: v.sku,
      inStock: v.in_stock,
      sort: v.sort,
    }))
    .sort((a, b) => a.sort - b.sort || a.volumeMl - b.volumeMl);

  const positivePrices = variants.map((v) => v.price).filter((p) => p > 0);
  const priceFrom = positivePrices.length
    ? Math.min(...positivePrices)
    : row.price ?? 0;

  return {
    id: row.id,
    slug: row.slug,
    sku: variants[0]?.sku ?? row.sku ?? "",
    name: row.name,
    categorySlug: row.category_slug as CategorySlug,
    price: priceFrom,
    currency: "RUB",
    volumeMl: variants[0]?.volumeMl ?? row.volume_ml ?? undefined,
    weightG: row.weight_g ?? undefined,
    composition: row.composition ?? undefined,
    shortDescription: row.short_description ?? "",
    areas: row.areas ?? [],
    skinType: row.skin_type ?? [],
    usage: row.usage ?? undefined,
    target: row.target ?? undefined,
    images: (row.images && row.images.length > 0)
      ? row.images.filter(Boolean)
      : [row.image_url || PLACEHOLDER_IMG],
    inStock: variants.length
      ? variants.some((v) => v.inStock)
      : row.in_stock,
    isSet: row.is_set,
    bundleItems: row.bundle_items ?? [],
    variants,
  };
}

export { PLACEHOLDER_IMG };
