import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const itemSchema = z.object({
  variantId: z.string().uuid(),
  qty: z.number().int().min(1).max(99),
});

const createOrderSchema = z.object({
  name: z.string().trim().min(2).max(60),
  phone: z.string().trim().min(10).max(20),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(60),
  delivery_method: z.enum(["yandex", "cdek", "post"]),
  address: z.string().trim().min(3).max(200),
  comment: z.string().max(500).optional(),
  payment_method: z.enum(["cod", "robokassa"]).default("cod"),
  items: z.array(itemSchema).min(1).max(50),
});

function genPublicId(): string {
  return `RB-${Date.now().toString().slice(-6)}`;
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => createOrderSchema.parse(d))
  .handler(async ({ data }) => {
    // Fetch canonical prices from DB — never trust client-supplied prices.
    const variantIds = Array.from(new Set(data.items.map((i) => i.variantId)));
    const { data: variantRows, error: variantErr } = await supabaseAdmin
      .from("product_variants")
      .select("id, price, volume_ml, sku, in_stock, product_id, products(id, name, slug)")
      .in("id", variantIds);
    if (variantErr) throw new Error(variantErr.message);
    if (!variantRows || variantRows.length !== variantIds.length) {
      throw new Error("Некоторые товары больше не доступны");
    }

    const byId = new Map(variantRows.map((v) => [v.id, v]));
    const enrichedItems = data.items.map((i) => {
      const v = byId.get(i.variantId)!;
      if (!v.in_stock) throw new Error(`Нет в наличии: ${v.products?.name ?? ""}`);
      return {
        variantId: v.id,
        productId: v.product_id,
        slug: v.products?.slug ?? "",
        name: v.products?.name ?? "",
        volumeMl: v.volume_ml,
        sku: v.sku,
        price: v.price,
        qty: i.qty,
      };
    });
    const realSubtotal = enrichedItems.reduce((s, i) => s + i.price * i.qty, 0);

    const public_id = genPublicId();
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        public_id,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        city: data.city,
        delivery_method: data.delivery_method,
        address: data.address,
        comment: data.comment || null,
        items: enrichedItems,
        subtotal: realSubtotal,
        payment_method: data.payment_method,
        payment_status: data.payment_method === "robokassa" ? "pending" : "unpaid",
        status: "new",
      })
      .select("id, public_id")
      .single();
    if (error) throw new Error(error.message);

    // Send order request notification email (best-effort, non-blocking failure)
    try {
      await sendOrderEmail({
        public_id: row.public_id,
        name: data.name,
        phone: data.phone,
        email: data.email || "",
        city: data.city,
        delivery_method: data.delivery_method,
        address: data.address,
        comment: data.comment || "",
        items: enrichedItems,
        subtotal: realSubtotal,
      });
    } catch (e) {
      console.error("[order email] failed", e);
    }

    return { id: row.id, public_id: row.public_id, subtotal: realSubtotal };
  });

const fmtRub = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " \u20bd";

async function sendOrderEmail(o: {
  public_id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  delivery_method: string;
  address: string;
  comment: string;
  items: Array<{ name: string; volumeMl: number; sku: string | null; price: number; qty: number }>;
  subtotal: number;
}) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

  const deliveryLabels: Record<string, string> = {
    yandex: "Яндекс Доставка",
    cdek: "СДЭК",
    post: "Почта России",
  };

  const itemsRows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${escapeHtml(
          i.name,
        )}${i.volumeMl ? `, ${i.volumeMl} мл` : ""}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${fmtRub(i.price * i.qty)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;background:#fff;padding:20px">
  <h2 style="margin:0 0 12px">Новая заявка ${escapeHtml(o.public_id)}</h2>
  <table style="border-collapse:collapse;font-size:14px;margin-bottom:16px">
    <tr><td style="padding:4px 10px;color:#666">Имя</td><td style="padding:4px 10px"><b>${escapeHtml(o.name)}</b></td></tr>
    <tr><td style="padding:4px 10px;color:#666">Телефон</td><td style="padding:4px 10px"><b>${escapeHtml(o.phone)}</b></td></tr>
    ${o.email ? `<tr><td style="padding:4px 10px;color:#666">Email</td><td style="padding:4px 10px">${escapeHtml(o.email)}</td></tr>` : ""}
    <tr><td style="padding:4px 10px;color:#666">Город</td><td style="padding:4px 10px">${escapeHtml(o.city)}</td></tr>
    <tr><td style="padding:4px 10px;color:#666">Доставка</td><td style="padding:4px 10px">${escapeHtml(deliveryLabels[o.delivery_method] ?? o.delivery_method)}</td></tr>
    <tr><td style="padding:4px 10px;color:#666;vertical-align:top">Адрес</td><td style="padding:4px 10px">${escapeHtml(o.address)}</td></tr>
    ${o.comment ? `<tr><td style="padding:4px 10px;color:#666;vertical-align:top">Комментарий</td><td style="padding:4px 10px">${escapeHtml(o.comment)}</td></tr>` : ""}
  </table>
  <table style="border-collapse:collapse;width:100%;font-size:14px;border-top:2px solid #111">
    <thead><tr><th style="text-align:left;padding:8px 10px">Товар</th><th style="padding:8px 10px">Кол-во</th><th style="text-align:right;padding:8px 10px">Сумма</th></tr></thead>
    <tbody>${itemsRows}</tbody>
    <tfoot><tr><td colspan="2" style="padding:10px;text-align:right;font-weight:bold">Итого</td><td style="padding:10px;text-align:right;font-weight:bold">${fmtRub(o.subtotal)}</td></tr></tfoot>
  </table>
  <p style="margin-top:18px;color:#666;font-size:12px">Заявка оформлена на сайте ROSA&amp;BAROCCO. Оплата пока не подключена — свяжитесь с клиентом для согласования.</p>
  </body></html>`;

  const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({
      from: "ROSA&BAROCCO <onboarding@resend.dev>",
      to: ["rosabarocco@ya.ru"],
      reply_to: o.email || undefined,
      subject: `Новая заявка ${o.public_id} — ${o.name}`,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
