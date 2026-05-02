import { Clock3, FolderOpen, Pin, Star } from "lucide-react";
import { MetricCard } from "../../../components/ui/MetricCard";

export function SavedOverview({
  savedCount,
  pinnedCount,
  journeyCount,
  recentCount,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Saved destinations"
        value={savedCount}
        description="Your persistent shortlist of destinations worth tracking across the product."
        icon={Star}
        accent="neon"
      />
      <MetricCard
        label="Pinned board"
        value={pinnedCount}
        description="Pinned places stay at the top so the desk reflects current planning priorities."
        icon={Pin}
        accent="aurora"
      />
      <MetricCard
        label="Journeys"
        value={journeyCount}
        description="Collections group places into planning tracks like warm-weather, visa research, or shortlist."
        icon={FolderOpen}
        accent="coral"
      />
      <MetricCard
        label="Recent views"
        value={recentCount}
        description="Recently opened destinations become a memory layer instead of disappearing after navigation."
        icon={Clock3}
        accent="slate"
      />
    </div>
  );
}
