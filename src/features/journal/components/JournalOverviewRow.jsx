import { Flame, Globe2, Link2, Orbit } from "lucide-react";
import { MetricCard } from "../../../components/ui/MetricCard";
import { formatNumber, formatPercent, formatTemp } from "../../../lib/formatters";

export function JournalOverviewRow({ overview }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Countries tracked"
        value={overview.countryCount}
        description={`${overview.regionCount} active regions are shaping the editorial desk.`}
        icon={Globe2}
        accent="neon"
      />
      <MetricCard
        label="Warmest live read"
        value={overview.warmestSignal?.place || "Unavailable"}
        description={
          overview.warmestSignal
            ? `${formatTemp(overview.warmestSignal.currentTemp)} right now in ${overview.warmestSignal.countryName}.`
            : "The live climate feed has not returned a current leader yet."
        }
        icon={Flame}
        accent="aurora"
      />
      <MetricCard
        label="Driest near-term"
        value={overview.driestSignal?.place || "Unavailable"}
        description={
          overview.driestSignal
            ? `${formatPercent(overview.driestSignal.rainChance)} rain chance in the current daily window.`
            : "Rain-signal rankings are currently unavailable."
        }
        icon={Orbit}
        accent="coral"
      />
      <MetricCard
        label="Most connected"
        value={overview.borderLeader?.name.common || "Unavailable"}
        description={
          overview.borderLeader
            ? `${formatNumber(overview.totalPopulation)} combined population across the countries sampled for the journal.`
            : "Cross-border context is unavailable."
        }
        icon={Link2}
        accent="slate"
      />
    </div>
  );
}
