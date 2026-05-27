import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListOrders, adminUpdateOrder } from "@/lib/admin/admin.functions";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({ component: OrdersPage });

const STATUSES = ["new", "processing", "paid", "shipped", "done", "cancelled"] as const;
const PAYMENTS = ["unpaid", "pending", "paid", "failed", "refunded"] as const;
const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

function OrdersPage() {
  const [filter, setFilter] = useState<string | null>(null);
  const list = useServerFn(adminListOrders);
  const upd = useServerFn(adminUpdateOrder);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-orders", filter], queryFn: () => list({ data: { status: filter } }) });
  const m = useMutation({
    mutationFn: (v: any) => upd({ data: v }),
    onSuccess: () => { toast.success("Обновлено"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-2xl">Заказы</h1>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilter(null)} className={`rounded-full px-3 py-1 text-xs ${!filter ? "bg-foreground text-background" : "bg-muted"}`}>Все</button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs ${filter === s ? "bg-foreground text-background" : "bg-muted"}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-3 py-2">№</th><th className="px-3 py-2">Клиент</th><th className="px-3 py-2">Контакты</th><th className="px-3 py-2">Доставка</th><th className="px-3 py-2">Сумма</th><th className="px-3 py-2">Статус</th><th className="px-3 py-2">Оплата</th><th className="px-3 py-2">Дата</th></tr>
            </thead>
            <tbody>
              {q.data?.map((o) => (
                <tr key={o.id} className="border-t align-top">
                  <td className="px-3 py-2 font-mono text-xs">{o.public_id}</td>
                  <td className="px-3 py-2"><div>{o.name}</div><div className="text-xs text-muted-foreground">{Array.isArray(o.items) ? `${(o.items as any[]).length} поз.` : ""}</div></td>
                  <td className="px-3 py-2 text-xs"><div>{o.phone}</div><div className="text-muted-foreground">{o.email}</div></td>
                  <td className="px-3 py-2 text-xs"><div>{o.city}</div><div className="text-muted-foreground">{o.delivery_method} · {o.address}</div></td>
                  <td className="px-3 py-2">{fmt(o.subtotal)}</td>
                  <td className="px-3 py-2">
                    <select defaultValue={o.status} onChange={(e) => m.mutate({ id: o.id, status: e.target.value })} className="rounded border bg-background px-2 py-1 text-xs">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select defaultValue={o.payment_status} onChange={(e) => m.mutate({ id: o.id, payment_status: e.target.value })} className="rounded border bg-background px-2 py-1 text-xs">
                      {PAYMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ru-RU")}</td>
                </tr>
              ))}
              {q.data && q.data.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Заказов нет</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
