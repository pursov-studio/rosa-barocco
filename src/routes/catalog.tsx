import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Container } from "@/components/common/Container";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getCategoryBySlug, products } from "@/lib/catalog/seed";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Каталог — ROSA&BAROCCO" },
      {
        name: "description",
        content:
          "Каталог натуральных коллоидных растворов серебра, золота и платины. Спреи-мисты, наборы.",
      },
      { property: "og:title", content: "Каталог — ROSA&BAROCCO" },
      { property: "og:description", content: "Коллоидные растворы серебра, золота и платины." },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const [active, setActive] = useState<string>("all");

  const groups = [
    { key: "all", label: "Все" },
    { key: "platinum", label: "Платина" },
    { key: "gold", label: "Золото" },
    { key: "silver", label: "Серебро" },
    { key: "sets", label: "Наборы" },
  ] as const;

  const list = products.filter((p) => {
    if (active === "all") return true;
    const metal = getCategoryBySlug(p.categorySlug)?.metal;
    if (active === "sets") return metal === "mix";
    return metal === active;
  });

  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-3xl sm:text-4xl">Каталог</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Натуральные коллоидные растворы и&nbsp;наборы средств.
        </p>
      </div>

      <div className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {groups.map((g) => (
            <FilterChip
              key={g.key}
              label={g.label}
              active={active === g.key}
              onClick={() => setActive(g.key)}
            />
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          В этой категории пока нет товаров.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div className="mt-12 text-center text-sm text-muted-foreground">
        Не нашли нужное? <Link to="/contacts" className="text-primary hover:underline">Напишите нам</Link>.
      </div>
    </Container>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
