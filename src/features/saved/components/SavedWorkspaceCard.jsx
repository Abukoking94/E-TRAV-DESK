import { useEffect, useMemo, useState } from "react";
import { Pin, Plus, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { SelectField } from "../../../components/ui/SelectField";
import { ShellCard } from "../../../components/ui/ShellCard";
import { Textarea } from "../../../components/ui/Textarea";
import {
  formatNumber,
  formatPercent,
  formatTemp,
  formatWind,
  slugify,
} from "../../../lib/formatters";
import { useAppStore } from "../../../store/useAppStore";

export function SavedWorkspaceCard({ destination, journeys }) {
  const navigate = useNavigate();
  const [noteDraft, setNoteDraft] = useState(destination.note || "");
  const [tagValue, setTagValue] = useState("");

  const toggleSavedDestination = useAppStore(
    (state) => state.toggleSavedDestination,
  );
  const toggleCompareDestination = useAppStore(
    (state) => state.toggleCompareDestination,
  );
  const togglePinnedDestination = useAppStore(
    (state) => state.togglePinnedDestination,
  );
  const setSavedDestinationNote = useAppStore(
    (state) => state.setSavedDestinationNote,
  );
  const addSavedDestinationTag = useAppStore(
    (state) => state.addSavedDestinationTag,
  );
  const removeSavedDestinationTag = useAppStore(
    (state) => state.removeSavedDestinationTag,
  );
  const assignDestinationToJourney = useAppStore(
    (state) => state.assignDestinationToJourney,
  );
  const compareDestinations = useAppStore((state) => state.compareDestinations);

  useEffect(() => {
    setNoteDraft(destination.note || "");
  }, [destination.note]);

  const isCompared = compareDestinations.some(
    (item) =>
      item.countryCode === destination.countryCode && item.place === destination.place,
  );

  const href = `/destination/${destination.countryCode}?place=${encodeURIComponent(
    destination.place,
  )}&lat=${destination.lat}&lng=${destination.lng}&slug=${slugify(
    destination.place,
  )}`;

  const journeyOptions = useMemo(
    () => [
      { value: "", label: "Unassigned journey" },
      ...journeys.map((journey) => ({
        value: journey.id,
        label: journey.name,
      })),
    ],
    [journeys],
  );

  const baseDestination = {
    countryCode: destination.countryCode,
    country: destination.countryName,
    place: destination.place,
    lat: destination.lat,
    lng: destination.lng,
    flag: destination.flag,
  };

  const handleTagSubmit = (event) => {
    event.preventDefault();
    addSavedDestinationTag(baseDestination, tagValue);
    setTagValue("");
  };

  return (
    <ShellCard className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {destination.flag ? (
            <img
              src={destination.flag}
              alt={destination.countryName}
              loading="lazy"
              decoding="async"
              className="h-14 w-14 rounded-[20px] object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-[20px] bg-white/5" />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-2xl font-semibold text-white">{destination.place}</p>
              {destination.pinned ? (
                <Badge className="border-neon/20 bg-neon/10 text-neon">Pinned</Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {destination.countryName} | {destination.region}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
              Saved {destination.savedAtLabel}
            </p>
          </div>
        </div>
        {destination.temperature != null ? (
          <div className="text-right">
            <p className="text-sm text-slate-500">{destination.weatherLabel}</p>
            <p className="mt-1 text-xl font-semibold text-neon">
              {formatTemp(destination.temperature)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-slate-500">Population</p>
          <p className="mt-2 font-semibold text-white">
            {formatNumber(destination.population)}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-slate-500">Rain chance</p>
          <p className="mt-2 font-semibold text-white">
            {formatPercent(destination.rainChance)}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-slate-500">Wind</p>
          <p className="mt-2 font-semibold text-white">
            {formatWind(destination.windSpeed)}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-slate-500">Capital</p>
          <p className="mt-2 font-semibold text-white">
            {destination.capital || destination.place}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Local note
          </p>
          <div className="mt-3">
            <Textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              onBlur={() => setSavedDestinationNote(baseDestination, noteDraft)}
              placeholder="Capture why this destination matters, what to compare later, or what to research next."
              aria-label={`Local note for ${destination.place}`}
            />
          </div>

          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Tags
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(destination.tags ?? []).length ? (
                destination.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeSavedDestinationTag(baseDestination, tag)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    {tag}
                    <X size={12} />
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Add a few lightweight tags to make the workspace more searchable.
                </p>
              )}
            </div>

            <form onSubmit={handleTagSubmit} className="mt-3 flex gap-3">
              <Input
                value={tagValue}
                onChange={(event) => setTagValue(event.target.value)}
                placeholder="Add a tag like beach, visa, calm"
                aria-label={`Add a tag for ${destination.place}`}
              />
              <Button type="submit">
                <Plus size={16} />
                Add
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Assign to journey
            </p>
            <div className="mt-3">
              <SelectField
                value={destination.journeyId || ""}
                onChange={(event) =>
                  assignDestinationToJourney(baseDestination, event.target.value)
                }
                aria-label={`Assign ${destination.place} to a journey`}
                options={journeyOptions}
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Desk actions
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => navigate(href)}>Open destination</Button>
              <Button
                variant={isCompared ? "primary" : "secondary"}
                onClick={() =>
                  toggleCompareDestination({
                    countryCode: destination.countryCode,
                    country: destination.countryName,
                    place: destination.place,
                    lat: destination.lat,
                    lng: destination.lng,
                    flag: destination.flag,
                  })
                }
              >
                <Plus size={16} />
                {isCompared ? "Compared" : "Compare"}
              </Button>
              <Button
                variant={destination.pinned ? "primary" : "secondary"}
                onClick={() => togglePinnedDestination(baseDestination)}
              >
                <Pin size={16} />
                {destination.pinned ? "Pinned" : "Pin"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => toggleSavedDestination(baseDestination)}
              >
                <Trash2 size={16} />
                Remove
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ShellCard>
  );
}
