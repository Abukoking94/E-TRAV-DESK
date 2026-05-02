import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { RegionTemperatureChart } from "../../../components/charts/RegionTemperatureChart";
import { formatPercent, formatTemp, formatWind } from "../../../lib/formatters";

export function RegionClimateBoard({ climateDestinations, chartData }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <ShellCard>
        <SectionHeading
          eyebrow="Climate watch"
          title="Live capital temperature sample"
          description="This is a focused weather sample from major capitals in the region, giving the hub a live operational layer without overwhelming the client."
        />
        <div className="mt-8">
          <RegionTemperatureChart data={chartData} />
        </div>
      </ShellCard>

      <ShellCard>
        <SectionHeading
          eyebrow="Live reads"
          title="Current capital conditions"
          description="A compact leaderboard of the capitals currently driving the region's live climate story."
        />
        <div className="mt-8 space-y-4">
          {climateDestinations.map((destination) => (
            <div
              key={destination.id}
              className="rounded-[28px] border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {destination.countryName}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {destination.place}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-neon">
                    {destination.weatherLabel}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatTemp(destination.currentTemp)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-atlas-950/50 p-4">
                  <p className="text-slate-500">Rain chance</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatPercent(destination.rainChance)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-atlas-950/50 p-4">
                  <p className="text-slate-500">Wind</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatWind(destination.windSpeed)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ShellCard>
    </div>
  );
}
