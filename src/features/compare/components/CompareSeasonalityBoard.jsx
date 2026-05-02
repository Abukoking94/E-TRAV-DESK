import { CalendarRange, Droplets, ThermometerSun, Wind } from "lucide-react";
import { Link } from "react-router-dom";
import { CompareSeasonalityScoreChart } from "../../../components/charts/CompareSeasonalityScoreChart";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ErrorState } from "../../../components/ui/ErrorState";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { Skeleton } from "../../../components/ui/Skeleton";
import { formatNumber, formatTemp, formatWind } from "../../../lib/formatters";
import { TRAVEL_PROFILE_OPTIONS } from "../../../lib/scoring/travelProfileScore";
import { MONTH_META } from "../../../lib/seasonality";

function formatScore(score) {
  return score == null ? "N/A" : `${Math.round(score)} / 100`;
}

function formatRain(value) {
  return value == null ? "N/A" : `${formatNumber(value)} mm`;
}

function getMonthLabel(month) {
  return MONTH_META.find((item) => item.month === month)?.fullLabel ?? "Selected month";
}

function getBandClasses(band) {
  if (band === "Prime") {
    return "border-neon/20 bg-neon/10 text-neon";
  }

  if (band === "Strong") {
    return "border-aurora/20 bg-aurora/10 text-aurora";
  }

  if (band === "Mixed") {
    return "border-white/10 bg-white/5 text-white";
  }

  if (band === "Avoid") {
    return "border-rose-300/20 bg-rose-500/10 text-rose-100";
  }

  return "border-white/10 bg-white/5 text-slate-400";
}

export function CompareSeasonalityBoard({
  entries,
  chartData,
  selectedProfileId,
  onProfileChange,
  selectedMonth,
  onMonthChange,
  historicalRange,
  isLoading,
  isError,
  errorMessage,
}) {
  if (isLoading) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Seasonal compare"
          title="Compare by month and travel style"
          description="Loading the historical planning layer for every destination on the board."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="mt-8 h-80" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </ShellCard>
    );
  }

  if (isError) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Seasonal compare"
          title="Compare by month and travel style"
          description="The historical compare layer could not be built right now."
        />
        <div className="mt-8">
          <ErrorState description={errorMessage || "Seasonal compare is unavailable."} />
        </div>
      </ShellCard>
    );
  }

  if (!entries.length) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Seasonal compare"
          title="Compare by month and travel style"
          description="Add destinations to compare and the monthly planning layer will appear here."
        />
      </ShellCard>
    );
  }

  return (
    <ShellCard>
      <SectionHeading
        eyebrow="Seasonal compare"
        title="Compare by month and travel style"
        description="Switch travel profiles, pick a month, and read which destination wins on planning value instead of only current conditions."
      />

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

      <div className="mt-5 flex flex-wrap gap-2">
        {MONTH_META.map((month) => (
          <Button
            key={month.month}
            type="button"
            variant={month.month === selectedMonth ? "brand" : "secondary"}
            className="rounded-full px-3 py-2"
            onClick={() => onMonthChange(month.month)}
          >
            {month.label}
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Selected month
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {getMonthLabel(selectedMonth)}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Read through the active travel profile.
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Board size
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {entries.length} destination{entries.length === 1 ? "" : "s"}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Historical range {historicalRange?.startDate} to {historicalRange?.endDate}
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Current profile
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {TRAVEL_PROFILE_OPTIONS.find((item) => item.value === selectedProfileId)?.label}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Each line and score now follows this travel style.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <CompareSeasonalityScoreChart data={chartData} destinations={entries} />
      </div>

      <div className="mt-8 space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.chartKey}
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
                  <p className="text-lg font-semibold text-white">{entry.place}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {entry.countryName} / {entry.region || "Destination"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`normal-case tracking-normal ${getBandClasses(entry.selectedMonthData?.band)}`}>
                  {entry.selectedMonthData?.band || "Unavailable"}
                </Badge>
                <Link to={`/destination/${entry.countryCode}`}>
                  <Button type="button" variant="secondary" className="px-4 py-2">
                    Open destination
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-3 text-neon">
                  <CalendarRange size={18} />
                  <span className="text-sm text-slate-400">Selected month score</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {formatScore(entry.selectedMonthData?.score)}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-3 text-neon">
                  <ThermometerSun size={18} />
                  <span className="text-sm text-slate-400">Mean temperature</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {formatTemp(entry.selectedMonthData?.temperatureMean)}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-3 text-aurora">
                  <Droplets size={18} />
                  <span className="text-sm text-slate-400">Monthly rain</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {formatRain(entry.selectedMonthData?.precipitationTotal)}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-3 text-neon">
                  <Wind size={18} />
                  <span className="text-sm text-slate-400">Mean wind</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {formatWind(entry.selectedMonthData?.windSpeedMean)}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-3 text-aurora">
                  <CalendarRange size={18} />
                  <span className="text-sm text-slate-400">Best window</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {entry.recommendedWindow?.label || "Unavailable"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(entry.selectedMonthData?.strengths ?? []).map((strength) => (
                <Badge
                  key={`${entry.chartKey}-${strength}`}
                  className="border-neon/20 bg-neon/10 normal-case tracking-normal text-neon"
                >
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ShellCard>
  );
}
