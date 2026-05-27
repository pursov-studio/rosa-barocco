// Fallback bundled images for products/categories seeded in DB.
// New uploads from admin store full URLs in DB; if image_url is null,
// we look up by slug here.
import platinumLux110 from "@/assets/products/platinum-lux-110.jpg";
import goldChic110 from "@/assets/products/gold-chic-110.jpg";
import goldChic100 from "@/assets/products/gold-chic-100.jpg";
import platinum100 from "@/assets/products/platinum-100.jpg";
import gold100 from "@/assets/products/gold-100.jpg";
import silverUniversal from "@/assets/products/silver-universal.jpg";
import silverAntiAcne from "@/assets/products/silver-anti-acne.jpg";
import setDiamantLux from "@/assets/products/set-diamant-lux.jpg";
import setDiamantCollection from "@/assets/products/set-diamant-collection.jpg";

import catSilver from "@/assets/category-silver.jpg";
import catGold from "@/assets/category-gold.jpg";
import catPlatinum from "@/assets/category-platinum.jpg";

export const productImageFallback: Record<string, string> = {
  "platinum-lux-110": platinumLux110,
  "gold-chic-110": goldChic110,
  "gold-chic-100": goldChic100,
  "platinum-100": platinum100,
  "gold-100": gold100,
  "silver-universal": silverUniversal,
  "silver-anti-acne": silverAntiAcne,
  "set-diamant-lux": setDiamantLux,
  "set-diamant-collection": setDiamantCollection,
};

export const categoryImageFallback: Record<string, string> = {
  "platinum-lux": catPlatinum,
  "gold-chic": catGold,
  platinum: catPlatinum,
  gold: catGold,
  "silver-universal": catSilver,
  "silver-anti-acne": catSilver,
};

export function resolveProductImage(slug: string, urlFromDb: string | null | undefined): string {
  return urlFromDb || productImageFallback[slug] || productImageFallback["silver-universal"];
}

export function resolveCategoryImage(slug: string, urlFromDb: string | null | undefined): string | undefined {
  return urlFromDb || categoryImageFallback[slug];
}
