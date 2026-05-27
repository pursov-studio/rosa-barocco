import { formatPrice } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

export function Price({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)}>{formatPrice(value)}</span>
  );
}
