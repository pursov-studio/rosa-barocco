import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListTeam, adminAddTeam, adminRemoveTeam } from "@/lib/admin/admin.functions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/team")({ component: TeamPage });

function TeamPage() {
  const listFn = useServerFn(adminListTeam);
  const addFn = useServerFn(adminAddTeam);
  const delFn = useServerFn(adminRemoveTeam);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["adm-team"], queryFn: () => listFn() });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("admin");

  const add = useMutation({
    mutationFn: () => addFn({ data: { email, role } }),
    onSuccess: () => { toast.success("Добавлен"); setEmail(""); qc.invalidateQueries({ queryKey: ["adm-team"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Удалено"); qc.invalidateQueries({ queryKey: ["adm-team"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-display text-2xl">Команда</h1>
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <div className="text-sm font-medium">Добавить роль</div>
        <p className="text-xs text-muted-foreground">Пользователь должен сначала зарегистрироваться на /admin/login.</p>
        <div className="flex gap-2">
          <Input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select value={role} onChange={(e) => setRole(e.target.value as any)} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="admin">admin</option><option value="editor">editor</option>
          </select>
          <Button onClick={() => add.mutate()} disabled={add.isPending || !email}>Добавить</Button>
        </div>
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-3 py-2">Email</th><th className="px-3 py-2">Роль</th><th className="px-3 py-2"></th></tr>
          </thead>
          <tbody>
            {q.data?.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">{r.role}</td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Снять роль?")) remove.mutate(r.id); }}>×</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
