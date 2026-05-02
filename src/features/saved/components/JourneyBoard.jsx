import { useState } from "react";
import { FolderPlus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { ShellCard } from "../../../components/ui/ShellCard";
import { formatSavedPlanningPreferences } from "../saved.utils";

const accentClasses = {
  neon: "border-neon/20 bg-neon/10 text-neon",
  aurora: "border-aurora/20 bg-aurora/10 text-aurora",
  coral: "border-coral/20 bg-coral/10 text-coral",
};

export function JourneyBoard({
  journeys,
  unassignedCount,
  onCreateJourney,
  onDeleteJourney,
  activeJourneyId,
  onSaveJourneyPlanningPreferences,
  onLoadJourneyPlanningPreferences,
}) {
  const [value, setValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreateJourney(value);
    setValue("");
  };

  return (
    <ShellCard className="h-full">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-neon/20 bg-neon/10 p-3 text-neon">
          <FolderPlus size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Journey collections</p>
          <p className="text-sm text-slate-500">
            Create locally persisted planning groups and assign saved destinations to them.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Create a journey, like warm season shortlist"
          aria-label="Create a new journey collection"
        />
        <Button type="submit">Add journey</Button>
      </form>

      <div className="mt-6 space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Unassigned
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{unassignedCount}</p>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Saved destinations waiting to be sorted into a journey collection.
          </p>
        </div>

        {journeys.length ? (
          <div className="grid gap-4">
            {journeys.map((journey) => (
              <div
                key={journey.id}
                className="rounded-[28px] border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div
                      className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${accentClasses[journey.accent]}`}
                    >
                      {journey.name}
                    </div>
                    {journey.id === activeJourneyId ? (
                      <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        Active scope
                      </div>
                    ) : null}
                    <p className="mt-3 text-sm text-slate-300">
                      {journey.count} saved destinations, {journey.pinnedCount} pinned.
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-400">
                      {formatSavedPlanningPreferences(journey.planningPreferences)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {journey.id === activeJourneyId ? (
                      <>
                        {journey.planningPreferences ? (
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={() => onLoadJourneyPlanningPreferences(journey.id)}
                          >
                            Load plan
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          onClick={() => onSaveJourneyPlanningPreferences(journey.id)}
                        >
                          Save plan
                        </Button>
                      </>
                    ) : null}
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => onDeleteJourney(journey.id)}
                    >
                      <Trash2 size={16} />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm leading-7 text-slate-400">
              No journey collections yet. Create one to group destinations by trip idea,
              research stage, or travel mood.
            </p>
          </div>
        )}
      </div>
    </ShellCard>
  );
}
