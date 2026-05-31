import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductVariant } from "@/lib/catalog/types";

export const FREE_SHIPPING_THRESHOLD = 1500;

export interface CartItem {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  volumeMl: number | null;
  price: number;
  image?: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  add: (product: Product, variant: ProductVariant, qty?: number) => void;
  remove: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (product, variant, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === variant.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === variant.id ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                variantId: variant.id,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                volumeMl: variant.volumeMl ?? null,
                price: variant.price,
                image: product.images[0],
                qty,
              },
            ],
          };
        }),
      remove: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      updateQty: (variantId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.variantId === variantId ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "rb-cart",
      version: 2,
      migrate: () => ({ items: [] }) as any,
    },
  ),
);

export const cartSelectors = {
  count: (s: CartState) => s.items.reduce((sum, i) => sum + i.qty, 0),
  subtotal: (s: CartState) =>
    s.items.reduce((sum, i) => sum + i.price * i.qty, 0),
};

export function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPriceFrom(value: number) {
  if (!value) return "Цена уточняется";
  return `от ${formatPrice(value)}`;
}
