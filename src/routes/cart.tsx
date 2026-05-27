import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Price } from "@/components/common/Price";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { FreeShippingProgress } from "@/components/cart/FreeShippingProgress";
import { StickyBar } from "@/components/common/StickyBar";
import { cartSelectors, useCart } from "@/lib/cart/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Корзина — ROSA&BAROCCO" },
      { name: "description", content: "Ваша корзина в ROSA&BAROCCO." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart(cartSelectors.subtotal);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Container className="py-20" aria-busy="true">{null}</Container>;
  }

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h1 className="mt-6 font-display text-3xl">Корзина пуста</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Загляните в каталог — там много аккуратных средств.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/catalog"
            className="inline-flex items-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
          >
            В каталог
          </Link>
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm hover:bg-muted"
          >
            Посмотреть бестселлеры
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="py-10 pb-28 sm:py-14 lg:pb-14">
        <h1 className="font-display text-3xl sm:text-4xl">Корзина</h1>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-border/60 bg-card px-5">
            {items.map((item) => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <FreeShippingProgress subtotal={subtotal} />
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Товары</span>
                <Price value={subtotal} />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Доставка</span>
                <span className="text-muted-foreground">рассчитывается на оформлении</span>
              </div>
              <div className="my-4 h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="font-display text-lg">Итого</span>
                <Price value={subtotal} className="text-xl font-medium" />
              </div>
              <Link
                to="/checkout"
                className="mt-5 hidden w-full items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90 lg:inline-flex"
              >
                Оформить заказ
              </Link>
              <Link
                to="/catalog"
                className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm hover:bg-muted"
              >
                Продолжить покупки
              </Link>
            </div>
          </aside>
        </div>
      </Container>

      {/* Sticky mobile checkout bar */}
      <StickyBar className="lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
              Итого
            </div>
            <Price value={subtotal} className="text-base font-semibold" />
          </div>
          <Link
            to="/checkout"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background"
          >
            Оформить заказ
          </Link>
        </div>
      </StickyBar>
    </>
  );
}
