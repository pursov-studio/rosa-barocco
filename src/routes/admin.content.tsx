import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetContent, adminSetContent } from "@/lib/admin/admin.functions";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content")({ component: ContentPage });

const KEYS = [
  { key: "home", label: "Главная (hero / тексты)" },
  { key: "delivery", label: "Доставка" },
  { key: "contacts", label: "Контакты" },
  { key: "cooperation", label: "Сотрудничество" },
];

function ContentPage() {
  const [key, setKey] = useState("home");
  const getFn = useServerFn(adminGetContent);
  const setFn = useServerFn(adminSetContent);
  const q = useQuery({ queryKey: ["adm-content", key], queryFn: () => getFn({ data: { key } }) });
  const [text, setText] = useState("");

  useEffect(() => { if (q.data) setText(JSON.stringify(q.data, null, 2)); }, [q.data]);

  const save = useMutation({
    mutationFn: () => {
      let value: any;
      try { value = JSON.parse(text); } catch { throw new Error("Невалидный JSON"); }
      return setFn({ data: { key, value } });
    },
    onSuccess: () => toast.success("Сохранено"),
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">Контент сайта</h1>
      <div className="flex gap-2 flex-wrap">
        {KEYS.map((k) => (
          <button key={k.key} onClick={() => setKey(k.key)} className={`rounded-full px-3 py-1 text-sm ${key === k.key ? "bg-foreground text-background" : "bg-muted"}`}>{k.label}</button>
        ))}
      </div>
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <p className="text-xs text-muted-foreground">Редактируйте JSON. Структура свободная — используйте ключи под нужные блоки.</p>
        <Textarea rows={20} value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-xs" />
        <Button onClick={() => save.mutate()} disabled={save.isPending}>Сохранить</Button>
      </div>
    </div>
  );
}
