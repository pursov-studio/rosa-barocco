import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListProducts, adminUpsertProduct, adminDeleteProduct,
  adminListCategories, adminUploadImage,
} from "@/lib/admin/admin.functions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({ component: ProductsPage });

type ProductRow = {
  id?: string; slug: string; sku?: string | null; name: string; category_slug: string;
  price: number; short_description: string; composition?: string | null; usage?: string | null;
  volume_ml?: number | null; weight_g?: number | null; areas: string[]; skin_type: string[];
  target?: string | null; image_url?: string | null; images: string[]; in_stock: boolean; is_set: boolean;
  bundle_items: string[]; sort: number;
};

const empty = (): ProductRow => ({
  slug: "", name: "", category_slug: "", price: 0, short_description: "",
  areas: [], skin_type: [], bundle_items: [], images: [], in_stock: true, is_set: false, sort: 0,
});

function ProductsPage() {
  const listFn = useServerFn(adminListProducts);
  const catsFn = useServerFn(adminListCategories);
  const upsertFn = useServerFn(adminUpsertProduct);
  const delFn = useServerFn(adminDeleteProduct);
  const uploadFn = useServerFn(adminUploadImage);
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["adm-prods"], queryFn: () => listFn() });
  const cats = useQuery({ queryKey: ["adm-cats"], queryFn: () => catsFn() });
  const [edit, setEdit] = useState<ProductRow | null>(null);

  const save = useMutation({
    mutationFn: (p: ProductRow) => upsertFn({ data: p as any }),
    onSuccess: () => { toast.success("Сохранено"); setEdit(null); qc.invalidateQueries({ queryKey: ["adm-prods"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Удалено"); qc.invalidateQueries({ queryKey: ["adm-prods"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const onUpload = async (file: File) => {
    const base64 = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res((r.result as string).split(",")[1] ?? "");
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    const { url } = await uploadFn({ data: { filename: file.name, contentType: file.type, base64 } });
    return url;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Товары</h1>
        <Button onClick={() => setEdit(empty())}>+ Новый товар</Button>
      </div>
      <div className="rounded-2xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-3 py-2">Фото</th><th className="px-3 py-2">Название</th><th className="px-3 py-2">Адрес</th><th className="px-3 py-2">Категория</th><th className="px-3 py-2">Цена</th><th className="px-3 py-2">В наличии</th><th className="px-3 py-2"></th></tr>
          </thead>
          <tbody>
            {list.data?.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2">{(p.images?.[0] || p.image_url) ? <img src={(p.images?.[0] || p.image_url) as string} alt="" className="h-12 w-12 rounded bg-secondary/40 object-contain" /> : <div className="h-12 w-12 rounded bg-muted" />}</td>
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{p.slug}</td>
                <td className="px-3 py-2 text-xs">{p.category_slug}</td>
                <td className="px-3 py-2">{p.price} ₽</td>
                <td className="px-3 py-2">{p.in_stock ? "✓" : "—"}</td>
                <td className="px-3 py-2 text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => setEdit({ ...(p as any), images: (p as any).images ?? [] })}>Изм.</Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Удалить?")) remove.mutate(p.id); }}>×</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEdit(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl mb-4">{edit.id ? "Изменить товар" : "Новый товар"}</h2>
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(edit); }}>
              <Field label="Адрес в URL (латиницей)"><Input required value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} /></Field>
              <Field label="Артикул"><Input value={edit.sku ?? ""} onChange={(e) => setEdit({ ...edit, sku: e.target.value })} /></Field>
              <Field label="Название" full><Input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
              <Field label="Категория">
                <select required value={edit.category_slug} onChange={(e) => setEdit({ ...edit, category_slug: e.target.value })} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">—</option>
                  {cats.data?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Цена, ₽"><Input type="number" min={0} value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} /></Field>
              <Field label="Объём, мл"><Input type="number" min={0} value={edit.volume_ml ?? ""} onChange={(e) => setEdit({ ...edit, volume_ml: e.target.value ? Number(e.target.value) : null })} /></Field>
              <Field label="Вес, г"><Input type="number" min={0} value={edit.weight_g ?? ""} onChange={(e) => setEdit({ ...edit, weight_g: e.target.value ? Number(e.target.value) : null })} /></Field>
              <Field label="Краткое описание" full><Textarea rows={2} value={edit.short_description} onChange={(e) => setEdit({ ...edit, short_description: e.target.value })} /></Field>
              <Field label="Состав" full><Textarea rows={2} value={edit.composition ?? ""} onChange={(e) => setEdit({ ...edit, composition: e.target.value })} /></Field>
              <Field label="Применение" full><Textarea rows={2} value={edit.usage ?? ""} onChange={(e) => setEdit({ ...edit, usage: e.target.value })} /></Field>
              <Field label="Назначение"><Input value={edit.target ?? ""} onChange={(e) => setEdit({ ...edit, target: e.target.value })} /></Field>
              <Field label="Зоны (через запятую)"><Input value={edit.areas.join(", ")} onChange={(e) => setEdit({ ...edit, areas: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} /></Field>
              <Field label="Тип кожи (через запятую)"><Input value={edit.skin_type.join(", ")} onChange={(e) => setEdit({ ...edit, skin_type: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} /></Field>
              <Field label="Порядок сортировки"><Input type="number" value={edit.sort} onChange={(e) => setEdit({ ...edit, sort: Number(e.target.value) })} /></Field>
              <Field label="Фото (можно несколько)" full>
                {edit.images.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {edit.images.map((src, i) => (
                      <div key={i} className="group relative h-24 w-24 overflow-hidden rounded border bg-secondary/40">
                        <img src={src} alt="" className="h-full w-full object-contain p-1" />
                        <button
                          type="button"
                          onClick={() => setEdit({ ...edit, images: edit.images.filter((_, j) => j !== i), image_url: i === 0 ? (edit.images[1] ?? null) : edit.image_url })}
                          className="absolute right-0 top-0 rounded-bl bg-black/60 px-1.5 text-xs text-white opacity-0 group-hover:opacity-100"
                          aria-label="Удалить"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file" accept="image/*" multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []); if (!files.length) return;
                    try {
                      const urls = await Promise.all(files.map(onUpload));
                      const next = [...edit.images, ...urls];
                      setEdit({ ...edit, images: next, image_url: edit.image_url ?? next[0] ?? null });
                      toast.success(`Загружено: ${urls.length}`);
                    } catch (err: any) { toast.error(err.message); }
                    e.target.value = "";
                  }}
                />
                <Input className="mt-2" placeholder="или вставьте URL и нажмите Enter" onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const url = (e.target as HTMLInputElement).value.trim();
                    if (!url) return;
                    const next = [...edit.images, url];
                    setEdit({ ...edit, images: next, image_url: edit.image_url ?? next[0] });
                    (e.target as HTMLInputElement).value = "";
                  }
                }} />
              </Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.in_stock} onChange={(e) => setEdit({ ...edit, in_stock: e.target.checked })} /> В наличии</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.is_set} onChange={(e) => setEdit({ ...edit, is_set: e.target.checked })} /> Набор</label>
              <div className="sm:col-span-2 mt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setEdit(null)}>Отмена</Button>
                <Button type="submit" disabled={save.isPending}>{save.isPending ? "..." : "Сохранить"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="mb-1 block text-xs">{label}</Label>
      {children}
    </div>
  );
}
