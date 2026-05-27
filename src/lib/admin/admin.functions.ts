import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "./guard.server";

// ---------- Products ----------
const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  sku: z.string().max(40).nullable().optional(),
  name: z.string().min(1).max(200),
  category_slug: z.string().min(1).max(80),
  price: z.number().int().min(0),
  short_description: z.string().max(400).default(""),
  composition: z.string().max(1000).nullable().optional(),
  usage: z.string().max(1000).nullable().optional(),
  volume_ml: z.number().int().min(0).nullable().optional(),
  weight_g: z.number().int().min(0).nullable().optional(),
  areas: z.array(z.string()).default([]),
  skin_type: z.array(z.string()).default([]),
  target: z.string().max(200).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  in_stock: z.boolean().default(true),
  is_set: z.boolean().default(false),
  bundle_items: z.array(z.string()).default([]),
  sort: z.number().int().default(0),
});

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("products").select("*").order("sort", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  });

export const adminGetProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("products").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => productSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    if (data.id) {
      const { id, ...patch } = data;
      const { error } = await supabaseAdmin.from("products").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    } else {
      const { id: _omit, ...insert } = data;
      const { data: row, error } = await supabaseAdmin.from("products").insert(insert).select("id").single();
      if (error) throw new Error(error.message);
      return { id: row.id };
    }
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Categories ----------
const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  short_name: z.string().min(1).max(80),
  metal: z.enum(["platinum", "gold", "silver", "mix"]),
  description: z.string().max(1000).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  sort: z.number().int().default(0),
});

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("categories").select("*").order("sort", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  });

export const adminUpsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => categorySchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    if (data.id) {
      const { id, ...patch } = data;
      const { error } = await supabaseAdmin.from("categories").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    } else {
      const { id: _o, ...insert } = data;
      const { data: row, error } = await supabaseAdmin.from("categories").insert(insert).select("id").single();
      if (error) throw new Error(error.message);
      return { id: row.id };
    }
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Orders ----------
export const adminListOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: string | null }) =>
    z.object({ status: z.string().nullable().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    let q = supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
    if (data.status) q = q.eq("status", data.status as any);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows;
  });

export const adminGetOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin.from("orders").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    status: z.enum(["new","processing","paid","shipped","done","cancelled"]).optional(),
    payment_status: z.enum(["unpaid","pending","paid","failed","refunded"]).optional(),
    admin_note: z.string().max(2000).nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("orders").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminOrderStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const since7 = new Date(Date.now() - 7 * 86400_000).toISOString();
    const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { data: orders, error } = await supabaseAdmin
      .from("orders").select("subtotal,status,payment_status,created_at").gte("created_at", since30);
    if (error) throw new Error(error.message);
    const all = orders ?? [];
    const last7 = all.filter((o) => o.created_at >= since7);
    const revenue30 = all.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.subtotal, 0);
    const paidPct = all.length ? Math.round((all.filter((o) => o.payment_status === "paid").length / all.length) * 100) : 0;
    return {
      orders7: last7.length,
      orders30: all.length,
      revenue30,
      avg30: all.length ? Math.round(all.reduce((s, o) => s + o.subtotal, 0) / all.length) : 0,
      paidPct,
    };
  });

// ---------- Site content ----------
export const adminGetContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string }) => z.object({ key: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("site_content").select("value").eq("key", data.key).maybeSingle();
    if (error) throw new Error(error.message);
    return (row?.value ?? {}) as Record<string, any>;
  });

export const adminSetContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    key: z.string().min(1).max(80),
    value: z.record(z.string(), z.any()),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("site_content").upsert({ key: data.key, value: data.value }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Settings (Robokassa) ----------
const robokassaSchema = z.object({
  enabled: z.boolean(),
  merchant_login: z.string().max(120).default(""),
  password_1: z.string().max(200).default(""),
  password_2: z.string().max(200).default(""),
  test_mode: z.boolean().default(true),
});

export const adminGetRobokassa = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("app_settings").select("value").eq("key", "robokassa").maybeSingle();
    if (error) throw new Error(error.message);
    return (data?.value ?? {}) as z.infer<typeof robokassaSchema>;
  });

export const adminSetRobokassa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => robokassaSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("app_settings").upsert({ key: "robokassa", value: data }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Team ----------
export const adminListTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: roles, error } = await supabaseAdmin
      .from("user_roles").select("id,user_id,role,created_at");
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
    const emails: Record<string, string> = {};
    for (const id of ids) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(id);
      if (u?.user?.email) emails[id] = u.user.email;
    }
    return (roles ?? []).map((r) => ({ ...r, email: emails[r.user_id] ?? "—" }));
  });

export const adminAddTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    email: z.string().email(),
    role: z.enum(["admin", "editor"]).default("admin"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    // Find user by email via auth admin
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);
    const u = list.users.find((x) => x.email?.toLowerCase() === data.email.toLowerCase());
    if (!u) throw new Error("Пользователь не найден. Пусть он сначала зарегистрируется на /admin/login.");
    const { error: insErr } = await supabaseAdmin
      .from("user_roles").insert({ user_id: u.id, role: data.role });
    if (insErr && !insErr.message.includes("duplicate")) throw new Error(insErr.message);
    return { ok: true };
  });

export const adminRemoveTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin.from("user_roles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Storage upload (signed via service role; returns public URL) ----------
export const adminUploadImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    filename: z.string().min(1).max(200),
    contentType: z.string().min(1).max(80),
    base64: z.string().min(8), // data URL base64 payload (without data: prefix)
  }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]+/g, "_");
    const path = `${Date.now()}_${safeName}`;
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const { error } = await supabaseAdmin.storage.from("product-images")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
    return { url: pub.publicUrl };
  });

// ---------- Bootstrap: claim first admin ----------
// Allows the FIRST signed-in user to claim admin if no admins exist yet.
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count, error } = await supabaseAdmin
      .from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
    if (error) throw new Error(error.message);
    if ((count ?? 0) > 0) {
      // Already has admins — only allow if caller is already admin (no-op)
      const { data: me } = await supabaseAdmin
        .from("user_roles").select("id").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
      if (!me) throw new Error("Админ уже назначен. Попросите его выдать вам доступ.");
      return { ok: true, alreadyAdmin: true };
    }
    const { error: insErr } = await supabaseAdmin
      .from("user_roles").insert({ user_id: context.userId, role: "admin" });
    if (insErr) throw new Error(insErr.message);
    return { ok: true, alreadyAdmin: false };
  });

export const checkMyAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (error) throw new Error(error.message);
    const { count: adminCount } = await supabaseAdmin
      .from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
    return { isAdmin: !!data, adminsExist: (adminCount ?? 0) > 0 };
  });
