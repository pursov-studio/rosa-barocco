import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { checkMyAdmin } from "@/lib/admin/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Админ‑панель" }] }),
});

const NAV: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: "/admin", label: "Дашборд", exact: true },
  { to: "/admin/orders", label: "Заказы" },
  { to: "/admin/products", label: "Товары" },
  { to: "/admin/content", label: "Контент" },
  { to: "/admin/settings", label: "Робокасса" },
  { to: "/admin/team", label: "Команда" },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const check = useServerFn(checkMyAdmin);
  const [status, setStatus] = useState<"loading" | "ok" | "noauth" | "noadmin">("loading");

  useEffect(() => {
    if (pathname === "/admin/login") {
      setStatus("ok");
      return;
    }
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        setStatus("noauth");
        nav({ to: "/admin/login" });
        return;
      }
      try {
        const r = await check();
        if (!active) return;
        setStatus(r.isAdmin ? "ok" : "noadmin");
      } catch {
        if (active) setStatus("noadmin");
      }
    })();
    return () => {
      active = false;
    };
  }, [pathname, nav, check]);

  if (pathname === "/admin/login") return <Outlet />;

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Загрузка…</div>;
  }
  if (status === "noadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-2xl">Нет доступа</h1>
          <p className="mt-2 text-sm text-muted-foreground">У вашего аккаунта нет прав администратора.</p>
          <Button className="mt-4" variant="outline" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/admin/login" }); }}>
            Выйти
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-display text-lg">ROSA&amp;BAROCCO · admin</Link>
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((n) => {
                const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to as any}
                    className={`rounded-full px-3 py-1.5 text-sm transition-colors ${active ? "bg-foreground text-background" : "hover:bg-muted"}`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">Сайт ↗</Link>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => { await supabase.auth.signOut(); nav({ to: "/admin/login" }); }}
            >
              Выйти
            </Button>
          </div>
        </div>
        <nav className="md:hidden flex gap-1 overflow-x-auto border-t px-4 py-2">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to as any}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${active ? "bg-foreground text-background" : "bg-muted"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
