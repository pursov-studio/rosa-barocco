import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Доставка и оплата — ROSA&BAROCCO" },
      {
        name: "description",
        content:
          "Доставка по России: Яндекс Доставка, СДЭК, Почта России. Бесплатная доставка от 1500 ₽.",
      },
      { property: "og:title", content: "Доставка и оплата — ROSA&BAROCCO" },
      { property: "og:description", content: "Условия доставки и оплаты в ROSA&BAROCCO." },
    ],
  }),
  component: DeliveryPage,
});

function DeliveryPage() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="rounded-2xl bg-foreground px-6 py-5 text-background">
        <div className="text-[0.7rem] uppercase tracking-[0.22em] text-background/60">
          Промо
        </div>
        <p className="mt-1 font-display text-xl">
          Бесплатная доставка от 1500 ₽
        </p>
      </div>

      <h1 className="mt-10 font-display text-3xl sm:text-4xl">Доставка и оплата</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Принимаем заказы круглосуточно. Свяжемся с вами для подтверждения в&nbsp;рабочие часы.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <Card title="Сроки">
          <p>Приём заказов — круглосуточно.</p>
          <p>Обработка: пн–пт 9:00–21:00, сб–вс 10:00–20:00.</p>
          <p>Сборка заказа — 1–2 рабочих дня после поступления оплаты.</p>
        </Card>

        <Card title="Способы доставки">
          <ul className="space-y-2">
            <li>
              <span className="text-foreground">Яндекс Доставка</span> — по тарифам сервиса.
            </li>
            <li>
              <span className="text-foreground">СДЭК</span> — пункт выдачи или курьер, по тарифу.
            </li>
            <li>
              <span className="text-foreground">Почта России</span> — до отделения, 350 ₽ для всех регионов.
            </li>
          </ul>
        </Card>

        <Card title="Оплата">
          <p>Заказ оплачивается после подтверждения менеджером.</p>
          <p>Реквизиты вышлем на почту или в&nbsp;мессенджер.</p>
        </Card>

        <Card title="Возврат и обмен">
          <p>В случае брака или ошибки в заказе свяжитесь с нами — заменим товар или вернём средства.</p>
        </Card>
      </div>
    </Container>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-3 space-y-2 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}
