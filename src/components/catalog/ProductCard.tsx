import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Product } from "@/lib/catalog/types";
import { Price } from "@/components/common/Price";
import { getCategoryBySlug } from "@/lib/catalog/seed";
import { formatPriceFrom, useCart } from "@/lib/cart/store";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const category = getCategoryBySlug(product.categorySlug);
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const onlyOne = variants.length === 1 ? variants[0] : null;
  const priceFrom = product.price;
  const positivePrices = variants.map((v) => v.price).filter((p) => p > 0);
  const showFrom = positivePrices.length > 1 && new Set(positivePrices).size > 1;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!onlyOne) return;
    add(product, onlyOne, 1);
    toast.success("Добавлено в корзину", { description: product.name });
  }

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
    >
      <div className="p-3">
        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-secondary/40">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            width={800}
            height={800}
            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {category && (
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-primary">
            {category.shortName}
          </span>
        )}
        <h3 className="font-display text-base leading-snug">{product.name}</h3>
        {hasVariants ? (
          <p className="text-xs text-muted-foreground">
            {variants.map((v) => `${v.volumeMl} мл`).join(" · ")}
          </p>
        ) : product.volumeMl ? (
          <p className="text-xs text-muted-foreground">{product.volumeMl} мл</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          {priceFrom > 0 ? (
            showFrom ? (
              <span className="text-[15px] font-semibold tabular-nums">
                {formatPriceFrom(priceFrom)}
              </span>
            ) : (
              <Price value={priceFrom} className="text-[15px] font-semibold" />
            )
          ) : (
            <span className="text-xs text-muted-foreground">Цена уточняется</span>
          )}
          {onlyOne ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Добавить ${product.name} в корзину`}
              className="rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-transform hover:scale-105 active:scale-95"
            >
              В корзину
            </button>
          ) : hasVariants ? (
            <span className="text-xs text-muted-foreground">Выбрать объём →</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
