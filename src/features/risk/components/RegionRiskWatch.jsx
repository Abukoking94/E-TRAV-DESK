import { Badge } from "../../../components/ui/Badge";
import { ErrorState } from "../../../components/ui/ErrorState";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { Skeleton } from "../../../components/ui/Skeleton";

function getBandClasses(band) {
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

export function RegionRiskWatch({
  riskSnapshot,
  isLoading,
  isError,
  errorMessage,
}) {
  if (isLoading) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Risk watch"
          title="Regional live-event signal"
          description="Checking the region-wide risk overlay."
        />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-24" />
        </div>
      </ShellCard>
    );
  }

  if (isError) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Risk watch"
          title="Regional live-event signal"
          description="The regional risk watch could not be loaded right now."
        />
        <div className="mt-8">
          <ErrorState description={errorMessage || "Risk watch unavailable."} />
        </div>
      </ShellCard>
    );
  }

  if (!riskSnapshot) {
    return null;
  }

  return (
    <ShellCard>
      <SectionHeading
        eyebrow="Risk watch"
        title="Regional live-event signal"
        description="This is a wide-area event overlay from NASA EONET, intended to show current disruption signals around the region rather than replace the climate layer."
      />

      <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">
              {riskSnapshot.headline}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              {riskSnapshot.tone} over the last {riskSnapshot.days} days across the wider regional field.
            </p>
          </div>
          <Badge className={`normal-case tracking-normal ${getBandClasses(riskSnapshot.band)}`}>
            {riskSnapshot.band}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Active events
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {riskSnapshot.openCount}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Top category
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              {riskSnapshot.topCategory || "None"}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Latest event
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              {riskSnapshot.latestEventLabel}
            </p>
          </div>
        </div>
      </div>
    </ShellCard>
  );
}
