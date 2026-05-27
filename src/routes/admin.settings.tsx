import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetRobokassa, adminSetRobokassa } from "@/lib/admin/admin.functions";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const getFn = useServerFn(adminGetRobokassa);
  const setFn = useServerFn(adminSetRobokassa);
  const q = useQuery({ queryKey: ["adm-robo"], queryFn: () => getFn() });
  const [v, setV] = useState({ enabled: false, merchant_login: "", password_1: "", password_2: "", test_mode: true });

  useEffect(() => { if (q.data) setV({ enabled: !!q.data.enabled, merchant_login: q.data.merchant_login ?? "", password_1: q.data.password_1 ?? "", password_2: q.data.password_2 ?? "", test_mode: q.data.test_mode ?? true }); }, [q.data]);

  const save = useMutation({
    mutationFn: () => setFn({ data: v }),
    onSuccess: () => toast.success("Сохранено"),
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="font-display text-2xl">Робокасса</h1>
      <p className="text-sm text-muted-foreground">Сохраните реквизиты — на checkout появится оплата картой после одобрения мерчанта (флаг «Включено»).</p>
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.enabled} onChange={(e) => setV({ ...v, enabled: e.target.checked })} /> Включить оплату Робокассой</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.test_mode} onChange={(e) => setV({ ...v, test_mode: e.target.checked })} /> Тестовый режим</label>
        <div><Label>Merchant Login</Label><Input value={v.merchant_login} onChange={(e) => setV({ ...v, merchant_login: e.target.value })} /></div>
        <div><Label>Password #1</Label><Input value={v.password_1} onChange={(e) => setV({ ...v, password_1: e.target.value })} /></div>
        <div><Label>Password #2</Label><Input value={v.password_2} onChange={(e) => setV({ ...v, password_2: e.target.value })} /></div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>Сохранить</Button>
      </div>
    </div>
  );
}
