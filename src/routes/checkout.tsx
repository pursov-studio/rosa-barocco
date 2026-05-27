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
  email: z.string().trim().email("Неверный email").max(120),
  city: z.string().trim().min(2, "Укажите город").max(60),
  delivery: z.enum(["yandex", "cdek", "post"]),
  address: z.string().trim().min(3, "Адрес или пункт выдачи").max(200),
  comment: z.string().max(500).optional(),
  agree: z.boolean().refine((v) => v === true, { message: "Согласие обязательно" }),
});

type FormValues = z.infer<typeof schema>;

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

  if (items.length === 0) {
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
    <Container className="py-10 sm:py-14">
      <h1 className="font-display text-3xl sm:text-4xl">Оформление заказа</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]"
        noValidate
      >
        <div className="space-y-6">
          <Section title="Контактные данные">
            <Field label="Имя" error={errors.name?.message}>
              <input type="text" autoComplete="name" {...register("name")} className={inputCls} />
            </Field>
            <Field label="Телефон" error={errors.phone?.message}>
              <input type="tel" autoComplete="tel" placeholder="+7 ___ ___ __ __" {...register("phone")} className={inputCls} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input type="email" autoComplete="email" {...register("email")} className={inputCls} />
            </Field>
          </Section>

          <Section title="Доставка">
            <Field label="Город" error={errors.city?.message}>
              <input type="text" autoComplete="address-level2" {...register("city")} className={inputCls} />
            </Field>
            <fieldset>
              <legend className="mb-2 text-sm text-muted-foreground">Способ доставки</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { v: "yandex", label: "Яндекс Доставка" },
                  { v: "cdek", label: "СДЭК" },
                  { v: "post", label: "Почта России" },
                ].map((opt) => (
                  <label
                    key={opt.v}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background"
                  >
                    <input
                      type="radio"
                      value={opt.v}
                      {...register("delivery")}
                      className="sr-only"
                    />
                    {opt.label}
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
          </Section>

          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input type="checkbox" {...register("agree")} className="mt-1 h-4 w-4 accent-primary" />
            <span>
              Согласен с обработкой персональных данных и условиями заказа.
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
                <li key={i.productId} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {i.name} <span className="text-foreground">× {i.qty}</span>
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
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Отправляем…" : "Подтвердить заказ"}
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              Менеджер свяжется с вами для уточнения деталей. Оплата производится после подтверждения.
            </p>
          </div>
        </aside>
      </form>
    </Container>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors focus:border-foreground focus:outline-none";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5">
      <h2 className="mb-4 font-display text-lg">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

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
