import { CalendarRange, Compass } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { SelectField } from "../../../components/ui/SelectField";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { TRAVEL_PROFILE_OPTIONS } from "../../../lib/scoring/travelProfileScore";
import { MONTH_META } from "../../../lib/seasonality";

const modeOptions = [
  { value: "exact-month", label: "Exact month ranking" },
  { value: "best-window", label: "Best window ranking" },
];

const windowSizeOptions = [
  { value: "1", label: "1 month window" },
  { value: "2", label: "2 month window" },
  { value: "3", label: "3 month window" },
];

const monthOptions = MONTH_META.map((month) => ({
  value: String(month.month),
  label: month.fullLabel,
}));

export function PlannerControlPanel({
  query,
  onQueryChange,
  profileId,
  onProfileChange,
  mode,
  onModeChange,
  selectedMonth,
  onSelectedMonthChange,
  windowSize,
  onWindowSizeChange,
  selectedCount,
}) {
  return (
    <ShellCard>
      <SectionHeading
        eyebrow="Planner"
        title="Build a ranked travel plan"
        description="Choose destinations, switch the travel style, and rank them by exact month or best overall window."
      />

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search countries, capitals, or regions"
          icon={Compass}
          aria-label="Search planner destinations"
        />
        <SelectField
          value={profileId}
          onChange={(event) => onProfileChange(event.target.value)}
          aria-label="Select planner travel profile"
          options={TRAVEL_PROFILE_OPTIONS.map((profile) => ({
            value: profile.value,
            label: profile.label,
          }))}
        />
        <SelectField
          value={mode}
          onChange={(event) => onModeChange(event.target.value)}
          aria-label="Select planner ranking mode"
          options={modeOptions}
        />
        {mode === "exact-month" ? (
          <SelectField
            value={String(selectedMonth)}
            onChange={(event) => onSelectedMonthChange(Number(event.target.value))}
            aria-label="Select planner month"
            options={monthOptions}
          />
        ) : (
          <SelectField
            value={String(windowSize)}
            onChange={(event) => onWindowSizeChange(Number(event.target.value))}
            aria-label="Select planner window size"
            options={windowSizeOptions}
          />
        )}
      </div>

      <div
        className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 text-neon">
          <CalendarRange size={18} />
          <span className="font-medium text-white">Current plan state</span>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          {selectedCount} destination{selectedCount === 1 ? "" : "s"} selected. The planner works best with 2 to 5 destinations so the ranking remains readable and intentional.
        </p>
      </div>
    </ShellCard>
  );
}
