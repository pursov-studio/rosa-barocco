import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Check } from "lucide-react";
import { Container } from "@/components/common/Container";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: z.object({ id: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Заказ оформлен — ROSA&BAROCCO" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { id } = Route.useSearch();
  return (
    <Container className="py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="h-7 w-7" />
      </div>
      <h1 className="mt-6 font-display text-4xl">Спасибо за заказ</h1>
      {id && (
        <p className="mt-3 text-sm text-muted-foreground">
          Номер вашего заказа: <span className="font-mono text-foreground">{id}</span>
        </p>
      )}
      <p className="mx-auto mt-4 max-w-md text-muted-foreground">
        Мы свяжемся с вами в ближайшее время для подтверждения и&nbsp;уточнения деталей доставки.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link
          to="/catalog"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Вернуться в каталог
        </Link>
        <Link
          to="/"
          className="rounded-full border border-border px-6 py-3 text-sm hover:bg-muted"
        >
          На главную
        </Link>
      </div>
    </Container>
  );
}
