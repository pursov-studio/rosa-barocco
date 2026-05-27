import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminOrderStats, adminListOrders } from "@/lib/admin/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

function AdminDashboard() {
  const statsFn = useServerFn(adminOrderStats);
  const ordersFn = useServerFn(adminListOrders);
  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: () => statsFn() });
  const orders = useQuery({ queryKey: ["admin-orders-recent"], queryFn: () => ordersFn({ data: {} }) });

  const cards = [
    { label: "Заказов за 7 дн.", value: stats.data?.orders7 ?? "—" },
    { label: "Заказов за 30 дн.", value: stats.data?.orders30 ?? "—" },
    { label: "Выручка (30 дн., оплачено)", value: stats.data ? fmt(stats.data.revenue30) : "—" },
    { label: "Средний чек (30 дн.)", value: stats.data ? fmt(stats.data.avg30) : "—" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Дашборд</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
            <div className="mt-2 font-display text-2xl">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-display text-lg">Последние заказы</h2>
          <Link to="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground">Все заказы →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-2">№</th><th className="px-4 py-2">Имя</th><th className="px-4 py-2">Сумма</th><th className="px-4 py-2">Статус</th><th className="px-4 py-2">Оплата</th><th className="px-4 py-2">Дата</th></tr>
            </thead>
            <tbody>
              {orders.data?.slice(0, 10).map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{o.public_id}</td>
                  <td className="px-4 py-2">{o.name}</td>
                  <td className="px-4 py-2">{fmt(o.subtotal)}</td>
                  <td className="px-4 py-2">{o.status}</td>
                  <td className="px-4 py-2">{o.payment_status}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ru-RU")}</td>
                </tr>
              ))}
              {orders.data && orders.data.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Заказов пока нет</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
