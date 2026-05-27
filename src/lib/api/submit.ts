/**
 * Mock submit layer. Replace with createServerFn / Node API later.
 * Returns { ok, orderId? } and rejects for clearly invalid phones to demo error state.
 */
export async function submitForm<T extends Record<string, unknown>>(
  kind: "order" | "cooperation" | "contact",
  payload: T,
): Promise<{ ok: true; id: string }> {
  await new Promise((r) => setTimeout(r, 350 + Math.random() * 350));
  const phone = String(payload.phone ?? "");
  if (/\+?7?0{6,}/.test(phone.replace(/\D/g, ""))) {
    throw new Error("Не удалось отправить. Проверьте номер телефона.");
  }
  // In real backend: POST /api/<kind>
  // eslint-disable-next-line no-console
  console.log(`[submit:${kind}]`, payload);
  const id =
    kind === "order"
      ? `RB-${Date.now().toString().slice(-6)}`
      : crypto.randomUUID().slice(0, 8);
  return { ok: true, id };
}
