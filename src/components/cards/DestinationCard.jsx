import { Plus, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { ShellCard } from "../ui/ShellCard";
import { formatNumber, formatTemp, slugify } from "../../lib/formatters";
import { useAppStore } from "../../store/useAppStore";

export function DestinationCard({ destination, showActions = true }) {
  const navigate = useNavigate();
  const toggleSavedDestination = useAppStore(
    (state) => state.toggleSavedDestination,
  );
  const toggleCompareDestination = useAppStore(
    (state) => state.toggleCompareDestination,
  );
  const savedDestinations = useAppStore((state) => state.savedDestinations);
  const compareDestinations = useAppStore((state) => state.compareDestinations);

  const isSaved = savedDestinations.some(
    (item) =>
      item.countryCode === destination.countryCode && item.place === destination.place,
  );
  const isCompared = compareDestinations.some(
    (item) =>
      item.countryCode === destination.countryCode && item.place === destination.place,
  );

  const href = `/destination/${destination.countryCode}?place=${encodeURIComponent(
    destination.place,
  )}&lat=${destination.lat}&lng=${destination.lng}&slug=${slugify(
    destination.place,
  )}`;

  return (
    <ShellCard className="overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {destination.flag ? (
            <img
              src={destination.flag}
              alt={destination.countryName}
              loading="lazy"
              decoding="async"
              className="h-12 w-12 rounded-2xl object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-2xl bg-white/5" />
          )}
          <div>
            <p className="text-lg font-semibold text-white">{destination.place}</p>
            <p className="text-sm text-slate-400">
              {destination.countryName} · {destination.region}
            </p>
          </div>
        </div>
        {destination.temperature != null ? (
          <p className="text-lg font-semibold text-neon">
            {formatTemp(destination.temperature)}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-slate-500">Population</p>
          <p className="mt-2 font-semibold text-white">
            {formatNumber(destination.population)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-slate-500">Capital</p>
          <p className="mt-2 font-semibold text-white">
            {destination.capital || destination.place}
          </p>
        </div>
      </div>

      <p className="mt-5 max-h-[84px] overflow-hidden text-sm leading-7 text-slate-400">
        {destination.summary}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => navigate(href)}>Open destination</Button>
        {showActions ? (
          <>
            <Button
              variant={isSaved ? "primary" : "secondary"}
              onClick={() =>
                toggleSavedDestination({
                  countryCode: destination.countryCode,
                  country: destination.countryName,
                  place: destination.place,
                  lat: destination.lat,
                  lng: destination.lng,
                  flag: destination.flag,
                })
              }
            >
              <Star size={16} />
              {isSaved ? "Saved" : "Save"}
            </Button>
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
          </>
        ) : null}
      </div>
    </ShellCard>
  );
}
