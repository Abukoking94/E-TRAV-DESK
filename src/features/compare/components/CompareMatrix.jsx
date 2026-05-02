import { ShellCard } from "../../../components/ui/ShellCard";
import {
  formatNumber,
  formatPercent,
  formatTemp,
  formatWind,
} from "../../../lib/formatters";

const rows = [
  {
    label: "Travel index",
    render: (destination) => `${destination.travelIndex}/100`,
  },
  {
    label: "Comfort score",
    render: (destination) => `${destination.comfortScore}/100`,
  },
  {
    label: "Current temp",
    render: (destination) => formatTemp(destination.currentTemp),
  },
  {
    label: "High today",
    render: (destination) => formatTemp(destination.todayHigh),
  },
  {
    label: "Rain chance",
    render: (destination) => formatPercent(destination.rainChance),
  },
  {
    label: "Wind",
    render: (destination) => formatWind(destination.windSpeed),
  },
  {
    label: "Air quality",
    render: (destination) => destination.aqiSummary.label,
  },
  {
    label: "Population",
    render: (destination) => formatNumber(destination.population),
  },
  {
    label: "Languages",
    render: (destination) => destination.languages.join(", ") || "Unavailable",
  },
];

export function CompareMatrix({ destinations }) {
  return (
    <ShellCard className="overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Side-by-side matrix
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Decision table
          </h3>
        </div>
        <p className="max-w-sm text-right text-sm leading-7 text-slate-400">
          The board mixes country context with live operational signals so the
          comparison reads like a product surface, not a static info table.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                Signal
              </th>
              {destinations.map((destination) => (
                <th
                  key={destination.chartKey}
                  className="min-w-[180px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white"
                >
                  <div className="flex items-center gap-3">
                    {destination.flag ? (
                      <img
                        src={destination.flag}
                        alt={destination.countryName}
                        loading="lazy"
                        decoding="async"
                        className="h-10 w-10 rounded-2xl object-cover"
                      />
                    ) : null}
                    <div>
                      <p className="font-semibold">{destination.place}</p>
                      <p className="text-xs font-normal uppercase tracking-[0.16em] text-slate-400">
                        {destination.countryName}
                      </p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-4 text-slate-400">{row.label}</td>
                {destinations.map((destination) => (
                  <td
                    key={`${destination.chartKey}-${row.label}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 align-top text-white"
                  >
                    {row.render(destination)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ShellCard>
  );
}
