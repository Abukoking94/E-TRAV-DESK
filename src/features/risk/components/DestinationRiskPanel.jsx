import { ExternalLink, ShieldAlert, ShieldCheck, Siren } from "lucide-react";
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

export function DestinationRiskPanel({
  riskSnapshot,
  isLoading,
  isError,
  errorMessage,
}) {
  if (isLoading) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Live risk"
          title="Nearby event watch"
          description="Checking NASA EONET for active natural-event signals near this destination."
        />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </ShellCard>
    );
  }

  if (isError) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Live risk"
          title="Nearby event watch"
          description="The live risk layer could not be loaded right now."
        />
        <div className="mt-8">
          <ErrorState description={errorMessage || "Live risk feed unavailable."} />
        </div>
      </ShellCard>
    );
  }

  if (!riskSnapshot) {
    return null;
  }

  const Icon =
    riskSnapshot.band === "Quiet"
      ? ShieldCheck
      : riskSnapshot.band === "Elevated"
        ? ShieldAlert
        : Siren;

  return (
    <ShellCard>
      <SectionHeading
        eyebrow="Live risk"
        title="Nearby event watch"
        description="This layer uses NASA EONET to surface active event signals around the destination so the product can reason about short-term regional risk, not just climate comfort."
      />

      <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-3 text-neon">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {riskSnapshot.scopeLabel}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">
                {riskSnapshot.headline}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {riskSnapshot.tone} across the last {riskSnapshot.days} days.
              </p>
            </div>
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
              Latest event date
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              {riskSnapshot.latestEventLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {riskSnapshot.topEvents.length ? (
          riskSnapshot.topEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-[28px] border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    {(event.categories ?? []).map((category) => category.title).join(", ") || "Event"}
                  </p>
                </div>
                <Badge className={`normal-case tracking-normal ${getBandClasses(event.severity >= 32 ? "Active" : "Elevated")}`}>
                  Severity {event.severity}
                </Badge>
              </div>
              {event.description ? (
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {event.description}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span>{event.latestDate ? new Date(event.latestDate).toLocaleDateString("en-US") : "Date unavailable"}</span>
                {event.link ? (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-neon transition hover:text-white"
                  >
                    Source
                    <ExternalLink size={14} />
                  </a>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[28px] border border-emerald-300/20 bg-emerald-500/10 p-5">
            <p className="text-sm leading-7 text-emerald-100">
              No active nearby events were returned for this destination window right now.
            </p>
          </div>
        )}
      </div>
    </ShellCard>
  );
}
