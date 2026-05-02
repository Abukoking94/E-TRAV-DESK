import {
  Banknote,
  Plane,
  PlugZap,
  TrendingUp,
  Users,
  Wifi,
} from "lucide-react";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { formatNumber, formatPercent } from "../../../lib/formatters";

function formatCurrency(value) {
  if (value == null || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function formatDevelopmentValue(metric) {
  if (!metric || metric.value == null) {
    return "N/A";
  }

  if (metric.unit === "currency") {
    return formatCurrency(metric.value);
  }

  if (metric.unit === "percent") {
    return formatPercent(metric.value);
  }

  return formatNumber(metric.value);
}

const metricMeta = [
  { key: "gdpPerCapita", icon: Banknote, accent: "text-neon" },
  { key: "internetUsers", icon: Wifi, accent: "text-aurora" },
  { key: "electricityAccess", icon: PlugZap, accent: "text-coral" },
  { key: "airPassengers", icon: Plane, accent: "text-neon" },
  { key: "tourismArrivals", icon: Users, accent: "text-aurora" },
  { key: "tourismReceiptsShare", icon: TrendingUp, accent: "text-coral" },
];

export function DestinationEconomicPanel({
  indicators,
  isLoading,
  isUnavailable = false,
}) {
  return (
    <ShellCard>
      <SectionHeading
        eyebrow="World Bank"
        title="Economic and tourism context"
        description="A second intelligence layer pulled from the World Bank Indicators API to frame the destination beyond weather and geography."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricMeta.map((item) => {
          const metric = indicators?.[item.key];
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className="rounded-[28px] border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {metric?.label || "Metric"}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {isLoading ? "Loading..." : formatDevelopmentValue(metric)}
                  </p>
                </div>
                <div
                  className={`rounded-2xl border border-white/10 bg-atlas-950/60 p-3 ${item.accent}`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                {metric?.description || "Latest available data"}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                {metric?.year ? `Latest available year ${metric.year}` : "Latest year unavailable"}
              </p>
            </div>
          );
        })}
      </div>

      {isUnavailable ? (
        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
          <p className="text-sm leading-7 text-slate-400">
            The World Bank indicator layer is temporarily unavailable for this destination, so these cards will refresh when the public dataset responds again.
          </p>
        </div>
      ) : null}
    </ShellCard>
  );
}
