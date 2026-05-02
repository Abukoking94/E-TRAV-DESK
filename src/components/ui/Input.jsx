import { cn } from "../../lib/cn";

export function Input({ className, icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon ? (
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--theme-text-muted)]"
          size={16}
        />
      ) : null}
      <input
        className={cn(
          "h-12 w-full rounded-2xl border border-[color:var(--theme-border-soft)] bg-[var(--theme-input-bg)] px-4 text-sm text-[color:var(--theme-text-primary)] outline-none transition placeholder:text-[color:var(--theme-text-muted)] focus:border-neon/35 focus:bg-[var(--theme-input-focus-bg)]",
          Icon ? "pl-11" : "",
          className,
        )}
        {...props}
      />
    </div>
  );
}
