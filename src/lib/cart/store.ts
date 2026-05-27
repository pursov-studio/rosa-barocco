import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/catalog/types";

export const FREE_SHIPPING_THRESHOLD = 1500;

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0],
                qty,
              },
            ],
          };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQty: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.productId === productId ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "rb-cart" },
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
