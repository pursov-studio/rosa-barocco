export type CategorySlug =
  | "platinum-lux"
  | "gold-chic"
  | "platinum"
  | "gold"
  | "silver-universal"
  | "silver-anti-acne"
  | "sets";

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  metal: "platinum" | "gold" | "silver" | "mix";
  description?: string;
  image?: string;
}

export interface ProductVariant {
  id: string;
  volumeMl: number;
  price: number;
  sku: string | null;
  inStock: boolean;
  sort: number;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  categorySlug: CategorySlug;
  price: number;
  currency: "RUB";
  volumeMl?: number;
  weightG?: number;
  composition?: string;
  shortDescription: string;
  areas?: string[];
  skinType?: string[];
  usage?: string;
  target?: string;
  images: string[];
  inStock: boolean;
  isSet?: boolean;
  bundleItems?: string[];
  variants: ProductVariant[];
}

export interface Review {
  id: string;
  author: string;
  text: string;
}
