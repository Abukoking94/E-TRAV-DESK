import { Badge } from "../../../components/ui/Badge";
import { ErrorState } from "../../../components/ui/ErrorState";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { Skeleton } from "../../../components/ui/Skeleton";

export function CompareSeasonalityInsights({
  entries,
  recommendations,
  isLoading,
  isError,
  errorMessage,
}) {
  if (isLoading) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Planning read"
          title="Seasonal recommendations"
          description="Loading the recommendation layer for the board."
        />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </ShellCard>
    );
  }

  if (isError) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Planning read"
          title="Seasonal recommendations"
          description="The recommendation layer could not be built right now."
        />
        <div className="mt-8">
          <ErrorState description={errorMessage || "Seasonal planning read unavailable."} />
        </div>
      </ShellCard>
    );
  }

  if (!entries.length) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Planning read"
          title="Seasonal recommendations"
          description="Seasonal recommendations will appear here once destinations are loaded."
        />
      </ShellCard>
    );
  }

  return (
    <ShellCard>
      <SectionHeading
        eyebrow="Planning read"
        title="Seasonal recommendations"
        description="This side panel highlights which destination is leading for the selected month and profile, plus the strongest full-year fit."
      />

      <div className="mt-8 space-y-4">
        {recommendations.map((item) => (
          <div
            key={item.label}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-3 text-xl font-semibold text-white">
                  {item.winner?.place || "Unavailable"}
                </p>
              </div>
              <Badge className="border-neon/20 bg-neon/10 normal-case tracking-normal text-neon">
                {item.stat}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Best windows on the board
        </p>
        <div className="mt-4 space-y-3">
          {entries.map((entry) => (
            <div
              key={`${entry.chartKey}-window`}
              className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/10 px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">{entry.place}</p>
                <p className="text-sm text-slate-400">
                  {entry.recommendedWindow?.label || "Window unavailable"}
                </p>
              </div>
              <Badge className="border-white/10 bg-white/10 normal-case tracking-normal text-white">
                {entry.recommendedWindow?.score != null
                  ? `${Math.round(entry.recommendedWindow.score)} / 100`
                  : "N/A"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </ShellCard>
  );
}
