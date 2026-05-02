import { REGION_OPTIONS } from "../../../lib/constants";
import { cn } from "../../../lib/cn";

export function ExploreFilters({ activeRegion, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {REGION_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition",
            activeRegion === option.value
              ? "border-neon/40 bg-neon/10 text-neon"
              : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
