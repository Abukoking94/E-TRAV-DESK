import { cn } from "../../lib/cn";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-[112px] w-full rounded-2xl border border-[color:var(--theme-border-soft)] bg-[var(--theme-input-bg)] px-4 py-3 text-sm text-[color:var(--theme-text-primary)] outline-none transition placeholder:text-[color:var(--theme-text-muted)] focus:border-neon/35 focus:bg-[var(--theme-input-focus-bg)]",
        className,
      )}
      {...props}
    />
  );
}
