import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { CartItem } from "@/lib/cart/store";
import { useCart } from "@/lib/cart/store";
import { Price } from "@/components/common/Price";

export function CartItemRow({ item }: { item: CartItem }) {
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);

  return (
    <div className="flex gap-4 border-b border-border/60 py-4 last:border-0">
      <Link
        to="/product/$slug"
        params={{ slug: item.slug }}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary/40 sm:h-24 sm:w-24"
      >
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            width={200}
            height={200}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              to="/product/$slug"
              params={{ slug: item.slug }}
              className="font-display text-sm leading-snug sm:text-base"
            >
              {item.name}
            </Link>
            {item.volumeMl && (
              <div className="mt-0.5 text-xs text-muted-foreground">{item.volumeMl} мл</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(item.variantId)}
            aria-label="Удалить"
            className="text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="inline-flex items-center rounded-full border border-border">
            <button
              type="button"
              onClick={() => updateQty(item.variantId, item.qty - 1)}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Минус"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-sm tabular-nums">{item.qty}</span>
            <button
              type="button"
              onClick={() => updateQty(item.variantId, item.qty + 1)}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Плюс"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <Price value={item.price * item.qty} className="font-medium" />
        </div>
      </div>
    </div>
  );
}
