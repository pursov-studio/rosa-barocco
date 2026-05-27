import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/catalog/types";
import { Price } from "@/components/common/Price";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
    >
      <div className="aspect-square w-full overflow-hidden bg-secondary/40">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base leading-snug">{product.name}</h3>
        {product.volumeMl && (
          <p className="text-xs text-muted-foreground">{product.volumeMl} мл</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <Price value={product.price} className="text-base font-medium" />
          <span className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Подробнее →
          </span>
        </div>
      </div>
    </Link>
  );
}
