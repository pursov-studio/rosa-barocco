import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetContent, adminSetContent, adminUploadImage } from "@/lib/admin/admin.functions";
import { useEffect, useRef, useState } from "react";
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
  const uploadFn = useServerFn(adminUploadImage);
  const q = useQuery({ queryKey: ["adm-content", key], queryFn: () => getFn({ data: { key } }) });
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

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

  // Parse current JSON safely to read heroImage URL
  let parsed: any = {};
  try { parsed = JSON.parse(text || "{}"); } catch { parsed = {}; }
  const heroImage: string | undefined = parsed?.heroImage;

  const onHeroFile = async (file: File) => {
    setUploading(true);
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(",")[1] ?? "");
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const { url } = await uploadFn({ data: { filename: file.name, contentType: file.type, base64 } });
      const next = { ...(parsed || {}), heroImage: url };
      setText(JSON.stringify(next, null, 2));
      // Auto-save so the homepage updates immediately
      await setFn({ data: { key: "home", value: next } });
      toast.success("Фото обновлено");
    } catch (e: any) {
      toast.error(e?.message ?? "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">Контент сайта</h1>
      <div className="flex gap-2 flex-wrap">
        {KEYS.map((k) => (
          <button key={k.key} onClick={() => setKey(k.key)} className={`rounded-full px-3 py-1 text-sm ${key === k.key ? "bg-foreground text-background" : "bg-muted"}`}>{k.label}</button>
        ))}
      </div>

      {key === "home" && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h2 className="font-display text-lg">Главное фото на главной странице</h2>
          <p className="text-xs text-muted-foreground">
            Загрузите изображение — оно сразу заменит фото в hero-блоке главной.
            Рекомендуемое соотношение 4:5, минимум 1200×1500.
          </p>
          <div className="flex items-start gap-4">
            <div className="h-40 w-32 overflow-hidden rounded-xl border bg-muted">
              {heroImage ? (
                <img src={heroImage} alt="Hero" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
                  Используется дефолт
                </div>
              )}
            </div>
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onHeroFile(f);
                }}
              />
              <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Загрузка…" : "Выбрать фото…"}
              </Button>
              {heroImage && (
                <div>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline"
                    onClick={async () => {
                      const next = { ...(parsed || {}) };
                      delete next.heroImage;
                      setText(JSON.stringify(next, null, 2));
                      await setFn({ data: { key: "home", value: next } });
                      toast.success("Сброшено к дефолту");
                    }}
                  >
                    Сбросить к дефолтному фото
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <p className="text-xs text-muted-foreground">Редактируйте JSON. Структура свободная — используйте ключи под нужные блоки.</p>
        <Textarea rows={20} value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-xs" />
        <Button onClick={() => save.mutate()} disabled={save.isPending}>Сохранить</Button>
      </div>
    </div>
  );
}
