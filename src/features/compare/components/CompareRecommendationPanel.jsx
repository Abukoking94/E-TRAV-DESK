import { Award } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { ShellCard } from "../../../components/ui/ShellCard";

export function CompareRecommendationPanel({ recommendations }) {
  return (
    <ShellCard className="h-full">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-neon/20 bg-neon/10 p-3 text-neon">
          <Award size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Recommendation layer</p>
          <p className="text-sm text-slate-500">
            Cross-board calls built from the live climate and air-quality signals.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.label}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {recommendation.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {recommendation.winner?.place || "Unavailable"}
                </p>
              </div>
              <Badge className="border-neon/20 bg-neon/10 text-neon">
                {recommendation.stat}
              </Badge>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              {recommendation.description}
            </p>
          </div>
        ))}
      </div>
    </ShellCard>
  );
}
