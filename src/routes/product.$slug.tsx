import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Price } from "@/components/common/Price";
import { ProductCard } from "@/components/catalog/ProductCard";
import { StickyBar } from "@/components/common/StickyBar";
import { getCategoryBySlug } from "@/lib/catalog/seed";
import { getProductBySlugPublic, listProductsPublic } from "@/lib/catalog/catalog.functions";
import { useCart } from "@/lib/cart/store";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlugPublic({ data: { slug } }),
  });
const allProductsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProductsPublic(),
});

export const Route = createFileRoute("/product/$slug")({
  head: ({ loaderData }) => {
    const p = loaderData?.product;
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
  loader: async ({ params, context }) => {
    const product = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!product) throw notFound();
    await context.queryClient.ensureQueryData(allProductsQuery);
    return { product };
  },
  notFoundComponent: () => (
    <Container className="py-20 text-center">
      <h1 className="font-display text-2xl">Товар не найден</h1>
      <Link to="/catalog" className="mt-4 inline-block text-primary">В каталог</Link>
    </Container>
  ),
  errorComponent: ({ error }) => (
    <Container className="py-20 text-center">
      <h1 className="font-display text-2xl">Ошибка загрузки</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </Container>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  const { data: allProducts } = useSuspenseQuery(allProductsQuery);
  const variants = product?.variants ?? [];
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    variants[0]?.id,
  );
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"composition" | "usage" | "areas">("composition");
  const add = useCart((s) => s.add);

  if (!product) return null;
  const category = getCategoryBySlug(product.categorySlug);
  const related = allProducts
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id);

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0];
  const currentPrice = selectedVariant?.price ?? product.price;

  function handleAdd() {
    if (!selectedVariant) {
      toast.error("Выберите объём");
      return;
    }
    add(product!, selectedVariant, qty);
    toast.success("Добавлено в корзину", {
      description: `${product!.name} · ${selectedVariant.volumeMl} мл`,
    });
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

            {variants.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Объём
                </div>
                <div className="inline-flex rounded-full border border-border p-1">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={!v.inStock}
                      className={
                        "rounded-full px-4 py-2 text-sm transition-colors " +
                        (selectedVariantId === v.id
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground")
                      }
                    >
                      {v.volumeMl} мл
                      {!v.inStock && <span className="ml-1 text-xs">(нет)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              {currentPrice > 0 ? (
                <Price value={currentPrice} className="block text-2xl font-medium" />
              ) : (
                <span className="block text-base text-muted-foreground">
                  Цена уточняется
                </span>
              )}
            </div>

            <p className="mt-5 text-muted-foreground">{product.shortDescription}</p>

            <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
              {selectedVariant?.volumeMl && (
                <>
                  <dt className="text-muted-foreground">Объём</dt>
                  <dd>{selectedVariant.volumeMl} мл</dd>
                </>
              )}
              {selectedVariant?.sku && (
                <>
                  <dt className="text-muted-foreground">Артикул</dt>
                  <dd className="font-mono text-xs">{selectedVariant.sku}</dd>
                </>
              )}
            </dl>

            {/* Desktop CTA */}
            <div className="mt-8 hidden items-center gap-3 sm:flex">
              <QtyControl qty={qty} setQty={setQty} />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedVariant?.inStock}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
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
                    {product.areas && product.areas.length > 0 && (
                      <p>
                        <span className="text-foreground">Зоны: </span>
                        {product.areas.join(", ")}
                      </p>
                    )}
                    {product.skinType && product.skinType.length > 0 && (
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
                    {(!product.areas || product.areas.length === 0) &&
                      (!product.skinType || product.skinType.length === 0) &&
                      !product.target && (
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
      <StickyBar>
        <div className="flex items-center gap-3">
          <QtyControl qty={qty} setQty={setQty} />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedVariant?.inStock}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background disabled:opacity-60"
          >
            <ShoppingBag className="h-4 w-4" />
            В корзину
            {currentPrice > 0 && (
              <>
                {" · "}
                <Price value={currentPrice * qty} />
              </>
            )}
          </button>
        </div>
      </StickyBar>
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
