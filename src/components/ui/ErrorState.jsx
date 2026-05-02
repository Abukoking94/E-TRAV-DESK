import { AlertTriangle } from "lucide-react";
import { ShellCard } from "./ShellCard";

export function ErrorState({ title = "Something went off course.", description }) {
  return (
    <ShellCard className="border-rose-400/25">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-rose-300">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[color:var(--theme-text-primary)]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-[color:var(--theme-text-secondary)]">
            {description}
          </p>
        </div>
      </div>
    </ShellCard>
  );
}
