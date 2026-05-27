import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/catalog/types";
import { Price } from "@/components/common/Price";
import { getCategoryBySlug } from "@/lib/catalog/seed";
import { useCart } from "@/lib/cart/store";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const category = getCategoryBySlug(product.categorySlug);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(product, 1);
    toast.success("Добавлено в корзину", { description: product.name });
  }

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
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
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {category && (
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-primary">
            {category.shortName}
          </span>
        )}
        <h3 className="font-display text-base leading-snug">{product.name}</h3>
        {product.volumeMl && (
          <p className="text-xs text-muted-foreground">{product.volumeMl} мл</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <Price value={product.price} className="text-[15px] font-semibold" />
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Добавить ${product.name} в корзину`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
