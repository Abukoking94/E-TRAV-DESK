import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

export function SelectField({ className, options, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-12 w-full appearance-none rounded-2xl border border-[color:var(--theme-border-soft)] bg-[var(--theme-input-bg)] px-4 pr-11 text-sm text-[color:var(--theme-text-primary)] outline-none transition focus:border-neon/35 focus:bg-[var(--theme-input-focus-bg)]",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[var(--theme-surface-strong)] text-[color:var(--theme-text-primary)]"
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--theme-text-muted)]"
      />
    </div>
  );
}
