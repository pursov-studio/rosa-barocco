import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Price } from "@/components/common/Price";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getCategoryBySlug, getProductBySlug, getProductsByCategory } from "@/lib/catalog/seed";
import { useCart } from "@/lib/cart/store";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const p = getProductBySlug(params.slug);
    if (!p) return { meta: [{ title: "Товар — ROSA&BAROCCO" }] };
    const title = `${p.name} — ROSA&BAROCCO`;
    return {
      meta: [
        { title },
        { name: "description", content: p.shortDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: p.shortDescription },
        { property: "og:image", content: p.images[0] },
      ],
    };
  },
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  notFoundComponent: () => (
    <Container className="py-20 text-center">
      <h1 className="font-display text-2xl">Товар не найден</h1>
      <Link to="/catalog" className="mt-4 inline-block text-primary">В каталог</Link>
    </Container>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"composition" | "usage" | "areas">("composition");
  const add = useCart((s) => s.add);
  const category = getCategoryBySlug(product.categorySlug);
  const related = getProductsByCategory(product.categorySlug).filter(
    (p) => p.id !== product.id,
  );

  function handleAdd() {
    add(product, qty);
    toast.success("Добавлено в корзину", { description: product.name });
  }

  return (
    <>
      <Container className="py-8 pb-32 sm:py-12 sm:pb-12">
        <Link to="/catalog" className="text-sm text-muted-foreground hover:text-foreground">
          ← Каталог
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="overflow-hidden rounded-3xl bg-secondary/40">
            <img
              src={product.images[0]}
              alt={product.name}
              width={1200}
              height={1200}
              className="aspect-square w-full object-cover"
            />
          </div>

          <div>
            {category && (
              <Link
                to="/catalog/$category"
                params={{ category: category.slug }}
                className="text-[0.7rem] uppercase tracking-[0.22em] text-primary"
              >
                {category.shortName}
              </Link>
            )}
            <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
              {product.name}
            </h1>
            <Price value={product.price} className="mt-4 block text-2xl font-medium" />

            <p className="mt-5 text-muted-foreground">{product.shortDescription}</p>

            <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
              {product.volumeMl && (
                <>
                  <dt className="text-muted-foreground">Объём</dt>
                  <dd>{product.volumeMl} мл</dd>
                </>
              )}
              {product.weightG && (
                <>
                  <dt className="text-muted-foreground">Вес</dt>
                  <dd>{product.weightG} г</dd>
                </>
              )}
              <dt className="text-muted-foreground">Артикул</dt>
              <dd className="font-mono text-xs">{product.sku}</dd>
            </dl>

            {/* Desktop CTA */}
            <div className="mt-8 hidden items-center gap-3 sm:flex">
              <QtyControl qty={qty} setQty={setQty} />
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                <ShoppingBag className="h-4 w-4" /> В корзину
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-10">
              <div className="flex gap-6 border-b border-border">
                {(
                  [
                    { id: "composition", label: "Состав" },
                    { id: "usage", label: "Применение" },
                    { id: "areas", label: "Зоны и кожа" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
                      tab === t.id
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="pt-5 text-sm leading-relaxed text-muted-foreground">
                {tab === "composition" && (
                  <p>{product.composition ?? "Информация о составе уточняется."}</p>
                )}
                {tab === "usage" && (
                  <p>{product.usage ?? "Рекомендации по применению уточняются."}</p>
                )}
                {tab === "areas" && (
                  <div className="space-y-3">
                    {product.areas && (
                      <p>
                        <span className="text-foreground">Зоны: </span>
                        {product.areas.join(", ")}
                      </p>
                    )}
                    {product.skinType && (
                      <p>
                        <span className="text-foreground">Тип кожи: </span>
                        {product.skinType.join(", ")}
                      </p>
                    )}
                    {product.target && (
                      <p>
                        <span className="text-foreground">Назначение: </span>
                        {product.target}
                      </p>
                    )}
                    {!product.areas && !product.skinType && !product.target && (
                      <p>Подходит для повседневного ухода.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl sm:text-3xl">Из этой коллекции</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </Container>

      {/* Sticky bottom CTA (mobile) */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="flex items-center gap-3">
          <QtyControl qty={qty} setQty={setQty} />
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background"
          >
            <ShoppingBag className="h-4 w-4" />
            В корзину · <Price value={product.price * qty} />
          </button>
        </div>
      </div>
    </>
  );
}

function QtyControl({
  qty,
  setQty,
}: {
  qty: number;
  setQty: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border">
      <button
        type="button"
        onClick={() => setQty(Math.max(1, qty - 1))}
        className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
        aria-label="Минус"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums">{qty}</span>
      <button
        type="button"
        onClick={() => setQty(qty + 1)}
        className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
        aria-label="Плюс"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
