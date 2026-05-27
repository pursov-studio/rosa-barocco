import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "mb-8 sm:mb-10",
        align === "center" && "text-center",
        className,
      )}
    >
      {eyebrow && (
        <div className="mb-3 text-[0.7rem] uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-3xl leading-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
