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

export function CompareRiskBoard({
  entries,
  isLoading,
  isError,
  errorMessage,
}) {
  if (isLoading) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Live risk"
          title="Board-wide event watch"
          description="Loading nearby event risk for the compared destinations."
        />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-24" />
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
          title="Board-wide event watch"
          description="The live event overlay is unavailable right now."
        />
        <div className="mt-8">
          <ErrorState description={errorMessage || "Risk layer unavailable."} />
        </div>
      </ShellCard>
    );
  }

  if (!entries.length) {
    return null;
  }

  return (
    <ShellCard>
      <SectionHeading
        eyebrow="Live risk"
        title="Board-wide event watch"
        description="These signals are not folded into the main travel score. They act as a live operational overlay so the board can still flag short-term friction."
      />

      <div className="mt-8 space-y-4">
        {entries.map((entry) => (
          <div
            key={`${entry.chartKey}-risk`}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{entry.place}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {entry.riskSnapshot?.headline || "Risk feed unavailable"}
                </p>
              </div>
              <Badge className={`normal-case tracking-normal ${getBandClasses(entry.riskSnapshot?.band)}`}>
                {entry.riskSnapshot?.band || "Unavailable"}
              </Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="border-white/10 bg-black/10 normal-case tracking-normal text-white">
                {entry.riskSnapshot?.openCount ?? 0} active events
              </Badge>
              <Badge className="border-white/10 bg-black/10 normal-case tracking-normal text-white">
                {entry.riskSnapshot?.topCategory || "No dominant category"}
              </Badge>
              <Badge className="border-white/10 bg-black/10 normal-case tracking-normal text-white">
                Latest {entry.riskSnapshot?.latestEventLabel || "Unavailable"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </ShellCard>
  );
}
