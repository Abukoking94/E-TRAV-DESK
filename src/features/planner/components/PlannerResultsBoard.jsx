import {
  CalendarRange,
  Droplets,
  ShieldAlert,
  ShieldCheck,
  Siren,
  ThermometerSun,
  Wind,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CompareSeasonalityScoreChart } from "../../../components/charts/CompareSeasonalityScoreChart";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ErrorState } from "../../../components/ui/ErrorState";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { Skeleton } from "../../../components/ui/Skeleton";
import { formatNumber, formatTemp, formatWind } from "../../../lib/formatters";

function formatScore(score) {
  return score == null ? "N/A" : `${Math.round(score)} / 100`;
}

function formatRain(value) {
  return value == null ? "N/A" : `${formatNumber(value)} mm`;
}

function getRiskBandClasses(band) {
  if (band === "Severe") {
    return "border-rose-300/20 bg-rose-500/10 text-rose-100";
  }

  if (band === "Active") {
    return "border-amber-300/20 bg-amber-500/10 text-amber-100";
  }

  if (band === "Elevated") {
    return "border-neon/20 bg-neon/10 text-neon";
  }

  return "border-emerald-300/20 bg-emerald-500/10 text-emerald-100";
}

function getRiskIcon(band) {
  if (band === "Severe" || band === "Active") {
    return Siren;
  }

  if (band === "Elevated") {
    return ShieldAlert;
  }

  return ShieldCheck;
}

export function PlannerResultsBoard({
  entries,
  summary,
  chartData,
  mode,
  selectedMonth,
  windowSize,
  isLoading,
  isError,
  errorMessage,
  isRiskLoading,
  isRiskError,
  riskErrorMessage,
}) {
  if (isLoading) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Results"
          title="Planner rankings"
          description="Building the historical planning results for the selected destinations."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="mt-8 h-80" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      </ShellCard>
    );
  }

  if (isError) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Results"
          title="Planner rankings"
          description="The planner could not rank the selected destinations right now."
        />
        <div className="mt-8">
          <ErrorState description={errorMessage || "Planner results unavailable."} />
        </div>
      </ShellCard>
    );
  }

  if (!entries.length) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Results"
          title="Planner rankings"
          description="Select destinations and the planner will rank them here."
        />
        <div className="mt-8">
          <EmptyState
            title="No destinations selected."
            description="Add a few destinations from the planner pool to generate a ranked plan."
          />
        </div>
      </ShellCard>
    );
  }

  return (
    <ShellCard>
      <SectionHeading
        eyebrow="Results"
        title="Planner rankings"
        description="The planner compares exact-month fit or best-window fit and then ranks the selected destinations from strongest to weakest."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[28px] border border-neon/20 bg-neon/10 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-neon">
            Leader
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {summary.leader?.place || "Unavailable"}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Score {formatScore(summary.leader?.rankingScore)}
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Planning mode
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {mode === "best-window"
              ? `${windowSize}-month window`
              : `Month ${selectedMonth}`}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {mode === "best-window"
              ? "Ranking by the strongest multi-month window."
              : "Ranking by the exact selected month."}
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Average board score
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {formatScore(summary.averageScore)}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Across {summary.comparableCount} comparable destination{summary.comparableCount === 1 ? "" : "s"}.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <CompareSeasonalityScoreChart
          data={chartData}
          destinations={entries.map((entry, index) => ({
            chartKey: `planner_${index + 1}`,
            color: entry.color || ["#2797ff", "#8edbff", "#5ab6ff", "#9b8cff", "#4ce4b7"][index % 5],
          }))}
        />
      </div>

      <div className="mt-8 space-y-4">
        {entries.map((entry, index) => (
          <div
            key={`${entry.countryCode}-${entry.place}`}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {entry.flag ? (
                  <img
                    src={entry.flag}
                    alt={entry.countryName}
                    loading="lazy"
                    decoding="async"
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                ) : null}
                <div>
                  <p className="text-lg font-semibold text-white">
                    {index + 1}. {entry.place}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {entry.countryName} / {entry.region}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {isRiskLoading ? (
                  <Badge className="border-white/10 bg-black/10 normal-case tracking-normal text-white">
                    Risk syncing
                  </Badge>
                ) : isRiskError ? (
                  <Badge className="border-white/10 bg-black/10 normal-case tracking-normal text-white">
                    Risk unavailable
                  </Badge>
                ) : entry.riskSnapshot ? (
                  <Badge
                    className={`normal-case tracking-normal ${getRiskBandClasses(entry.riskSnapshot.band)}`}
                  >
                    {entry.riskSnapshot.band}
                  </Badge>
                ) : null}
                <Badge className="border-neon/20 bg-neon/10 normal-case tracking-normal text-neon">
                  {formatScore(entry.rankingScore)}
                </Badge>
                <Link to={`/destination/${entry.countryCode}?place=${encodeURIComponent(entry.place)}&lat=${entry.lat}&lng=${entry.lng}`}>
                  <Button type="button" variant="secondary" className="px-4 py-2">
                    Open destination
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-3 text-neon">
                  <CalendarRange size={18} />
                  <span className="text-sm text-slate-400">Best window</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {entry.window?.label || "Unavailable"}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-3 text-neon">
                  <ThermometerSun size={18} />
                  <span className="text-sm text-slate-400">Mean temperature</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {formatTemp(entry.monthData?.temperatureMean)}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-3 text-aurora">
                  <Droplets size={18} />
                  <span className="text-sm text-slate-400">Rain load</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {formatRain(entry.monthData?.precipitationTotal)}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-3 text-neon">
                  <Wind size={18} />
                  <span className="text-sm text-slate-400">Wind pace</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {formatWind(entry.monthData?.windSpeedMean)}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-3 text-aurora">
                  <CalendarRange size={18} />
                  <span className="text-sm text-slate-400">Profile average</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {formatScore(entry.averageScore)}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-3 text-aurora">
                  {(() => {
                    const RiskIcon = getRiskIcon(entry.riskSnapshot?.band);
                    return <RiskIcon size={18} />;
                  })()}
                  <span className="text-sm text-slate-400">Risk overlay</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {isRiskLoading
                    ? "Syncing..."
                    : isRiskError
                      ? "Unavailable"
                      : entry.riskSnapshot
                        ? `${entry.riskSnapshot.band} / ${entry.riskSnapshot.openCount}`
                        : "No signal"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(entry.monthData?.strengths ?? []).map((strength) => (
                <Badge
                  key={`${entry.countryCode}-${entry.place}-${strength}`}
                  className="border-neon/20 bg-neon/10 normal-case tracking-normal text-neon"
                >
                  {strength}
                </Badge>
              ))}
            </div>

            {entry.riskSnapshot ? (
              <p className="mt-4 text-sm leading-7 text-slate-400">
                {entry.riskSnapshot.headline} Latest signal{" "}
                {entry.riskSnapshot.latestEventLabel}.{" "}
                {entry.riskSnapshot.topCategory
                  ? `Dominant category: ${entry.riskSnapshot.topCategory}.`
                  : "No dominant event category right now."}
              </p>
            ) : isRiskLoading ? (
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Syncing the live risk overlay for this destination.
              </p>
            ) : isRiskError ? (
              <p className="mt-4 text-sm leading-7 text-slate-400">
                {riskErrorMessage || "The live risk overlay is unavailable right now."}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </ShellCard>
  );
}
