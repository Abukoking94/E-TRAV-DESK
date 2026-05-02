import { Compass, Sparkles, TimerReset } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { ErrorState } from "../../../components/ui/ErrorState";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { Skeleton } from "../../../components/ui/Skeleton";

function formatScore(score) {
  return score == null ? "N/A" : `${Math.round(score)} / 100`;
}

export function DestinationTravelWindowsPanel({
  travelWindowPlan,
  isLoading,
  isError,
  errorMessage,
}) {
  if (isLoading) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Travel windows"
          title="Planning-grade recommendations"
          description="Ranking the cleanest one-to-three month windows from the historical profile."
        />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-36" />
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
          eyebrow="Travel windows"
          title="Planning-grade recommendations"
          description="The ranking layer could not be generated right now."
        />
        <div className="mt-8">
          <ErrorState description={errorMessage || "Travel window recommendations unavailable."} />
        </div>
      </ShellCard>
    );
  }

  if (!travelWindowPlan) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Travel windows"
          title="Planning-grade recommendations"
          description="Travel window recommendations will appear here once the historical profile loads."
        />
      </ShellCard>
    );
  }

  const recommendedWindow = travelWindowPlan.recommendedWindow;

  return (
    <ShellCard>
      <SectionHeading
        eyebrow="Travel windows"
        title="Planning-grade recommendations"
        description="This panel turns the month scores into ranked travel windows for the selected planning profile."
      />

      <div className="mt-8 rounded-[28px] border border-neon/15 bg-neon/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neon">
              Recommended
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {recommendedWindow?.label || "Unavailable"}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Under the {travelWindowPlan.profile.label.toLowerCase()} lens, this is the strongest current planning window for the destination.
            </p>
          </div>
          <Badge className="border-neon/20 bg-white/10 normal-case tracking-normal text-white">
            {formatScore(recommendedWindow?.score)}
          </Badge>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3 text-neon">
            <Sparkles size={18} />
            <span className="font-medium text-white">Season summary</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Prime months
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {travelWindowPlan.overview.primeMonths}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Strong months
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {travelWindowPlan.overview.strongMonths}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Mixed months
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {travelWindowPlan.overview.mixedMonths}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Avoid months
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {travelWindowPlan.overview.avoidMonths}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3 text-aurora">
            <TimerReset size={18} />
            <span className="font-medium text-white">Profile average</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">
            {formatScore(travelWindowPlan.scoreAverage)}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            This gives the destination’s overall seasonal fit for the selected travel style, not just its strongest moment.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {travelWindowPlan.rankedWindows.map((window, index) => (
          <div
            key={`${window.id}-${index}`}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-neon">
                  <Compass size={16} />
                  <span className="text-xs uppercase tracking-[0.2em]">
                    Window {index + 1}
                  </span>
                </div>
                <h4 className="mt-3 text-xl font-semibold text-white">
                  {window.label}
                </h4>
                <p className="mt-2 text-sm text-slate-400">
                  {window.band} read for {travelWindowPlan.profile.label.toLowerCase()} travel.
                </p>
              </div>
              <Badge className="border-white/10 bg-black/10 normal-case tracking-normal text-white">
                {formatScore(window.score)}
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {window.strengths.map((strength) => (
                <Badge
                  key={`${window.id}-${strength}`}
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
