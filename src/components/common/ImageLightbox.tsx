import { useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

export function ImageLightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const reset = () => { setScale(1); setTx(0); setTy(0); };
  useEffect(() => { reset(); }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onIndex]);

  const zoom = (delta: number, cx?: number, cy?: number) => {
    setScale((s) => {
      const next = Math.min(5, Math.max(1, +(s + delta).toFixed(2)));
      if (next === 1) { setTx(0); setTy(0); }
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-3 text-white" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs opacity-70">{index + 1} / {images.length}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => zoom(-0.5)} className="rounded-full p-2 hover:bg-white/10" aria-label="Уменьшить"><ZoomOut className="h-5 w-5" /></button>
          <span className="w-12 text-center text-xs tabular-nums">{Math.round(scale * 100)}%</span>
          <button onClick={() => zoom(0.5)} className="rounded-full p-2 hover:bg-white/10" aria-label="Увеличить"><ZoomIn className="h-5 w-5" /></button>
          <button onClick={onClose} className="ml-2 rounded-full p-2 hover:bg-white/10" aria-label="Закрыть"><X className="h-5 w-5" /></button>
        </div>
      </div>

      <div
        className="relative flex-1 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => { e.preventDefault(); zoom(e.deltaY > 0 ? -0.2 : 0.2); }}
        onDoubleClick={() => (scale === 1 ? zoom(1) : reset())}
        onMouseDown={(e) => {
          if (scale <= 1) return;
          dragRef.current = { x: e.clientX, y: e.clientY, tx, ty };
        }}
        onMouseMove={(e) => {
          if (!dragRef.current) return;
          setTx(dragRef.current.tx + (e.clientX - dragRef.current.x));
          setTy(dragRef.current.ty + (e.clientY - dragRef.current.y));
        }}
        onMouseUp={() => { dragRef.current = null; }}
        onMouseLeave={() => { dragRef.current = null; }}
        style={{ cursor: scale > 1 ? (dragRef.current ? "grabbing" : "grab") : "zoom-in" }}
      >
        <img
          src={images[index]}
          alt=""
          draggable={false}
          className="absolute inset-0 m-auto max-h-full max-w-full select-none transition-transform duration-100"
          style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: "center center" }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + images.length) % images.length); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              aria-label="Предыдущее"
            ><ChevronLeft className="h-6 w-6" /></button>
            <button
              onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % images.length); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              aria-label="Следующее"
            ><ChevronRight className="h-6 w-6" /></button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto p-3" onClick={(e) => e.stopPropagation()}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => onIndex(i)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded border-2 transition-colors ${i === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
