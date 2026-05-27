import { Link } from "@tanstack/react-router";
import type { Category } from "@/lib/catalog/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to="/catalog/$category"
      params={{ category: category.slug }}
      className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-secondary"
    >
      {category.image && (
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          width={800}
          height={1000}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-graphite/55 via-graphite/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
        <div className="text-[0.7rem] uppercase tracking-[0.22em] opacity-80">
          {category.metal === "platinum" && "Платина"}
          {category.metal === "gold" && "Золото"}
          {category.metal === "silver" && "Серебро"}
          {category.metal === "mix" && "Наборы"}
        </div>
        <h3 className="mt-1 font-display text-xl leading-tight">
          {category.shortName}
        </h3>
      </div>
    </Link>
  );
}
