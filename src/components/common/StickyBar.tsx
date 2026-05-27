import type { ReactNode } from "react";

/**
 * Mobile sticky bottom bar with safe-area handling.
 * Use `className` to control visibility (e.g. `sm:hidden` or `lg:hidden`).
 */
export function StickyBar({
  children,
  className = "sm:hidden",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-2.5 backdrop-blur shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}
