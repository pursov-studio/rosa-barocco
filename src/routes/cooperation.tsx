import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Container } from "@/components/common/Container";
import { submitForm } from "@/lib/api/submit";

export const Route = createFileRoute("/cooperation")({
  head: () => ({
    meta: [
      { title: "Сотрудничество — ROSA&BAROCCO" },
      {
        name: "description",
        content:
          "Сотрудничество с ROSA&BAROCCO: опт, размещение в магазинах и салонах, индивидуальные условия.",
      },
      { property: "og:title", content: "Сотрудничество — ROSA&BAROCCO" },
      { property: "og:description", content: "Опт и партнёрские условия в ROSA&BAROCCO." },
    ],
  }),
  component: CooperationPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Введите имя").max(60),
  phone: z.string().trim().min(10, "Введите телефон").max(20).regex(/^[+\d\s()-]+$/, "Только цифры и +-()"),
  email: z.string().trim().email("Неверный email").max(120),
  partnerType: z.enum(["shop", "salon", "marketplace", "other"]),
  comment: z.string().trim().min(5, "Расскажите подробнее").max(800),
});

type V = z.infer<typeof schema>;

function CooperationPage() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<V>({
    resolver: zodResolver(schema),
    defaultValues: { partnerType: "shop" },
  });

  async function onSubmit(values: V) {
    setSubmitting(true);
    try {
      await submitForm("cooperation", values);
      toast.success("Заявка отправлена");
      setDone(true);
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось отправить");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Сотрудничество</h1>
          <p className="mt-4 text-muted-foreground">
            Мы работаем с магазинами, салонами и партнёрами на маркетплейсах.
            Расскажите о&nbsp;себе — пришлём прайс и&nbsp;условия.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><Dot /> Оптовые поставки коллоидных растворов</li>
            <li className="flex gap-3"><Dot /> Размещение в розничных точках и салонах красоты</li>
            <li className="flex gap-3"><Dot /> Индивидуальные условия для крупных партнёров</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8" noValidate>
          {done ? (
            <div className="py-6 text-center">
              <h2 className="font-display text-2xl">Заявка отправлена</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Мы свяжемся с вами в ближайшее время.
              </p>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="mt-5 text-sm text-primary hover:underline"
              >
                Отправить ещё одну заявку
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              <h2 className="font-display text-xl">Оставить заявку</h2>
              <Field label="Имя" error={errors.name?.message}>
                <input className={inputCls} type="text" autoComplete="name" {...register("name")} />
              </Field>
              <Field label="Телефон" error={errors.phone?.message}>
                <input className={inputCls} type="tel" autoComplete="tel" {...register("phone")} />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input className={inputCls} type="email" autoComplete="email" {...register("email")} />
              </Field>
              <Field label="Тип партнёра" error={errors.partnerType?.message}>
                <select className={inputCls} {...register("partnerType")}>
                  <option value="shop">Магазин</option>
                  <option value="salon">Салон красоты</option>
                  <option value="marketplace">Маркетплейс</option>
                  <option value="other">Другое</option>
                </select>
              </Field>
              <Field label="Комментарий" error={errors.comment?.message}>
                <textarea className={`${inputCls} resize-none`} rows={4} {...register("comment")} />
              </Field>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-60"
              >
                {submitting ? "Отправляем…" : "Отправить заявку"}
              </button>
            </div>
          )}
        </form>
      </div>
    </Container>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
function Dot() {
  return <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />;
}
