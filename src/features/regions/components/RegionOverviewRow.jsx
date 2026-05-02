import { Flame, Globe2, Mountain, Users2 } from "lucide-react";
import { MetricCard } from "../../../components/ui/MetricCard";
import { formatNumber, formatTemp } from "../../../lib/formatters";

export function RegionOverviewRow({ overview }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Countries in hub"
        value={overview.countryCount}
        description="Distinct country nodes currently exposed on this regional route."
        icon={Globe2}
        accent="neon"
      />
      <MetricCard
        label="Combined population"
        value={formatNumber(overview.totalPopulation)}
        description="A rough sense of the scale carried by the regional desk."
        icon={Users2}
        accent="aurora"
      />
      <MetricCard
        label="Warmest capital"
        value={overview.warmestDestination?.place || "Unavailable"}
        description={
          overview.warmestDestination
            ? `${formatTemp(overview.warmestDestination.currentTemp)} in the current live sample.`
            : "No live capital sample available."
        }
        icon={Flame}
        accent="coral"
      />
      <MetricCard
        label="Largest country"
        value={overview.largestCountry?.name.common || "Unavailable"}
        description={
          overview.largestCountry
            ? `${formatNumber(overview.largestCountry.population)} people and ${formatTemp(overview.averageTemp)} average live capital temperature across the sample.`
            : "Country-scale context is unavailable."
        }
        icon={Mountain}
        accent="slate"
      />
    </div>
  );
}
