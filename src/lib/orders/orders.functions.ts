import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const itemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  price: z.number().int().min(0),
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
  items: z.array(itemSchema).min(1),
  subtotal: z.number().int().min(0),
});

function genPublicId(): string {
  return `RB-${Date.now().toString().slice(-6)}`;
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => createOrderSchema.parse(d))
  .handler(async ({ data }) => {
    // Re-validate subtotal server-side
    const realSubtotal = data.items.reduce((s, i) => s + i.price * i.qty, 0);
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
        items: data.items,
        subtotal: realSubtotal,
        payment_method: data.payment_method,
        payment_status: data.payment_method === "robokassa" ? "pending" : "unpaid",
        status: "new",
      })
      .select("id, public_id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, public_id: row.public_id };
  });
