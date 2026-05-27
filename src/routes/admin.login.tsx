import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { claimFirstAdmin, checkMyAdmin } from "@/lib/admin/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Вход в админку" }] }),
});

function AdminLogin() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const claim = useServerFn(claimFirstAdmin);
  const check = useServerFn(checkMyAdmin);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      // Try to auto-claim first admin (no-op if admin already exists)
      try {
        await claim();
      } catch {
        // ignore — user may not be admin yet; checkMyAdmin will route
      }
      const status = await check();
      if (status.isAdmin) {
        toast.success("Добро пожаловать");
        nav({ to: "/admin" });
      } else {
        toast.error("Аккаунт создан, но прав администратора нет. Попросите действующего админа выдать доступ.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm">
        <Link to="/" className="text-xs text-muted-foreground">← На сайт</Link>
        <h1 className="mt-2 font-display text-2xl">Админ‑панель</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin" ? "Войдите в свой аккаунт" : "Создайте аккаунт администратора"}
        </p>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : mode === "signin" ? "Войти" : "Создать аккаунт"}
          </Button>
        </form>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
        </button>
        <p className="mt-4 text-[11px] text-muted-foreground text-center">
          Первый зарегистрированный пользователь автоматически становится администратором.
        </p>
      </div>
    </div>
  );
}
