import { FREE_SHIPPING_THRESHOLD, formatPrice } from "@/lib/cart/store";

export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
      <p className="text-xs text-muted-foreground">
        {remaining > 0 ? (
          <>До бесплатной доставки осталось <span className="font-medium text-foreground">{formatPrice(remaining)}</span></>
        ) : (
          <span className="font-medium text-foreground">Бесплатная доставка уже доступна</span>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
