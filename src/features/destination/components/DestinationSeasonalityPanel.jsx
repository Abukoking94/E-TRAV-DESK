import { useEffect, useMemo, useState } from "react";
import { CalendarRange, CloudSun, Droplets, ThermometerSun, Wind } from "lucide-react";
import { SeasonalityChart } from "../../../components/charts/SeasonalityChart";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ErrorState } from "../../../components/ui/ErrorState";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { Skeleton } from "../../../components/ui/Skeleton";
import { formatNumber, formatPercent, formatTemp, formatWind } from "../../../lib/formatters";
import { TRAVEL_PROFILE_OPTIONS } from "../../../lib/scoring/travelProfileScore";

function formatRangeLabel(date) {
  if (!date) {
    return "N/A";
  }

  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatScore(score) {
  return score == null ? "N/A" : `${Math.round(score)} / 100`;
}

function formatRain(value) {
  return value == null ? "N/A" : `${formatNumber(value)} mm`;
}

function getBandClasses(band, isSelected) {
  const selected = isSelected ? " ring-2 ring-neon/40" : "";

  if (band === "Prime") {
    return `border-neon/25 bg-neon/10 text-neon${selected}`;
  }

  if (band === "Strong") {
    return `border-aurora/25 bg-aurora/10 text-aurora${selected}`;
  }

  if (band === "Mixed") {
    return `border-white/10 bg-white/5 text-white${selected}`;
  }

  if (band === "Avoid") {
    return `border-rose-400/20 bg-rose-500/10 text-rose-100${selected}`;
  }

  return `border-white/10 bg-white/5 text-slate-400${selected}`;
}

export function DestinationSeasonalityPanel({
  seasonalityProfile,
  travelWindowPlan,
  selectedProfileId,
  onProfileChange,
  isLoading,
  isError,
  errorMessage,
  historicalRange,
}) {
  const [selectedMonthKey, setSelectedMonthKey] = useState(null);

  useEffect(() => {
    const preferredKey =
      travelWindowPlan?.recommendedWindow?.months?.[0]?.key ??
      travelWindowPlan?.topMonth?.key ??
      null;

    if (preferredKey) {
      setSelectedMonthKey(preferredKey);
    }
  }, [travelWindowPlan]);

  const selectedMonth = useMemo(() => {
    const months = travelWindowPlan?.scoredMonths ?? [];

    return (
      months.find((month) => month.key === selectedMonthKey) ??
      travelWindowPlan?.topMonth ??
      months[0] ??
      null
    );
  }, [selectedMonthKey, travelWindowPlan]);

  if (isLoading) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Seasonality"
          title="Best time to visit"
          description="Building the historical travel window profile for this destination."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="mt-8 h-80" />
        <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }, (_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      </ShellCard>
    );
  }

  if (isError) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Seasonality"
          title="Best time to visit"
          description="Historical weather data could not be shaped for this destination right now."
        />
        <div className="mt-8">
          <ErrorState description={errorMessage || "Seasonality data unavailable."} />
        </div>
      </ShellCard>
    );
  }

  if (!seasonalityProfile || !travelWindowPlan) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Seasonality"
          title="Best time to visit"
          description="Historical seasonality is not available for this destination yet."
        />
      </ShellCard>
    );
  }

  const recommendedWindow = travelWindowPlan.recommendedWindow;
  const topMonth = travelWindowPlan.topMonth;

  return (
    <ShellCard>
      <SectionHeading
        eyebrow="Seasonality"
        title="Best time to visit"
        description="A multi-year historical weather profile turned into planning-grade travel windows, profile switching, and month-by-month reads."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Recommended window
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {recommendedWindow?.label || "Unavailable"}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {travelWindowPlan.profile.label} score {formatScore(recommendedWindow?.score)}
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Strongest month
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {topMonth?.fullLabel || "Unavailable"}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Average weather read {formatScore(topMonth?.score)}
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Historical coverage
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {seasonalityProfile.coverage.totalYears} years
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {formatRangeLabel(historicalRange?.startDate)} to{" "}
            {formatRangeLabel(historicalRange?.endDate)}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {TRAVEL_PROFILE_OPTIONS.map((profile) => (
          <Button
            key={profile.value}
            type="button"
            variant={profile.value === selectedProfileId ? "brand" : "secondary"}
            className="rounded-full px-4 py-2"
            onClick={() => onProfileChange(profile.value)}
          >
            {profile.label}
          </Button>
        ))}
      </div>

      <div className="mt-5 rounded-[28px] border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-medium text-white">
          {travelWindowPlan.profile.label}
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-400">
          {travelWindowPlan.profile.summary}
        </p>
      </div>

      <div className="mt-8">
        <SeasonalityChart months={travelWindowPlan.scoredMonths} />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {travelWindowPlan.scoredMonths.map((month) => (
          <button
            key={month.key}
            type="button"
            onClick={() => setSelectedMonthKey(month.key)}
            className={`rounded-[24px] border p-4 text-left transition duration-300 hover:-translate-y-1 ${getBandClasses(
              month.band,
              selectedMonth?.key === month.key,
            )}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{month.fullLabel}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] opacity-80">
                  {month.band}
                </p>
              </div>
              <Badge className="border-current/20 bg-black/10 normal-case tracking-normal text-current">
                {Math.round(month.score ?? 0)}
              </Badge>
            </div>
            <div className="mt-5 space-y-1 text-sm">
              <p>{formatTemp(month.temperatureMean)}</p>
              <p>{formatRain(month.precipitationTotal)}</p>
              <p>{formatWind(month.windSpeedMean)}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedMonth ? (
        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Selected month read
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">
                {selectedMonth.fullLabel}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {travelWindowPlan.profile.label} rating {formatScore(selectedMonth.score)}
              </p>
            </div>
            <Badge className="border-neon/20 bg-neon/10 normal-case tracking-normal text-neon">
              {selectedMonth.band}
            </Badge>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-3 text-neon">
                <ThermometerSun size={18} />
                <span className="text-sm text-slate-400">Mean temperature</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">
                {formatTemp(selectedMonth.temperatureMean)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-3 text-aurora">
                <Droplets size={18} />
                <span className="text-sm text-slate-400">Rain total</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">
                {formatRain(selectedMonth.precipitationTotal)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-3 text-neon">
                <Wind size={18} />
                <span className="text-sm text-slate-400">Mean wind</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">
                {formatWind(selectedMonth.windSpeedMean)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-3 text-aurora">
                <CloudSun size={18} />
                <span className="text-sm text-slate-400">Rainy-day share</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">
                {formatPercent(selectedMonth.rainyDayShareAverage)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/10 p-5">
              <div className="flex items-center gap-3 text-neon">
                <CalendarRange size={18} />
                <span className="font-medium text-white">Strength signals</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedMonth.strengths.length ? (
                  selectedMonth.strengths.map((strength) => (
                    <Badge
                      key={strength}
                      className="border-neon/20 bg-neon/10 normal-case tracking-normal text-neon"
                    >
                      {strength}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No standout strengths were available for this month.
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/10 p-5">
              <div className="flex items-center gap-3 text-rose-200">
                <CalendarRange size={18} />
                <span className="font-medium text-white">Watch-outs</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedMonth.cautions.length ? (
                  selectedMonth.cautions.map((caution) => (
                    <Badge
                      key={caution}
                      className="border-rose-300/20 bg-rose-500/10 normal-case tracking-normal text-rose-100"
                    >
                      {caution}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No major caution signals were available for this month.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ShellCard>
  );
}
