// Robokassa payment stub. Wired but disabled until user provides keys.
// Will be enabled via /admin/settings (enabled=true and keys filled in).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function loadConfig() {
  const { data } = await supabaseAdmin
    .from("app_settings").select("value").eq("key", "robokassa").maybeSingle();
  return (data?.value ?? {}) as {
    enabled?: boolean;
    merchant_login?: string;
    password_1?: string;
    password_2?: string;
    test_mode?: boolean;
  };
}

export const buildRobokassaUrl = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ orderId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const cfg = await loadConfig();
    if (!cfg.enabled || !cfg.merchant_login || !cfg.password_1) {
      throw new Error("Робокасса ещё не подключена. Заполните настройки в админке.");
    }
    const { data: order, error } = await supabaseAdmin
      .from("orders").select("public_id, subtotal").eq("id", data.orderId).maybeSingle();
    if (error || !order) throw new Error("Заказ не найден");
    const invId = Number(order.public_id.replace(/\D/g, "")) || Date.now() % 1_000_000;
    const outSum = (order.subtotal).toFixed(2);
    const signature = createHash("md5")
      .update(`${cfg.merchant_login}:${outSum}:${invId}:${cfg.password_1}`)
      .digest("hex");
    const base = cfg.test_mode
      ? "https://auth.robokassa.ru/Merchant/Index.aspx?IsTest=1"
      : "https://auth.robokassa.ru/Merchant/Index.aspx";
    const url = `${base}&MerchantLogin=${encodeURIComponent(cfg.merchant_login)}&OutSum=${outSum}&InvId=${invId}&SignatureValue=${signature}`;
    return { url };
  });
