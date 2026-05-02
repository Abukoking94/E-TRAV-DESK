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
import { SelectField } from "../../../components/ui/SelectField";
import { ShellCard } from "../../../components/ui/ShellCard";
import { Skeleton } from "../../../components/ui/Skeleton";
import { TravelSignalMapPanel } from "../../maps/components/TravelSignalMapPanel";
import {
  formatNumber,
  formatTemp,
  formatWind,
  slugify,
} from "../../../lib/formatters";
import { TRAVEL_PROFILE_OPTIONS } from "../../../lib/scoring/travelProfileScore";
import { MONTH_META } from "../../../lib/seasonality";

const planningModeOptions = [
  { value: "exact-month", label: "Exact month" },
  { value: "best-window", label: "Best window" },
];

const windowSizeOptions = [
  { value: "1", label: "1 month" },
  { value: "2", label: "2 months" },
  { value: "3", label: "3 months" },
];

const monthOptions = MONTH_META.map((month) => ({
  value: String(month.month),
  label: month.fullLabel,
}));

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

export function SavedPlanningDesk({
  entries,
  summary,
  chartData,
  profileId,
  onProfileChange,
  mode,
  onModeChange,
  selectedMonth,
  onSelectedMonthChange,
  windowSize,
  onWindowSizeChange,
  activeJourney,
  onSaveJourneyProfile,
  onLoadJourneyProfile,
  isLoading,
  isError,
  errorMessage,
  isRiskLoading,
  isRiskError,
  riskErrorMessage,
}) {
  const activeProfileLabel =
    TRAVEL_PROFILE_OPTIONS.find((option) => option.value === profileId)?.label ||
    "Travel profile";

  if (isLoading) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Planning desk"
          title="Best month for the saved shortlist"
          description="Building seasonality rankings and live risk overlays for your saved destinations."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="mt-8 h-80" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      </ShellCard>
    );
  }

  if (isError) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Planning desk"
          title="Best month for the saved shortlist"
          description="The saved planning workspace could not be generated right now."
        />
        <div className="mt-8">
          <ErrorState description={errorMessage || "Saved planning desk unavailable."} />
        </div>
      </ShellCard>
    );
  }

  return (
    <ShellCard>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <SectionHeading
          eyebrow="Planning desk"
          title="Best month for the saved shortlist"
          description="This layer keeps personal planning close to the saved workspace, so you can rank destinations by seasonality profile, selected month, and live risk without leaving the desk."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:w-[640px]">
          <SelectField
            value={profileId}
            onChange={(event) => onProfileChange(event.target.value)}
            aria-label="Select saved shortlist travel profile"
            options={TRAVEL_PROFILE_OPTIONS}
          />
          <SelectField
            value={mode}
            onChange={(event) => onModeChange(event.target.value)}
            aria-label="Select saved shortlist ranking mode"
            options={planningModeOptions}
          />
          <SelectField
            value={String(selectedMonth)}
            onChange={(event) => onSelectedMonthChange(Number(event.target.value))}
            aria-label="Select saved shortlist month"
            options={monthOptions}
          />
          <SelectField
            value={String(windowSize)}
            onChange={(event) => onWindowSizeChange(Number(event.target.value))}
            aria-label="Select saved shortlist window size"
            options={windowSizeOptions}
          />
        </div>
      </div>

      {activeJourney ? (
        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Active journey scope
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {activeJourney.name}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                Save the current planning controls into this journey or load the
                stored journey profile back into the desk.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {activeJourney.planningPreferences ? (
                <Button variant="secondary" onClick={onLoadJourneyProfile}>
                  Load journey profile
                </Button>
              ) : null}
              <Button onClick={onSaveJourneyProfile}>Save current plan</Button>
            </div>
          </div>
        </div>
      ) : null}

      {!entries.length ? (
        <div className="mt-8">
          <EmptyState
            title="No saved destinations in this filtered scope."
            description="Adjust the saved filters or add more destinations to generate a shortlist planning board."
          />
        </div>
      ) : (
        <>
          <div
            className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4"
            role="status"
            aria-live="polite"
          >
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
                Best month overall
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {summary.bestMonthOverall?.fullLabel || "Unavailable"}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {summary.bestMonthOverall?.averageScore != null
                  ? `${summary.bestMonthOverall.averageScore}/100 average across the filtered shortlist.`
                  : "Monthly aggregate scores are still forming."}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Quietest live overlay
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {summary.quietestEntry?.place || "Unavailable"}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {summary.quietestEntry?.riskSnapshot
                  ? `${summary.quietestEntry.riskSnapshot.band} / ${summary.quietestEntry.riskSnapshot.openCount} active events`
                  : "Risk overlay is still syncing."}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Shortlist average
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {formatScore(summary.averageScore)}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {summary.comparableCount} comparable destinations /{" "}
                {summary.activeRiskCount} active event signals tracked.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <CompareSeasonalityScoreChart
              data={chartData}
              destinations={entries.map((entry) => ({
                chartKey: entry.chartKey,
                color: entry.color,
              }))}
            />
          </div>

          <div className="mt-8">
            <TravelSignalMapPanel
              title="Shortlist geography"
              description="Project the saved shortlist into a live spatial field so travel-window strength and risk friction can be read geographically, not just in cards."
              entries={entries}
              selectedMonth={selectedMonth}
              scopeLabel={activeJourney?.name || "saved shortlist"}
              supportingLabel={`${activeProfileLabel} / ${
                mode === "best-window"
                  ? `${windowSize}-month ranking window`
                  : `${monthOptions.find((option) => option.value === String(selectedMonth))?.label || "Selected month"} focus`
              }`}
            />
          </div>

          <div className="mt-8 space-y-4">
            {entries.map((entry, index) => {
              const RiskIcon = getRiskIcon(entry.riskSnapshot?.band);

              return (
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
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {entry.journeyName || "Unassigned"} / Saved {entry.savedAtLabel}
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
                      <Link
                        to={`/destination/${entry.countryCode}?place=${encodeURIComponent(
                          entry.place,
                        )}&lat=${entry.lat}&lng=${entry.lng}&slug=${slugify(entry.place)}`}
                      >
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
                      <div className="flex items-center gap-3 text-neon">
                        <CalendarRange size={18} />
                        <span className="text-sm text-slate-400">Top month</span>
                      </div>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {entry.topMonth?.label || "Unavailable"}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                      <div className="flex items-center gap-3 text-aurora">
                        <RiskIcon size={18} />
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
                    {entry.monthData?.band ? (
                      <Badge className="border-white/10 bg-black/10 normal-case tracking-normal text-white">
                        {entry.monthData.band}
                      </Badge>
                    ) : null}
                    {(entry.tags ?? []).map((tag) => (
                      <Badge
                        key={`${entry.countryCode}-${entry.place}-${tag}`}
                        className="border-neon/20 bg-neon/10 normal-case tracking-normal text-neon"
                      >
                        {tag}
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
                      Syncing the live risk overlay for this saved destination.
                    </p>
                  ) : isRiskError ? (
                    <p className="mt-4 text-sm leading-7 text-slate-400">
                      {riskErrorMessage || "The live risk overlay is unavailable right now."}
                    </p>
                  ) : null}

                  {entry.note ? (
                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      Note: {entry.note}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      )}
    </ShellCard>
  );
}
