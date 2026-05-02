import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { ShellCard } from "./ShellCard";

const accentStyles = {
  neon: "text-neon border-neon/20 bg-neon/10",
  aurora: "text-aurora border-aurora/20 bg-aurora/10",
  coral: "text-coral border-coral/20 bg-coral/10",
  slate: "text-slate-200 border-white/10 bg-white/5",
};

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  accent = "slate",
  className,
}) {
  return (
    <ShellCard className={cn("h-full", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--theme-text-muted)]">
            {label}
          </p>
          <p className="mt-4 font-display text-4xl font-semibold text-[color:var(--theme-text-primary)]">
            {value}
          </p>
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border",
              accentStyles[accent],
            )}
          >
            <Icon size={18} />
          </div>
        ) : (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border",
              accentStyles[accent],
            )}
          >
            <ArrowUpRight size={18} />
          </div>
        )}
      </div>
      {description ? (
        <p className="mt-5 text-sm leading-7 text-[color:var(--theme-text-secondary)]">
          {description}
        </p>
      ) : null}
    </ShellCard>
  );
}
