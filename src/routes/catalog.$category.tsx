import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/catalog/seed";

export const Route = createFileRoute("/catalog/$category")({
  head: ({ params }) => {
    const c = getCategoryBySlug(params.category);
    const title = c ? `${c.name} — ROSA&BAROCCO` : "Категория — ROSA&BAROCCO";
    const desc = c?.description ?? `Категория ${c?.name ?? ""}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  loader: ({ params }) => {
    const category = getCategoryBySlug(params.category);
    if (!category) throw notFound();
    return { category };
  },
  notFoundComponent: () => (
    <Container className="py-20 text-center">
      <h1 className="font-display text-2xl">Категория не найдена</h1>
      <Link to="/catalog" className="mt-4 inline-block text-primary">
        Вернуться в каталог
      </Link>
    </Container>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const items = getProductsByCategory(category.slug);

  return (
    <Container className="py-10 sm:py-14">
      <Link
        to="/catalog"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Каталог
      </Link>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">
        {category.name}
      </h1>
      {category.description && (
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {category.description}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
        {items.length > 0 ? (
          items.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            В этой категории пока нет товаров.
          </div>
        )}
      </div>
    </Container>
  );
}
