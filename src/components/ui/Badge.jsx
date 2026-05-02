import { cn } from "../../lib/cn";

export function Badge({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[color:var(--theme-border-soft)] bg-[var(--theme-surface)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[color:var(--theme-text-secondary)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
