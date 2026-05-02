import { Search } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";

export function PlannerCandidateBoard({
  candidates,
  selectedDestinations,
  onToggleDestination,
}) {
  if (!candidates.length) {
    return (
      <ShellCard>
        <SectionHeading
          eyebrow="Candidates"
          title="Destination pool"
          description="Your search returned no destinations with usable coordinates."
        />
        <div className="mt-8">
          <EmptyState
            title="No matching destinations."
            description="Try a broader search, or seed the planner from saved and compare destinations."
          />
        </div>
      </ShellCard>
    );
  }

  return (
    <ShellCard>
      <SectionHeading
        eyebrow="Candidates"
        title="Destination pool"
        description="This pool blends saved items, compare items, and the wider atlas so planning starts from real options."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {candidates.map((candidate) => {
          const isSelected = selectedDestinations.some(
            (item) =>
              item.countryCode === candidate.countryCode && item.place === candidate.place,
          );

          return (
            <div
              key={candidate.id}
              className={`rounded-[28px] border p-5 transition ${
                isSelected
                  ? "border-neon/25 bg-neon/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  {candidate.flag ? (
                    <img
                      src={candidate.flag}
                      alt={candidate.countryName}
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/10 text-slate-400">
                      <Search size={16} />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{candidate.place}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {candidate.countryName} / {candidate.region}
                    </p>
                  </div>
                </div>
                <Badge className="border-white/10 bg-black/10 normal-case tracking-normal text-white">
                  {candidate.source}
                </Badge>
              </div>

              <div className="mt-5">
                <Button
                  type="button"
                  variant={isSelected ? "brand" : "secondary"}
                  className="w-full"
                  onClick={() => onToggleDestination(candidate)}
                >
                  {isSelected ? "Remove from plan" : "Add to plan"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ShellCard>
  );
}
