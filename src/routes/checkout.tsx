import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Container } from "@/components/common/Container";
import { Price } from "@/components/common/Price";
import { cartSelectors, useCart } from "@/lib/cart/store";
import { submitForm } from "@/lib/api/submit";
import { StickyBar } from "@/components/common/StickyBar";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Оформление заказа — ROSA&BAROCCO" },
      { name: "description", content: "Оформление заказа в ROSA&BAROCCO." },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Введите имя").max(60),
  phone: z
    .string()
    .trim()
    .min(10, "Введите номер телефона")
    .max(20)
    .regex(/^[+\d\s()-]+$/, "Только цифры и +-()"),
  email: z
    .string()
    .trim()
    .max(120)
    .email("Неверный email")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().min(2, "Укажите город").max(60),
  delivery: z.enum(["yandex", "cdek", "post"]),
  address: z.string().trim().min(3, "Адрес или пункт выдачи").max(200),
  comment: z.string().max(500).optional(),
  agree: z.boolean().refine((v) => v === true, { message: "Согласие обязательно" }),
});

type FormValues = z.infer<typeof schema>;

const deliveryOptions = [
  { v: "yandex" as const, label: "Яндекс Доставка", hint: "по тарифу" },
  { v: "cdek" as const, label: "СДЭК", hint: "по тарифу" },
  { v: "post" as const, label: "Почта России", hint: "350 ₽" },
];

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart(cartSelectors.subtotal);
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { delivery: "yandex" },
  });

  if (mounted && items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h1 className="font-display text-2xl">Корзина пуста</h1>
        <Link to="/catalog" className="mt-4 inline-block text-primary">
          Перейти в каталог
        </Link>
      </Container>
    );
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await submitForm("order", {
        ...values,
        items,
        subtotal,
      });
      clear();
      toast.success("Заказ принят");
      navigate({ to: "/checkout/success", search: { id: res.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось отправить");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Container className="py-10 pb-28 sm:py-14 lg:pb-14">
        <h1 className="font-display text-3xl sm:text-4xl">Оформление заявки</h1>
        <div className="mt-4 rounded-2xl border border-foreground/15 bg-secondary/60 p-5">
          <p className="font-medium">Оплата будет добавлена в будущих обновлениях.</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Сейчас вы можете оставить заявку на покупку — мы свяжемся с вами для подтверждения и согласования оплаты.
          </p>
        </div>

        <form
          id="checkout-form"
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]"
          noValidate
        >
          <div className="space-y-6">
            <section className="rounded-2xl border border-border/60 bg-card p-5">
              <h2 className="mb-4 font-display text-lg">Контакты и доставка</h2>
              <div className="grid gap-4">
                <Field label="Имя" error={errors.name?.message}>
                  <input type="text" autoComplete="name" {...register("name")} className={inputCls} />
                </Field>
                <Field label="Телефон" error={errors.phone?.message}>
                  <input type="tel" autoComplete="tel" placeholder="+7 ___ ___ __ __" {...register("phone")} className={inputCls} />
                </Field>
                <Field label="Email (необязательно)" error={errors.email?.message}>
                  <input type="email" autoComplete="email" {...register("email")} className={inputCls} />
                </Field>
                <Field label="Город" error={errors.city?.message}>
                  <input type="text" autoComplete="address-level2" {...register("city")} className={inputCls} />
                </Field>

                <fieldset>
                  <legend className="mb-2 text-sm text-muted-foreground">Способ доставки</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {deliveryOptions.map((opt) => (
                      <label
                        key={opt.v}
                        className="flex cursor-pointer flex-col gap-0.5 rounded-xl border border-border bg-background px-4 py-3 text-sm has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background"
                      >
                        <input
                          type="radio"
                          value={opt.v}
                          {...register("delivery")}
                          className="sr-only"
                        />
                        <span>{opt.label}</span>
                        <span className="text-xs opacity-70">{opt.hint}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <Field label="Адрес или пункт выдачи" error={errors.address?.message}>
                  <input type="text" {...register("address")} className={inputCls} />
                </Field>
                <Field label="Комментарий (необязательно)" error={errors.comment?.message}>
                  <textarea rows={3} {...register("comment")} className={`${inputCls} resize-none`} />
                </Field>
              </div>
            </section>

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input type="checkbox" {...register("agree")} className="mt-1 h-4 w-4 accent-primary" />
              <span>
                Согласен с обработкой персональных данных.
                {errors.agree && (
                  <span className="ml-2 text-destructive">{errors.agree.message}</span>
                )}
              </span>
            </label>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <h2 className="font-display text-lg">Ваш заказ</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {items.map((i) => (
                  <li key={i.variantId} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {i.name}
                      {i.volumeMl ? `, ${i.volumeMl} мл` : ""}{" "}
                      <span className="text-foreground">× {i.qty}</span>
                    </span>
                    <Price value={i.price * i.qty} />
                  </li>
                ))}
              </ul>
              <div className="my-4 h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="font-display text-lg">Итого</span>
                <Price value={subtotal} className="text-xl font-medium" />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-5 hidden w-full items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60 lg:inline-flex"
              >
                {submitting ? "Отправляем…" : "Оформить заказ"}
              </button>
              <p className="mt-3 text-xs text-muted-foreground">
                Оплата — после подтверждения менеджером.
              </p>
            </div>
          </aside>
        </form>
      </Container>

      {/* Sticky mobile submit */}
      <StickyBar className="lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
              Итого
            </div>
            <Price value={subtotal} className="text-base font-semibold" />
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background disabled:opacity-60"
          >
            {submitting ? "Отправляем…" : "Оформить заказ"}
          </button>
        </div>
      </StickyBar>
    </>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors focus:border-foreground focus:outline-none";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
