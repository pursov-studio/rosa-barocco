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
    return { id: row.id, public_id: row.public_id, subtotal: realSubtotal };
  });
