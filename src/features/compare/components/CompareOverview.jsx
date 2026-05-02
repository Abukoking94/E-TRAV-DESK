import { CloudSun, Droplets, Sparkles, SunMedium } from "lucide-react";
import { MetricCard } from "../../../components/ui/MetricCard";
import { formatPercent, formatTemp } from "../../../lib/formatters";

export function CompareOverview({ overview }) {
  if (!overview) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Average comfort"
        value={`${overview.averageComfort ?? "N/A"}/100`}
        description={`The current board average is ${overview.averageTravelIndex ?? "N/A"}/100 on the broader travel index.`}
        icon={Sparkles}
        accent="neon"
      />
      <MetricCard
        label="Best overall"
        value={overview.overallLeader?.place || "Unavailable"}
        description={
          overview.overallLeader
            ? `${overview.overallLeader.travelIndex}/100 travel index with ${overview.overallLeader.weatherLabel.toLowerCase()} conditions.`
            : "Add live destinations to unlock board guidance."
        }
        icon={CloudSun}
        accent="aurora"
      />
      <MetricCard
        label="Warmest live read"
        value={formatTemp(overview.warmestLeader?.currentTemp)}
        description={
          overview.warmestLeader
            ? `${overview.warmestLeader.place} is leading the board on immediate warmth.`
            : "No temperature feed is available yet."
        }
        icon={SunMedium}
        accent="coral"
      />
      <MetricCard
        label="Lowest rain risk"
        value={formatPercent(overview.driestLeader?.rainChance)}
        description={
          overview.driestLeader
            ? `${overview.driestLeader.place} currently looks driest, while ${overview.cleanestLeader?.place || "the board"} holds the cleanest air signal.`
            : "No precipitation data is available yet."
        }
        icon={Droplets}
        accent="slate"
      />
    </div>
  );
}
