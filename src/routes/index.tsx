import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { ProductCard } from "@/components/catalog/ProductCard";
import { reviews } from "@/lib/catalog/seed";
import {
  listCategoriesPublic,
  listProductsPublic,
  getSiteContent,
} from "@/lib/catalog/catalog.functions";
import type { Category } from "@/lib/catalog/types";
import heroImage from "@/assets/hero-main.png";
import catSilver from "@/assets/category-silver.jpg";
import catGold from "@/assets/category-gold.jpg";
import catPlatinum from "@/assets/category-platinum.jpg";
import { ArrowRight, Leaf, Sparkles, Truck } from "lucide-react";

const metalFallback: Record<Category["metal"], string> = {
  platinum: catPlatinum,
  gold: catGold,
  silver: catSilver,
  mix: catPlatinum,
};

const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategoriesPublic(),
});

const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProductsPublic(),
});

const homeContentQuery = queryOptions({
  queryKey: ["site-content", "home"],
  queryFn: () => getSiteContent({ data: { key: "home" } }),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ROSA&BAROCCO — натуральная косметика, коллоидные растворы" },
      {
        name: "description",
        content:
          "Премиальные коллоидные растворы серебра, золота и платины для ежедневного ухода за кожей. Аккуратные ритуалы, чистый состав.",
      },
      { property: "og:title", content: "ROSA&BAROCCO — Cosmetic Lab" },
      { property: "og:description", content: "Премиальные коллоидные растворы для ухода за кожей." },
      { property: "og:image", content: heroImage },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(homeContentQuery),
    ]),
  errorComponent: ({ error }) => (
    <Container className="py-20 text-center">
      <p className="text-muted-foreground">Не удалось загрузить данные: {error.message}</p>
    </Container>
  ),
  component: HomePage,
});

function normalizeCategory(row: any): Category {
  return {
    slug: row.slug,
    name: row.name,
    shortName: row.short_name ?? row.shortName ?? row.name,
    metal: row.metal,
    description: row.description ?? undefined,
    image: row.image_url ?? metalFallback[row.metal as Category["metal"]],
  };
}

function HomePage() {
  const { data: rawCategories } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: home } = useSuspenseQuery(homeContentQuery);

  const heroSrc = (home as any)?.heroImage || heroImage;

  const categories = (rawCategories ?? []).map(normalizeCategory);

  // Pick one representative category per metal for the hero strip
  const pickByMetal = (metal: Category["metal"]) =>
    categories.find((c) => c.metal === metal);
  const heroCategories = [
    pickByMetal("platinum"),
    pickByMetal("gold"),
    pickByMetal("silver"),
  ].filter(Boolean) as Category[];

  // Highlights: take first 4 products by sort order
  const highlights = products.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-peach/50">
        <Container className="relative grid gap-8 py-10 md:grid-cols-2 md:items-center md:gap-10 md:py-20">
          <div className="order-2 md:order-1">
            <div className="mb-4 text-[0.7rem] uppercase tracking-[0.25em] text-primary">
              Cosmetic Lab
            </div>
            <h1 className="font-display text-4xl leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
              <span className="md:hidden">Коллоидное серебро, золото и&nbsp;платина</span>
              <span className="hidden md:inline">Натуральные коллоидные растворы серебра, золота и&nbsp;платины</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground">
              Деликатный спрей-мист для лица, тела и&nbsp;кожи рук.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Открыть каталог
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/delivery"
                className="inline-flex items-center rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium hover:bg-foreground/5"
              >
                Доставка и оплата
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <li className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-primary" />
                Бесплатная доставка от 1500 ₽
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-primary" />
                Натуральный состав
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-primary" />
                Доставка по России
              </li>
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative aspect-[5/4] overflow-hidden rounded-3xl md:aspect-[4/5]">
              <img
                src={heroSrc}
                alt="ROSA&BAROCCO — флакон-мист"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Categories */}
      {heroCategories.length > 0 && (
        <section className="py-16 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="Коллекции"
              title="Серебро, золото и платина"
              description="Три направления ухода. Минимализм состава и&nbsp;понятный ритуал применения."
            />
            <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
              {heroCategories.map((c) => (
                <CategoryCard key={c.slug} category={c} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="py-16 sm:py-20">
          <Container>
            <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
              <SectionHeading
                eyebrow="Бестселлеры"
                title="Самые востребованные"
                className="mb-0"
              />
              <Link
                to="/catalog"
                className="hidden text-sm text-primary hover:text-primary/80 sm:inline-flex"
              >
                Весь каталог →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {highlights.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link to="/catalog" className="text-sm text-primary">Весь каталог →</Link>
            </div>
          </Container>
        </section>
      )}

      {/* About strip */}
      <section className="bg-secondary/40 py-16 sm:py-20">
        <Container className="grid gap-8 sm:grid-cols-3">
          {[
            { icon: Leaf, title: "Натуральный состав", text: "Только проверенные компоненты, без лишних добавок." },
            { icon: Sparkles, title: "Аккуратные ритуалы", text: "Деликатный уход в формате удобного спрея." },
            { icon: Truck, title: "Доставка по России", text: "Бесплатно от 1500 ₽, Почта России и СДЭК." },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* Reviews */}
      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Отзывы"
            title="Что говорят наши покупатели"
          />
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {reviews.map((r) => (
              <figure
                key={r.id}
                className="rounded-2xl border border-border/60 bg-card p-6"
              >
                <blockquote className="font-display text-lg leading-snug text-foreground/90">
                  «{r.text}»
                </blockquote>
                <figcaption className="mt-4 text-sm text-muted-foreground">
                  — {r.author}
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* Cooperation CTA */}
      <section className="pb-20">
        <Container>
          <div className="rounded-3xl bg-foreground px-6 py-12 text-background sm:px-12 sm:py-16">
            <div className="max-w-2xl">
              <div className="text-[0.7rem] uppercase tracking-[0.25em] text-background/60">
                Партнёрам
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">
                Сотрудничество с&nbsp;ROSA&BAROCCO
              </h2>
              <p className="mt-4 text-background/70">
                Оптовые поставки, размещение в&nbsp;салонах и&nbsp;магазинах,
                индивидуальные условия для партнёров.
              </p>
              <Link
                to="/cooperation"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-background/90"
              >
                Оставить заявку
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
