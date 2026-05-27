import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { Container } from "@/components/common/Container";
import { BRAND } from "@/lib/brand";
import { submitForm } from "@/lib/api/submit";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Контакты — ROSA&BAROCCO" },
      { name: "description", content: `Контакты ROSA&BAROCCO: ${BRAND.email}, ${BRAND.phone}.` },
      { property: "og:title", content: "Контакты — ROSA&BAROCCO" },
      { property: "og:description", content: "Свяжитесь с ROSA&BAROCCO." },
    ],
  }),
  component: ContactsPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Введите имя").max(60),
  contact: z.string().trim().min(5, "Телефон или email").max(120),
  message: z.string().trim().min(5, "Сообщение слишком короткое").max(1000),
});
type V = z.infer<typeof schema>;

function ContactsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<V>({ resolver: zodResolver(schema) });

  async function onSubmit(values: V) {
    setSubmitting(true);
    try {
      await submitForm("contact", { ...values, phone: values.contact });
      toast.success("Сообщение отправлено");
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
      <h1 className="font-display text-3xl sm:text-4xl">Контакты</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Напишите нам — ответим в&nbsp;рабочие часы. Для&nbsp;партнёрских запросов воспользуйтесь страницей «Сотрудничество».
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-4">
          <a href={`mailto:${BRAND.email}`} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-5 hover:border-foreground/40">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Email</div>
              <div className="font-medium">{BRAND.email}</div>
            </div>
          </a>
          <a href={`tel:${BRAND.phoneRaw}`} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-5 hover:border-foreground/40">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Телефон</div>
              <div className="font-medium">{BRAND.phone}</div>
            </div>
          </a>
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Часы работы</div>
            <p className="mt-1 text-sm">Пн–Пт: 9:00–21:00</p>
            <p className="text-sm">Сб–Вс: 10:00–20:00</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8" noValidate>
          {done ? (
            <div className="py-6 text-center">
              <h2 className="font-display text-2xl">Сообщение отправлено</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Мы свяжемся с вами в ближайшее время.
              </p>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="mt-5 text-sm text-primary hover:underline"
              >
                Написать ещё раз
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              <h2 className="font-display text-xl">Написать нам</h2>
              <Field label="Имя" error={errors.name?.message}>
                <input className={inputCls} type="text" autoComplete="name" {...register("name")} />
              </Field>
              <Field label="Телефон или email" error={errors.contact?.message}>
                <input className={inputCls} type="text" {...register("contact")} />
              </Field>
              <Field label="Сообщение" error={errors.message?.message}>
                <textarea className={`${inputCls} resize-none`} rows={5} {...register("message")} />
              </Field>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-60"
              >
                {submitting ? "Отправляем…" : "Отправить"}
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
