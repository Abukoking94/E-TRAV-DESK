import { Plus, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ShellCard } from "../../../components/ui/ShellCard";
import {
  formatNumber,
  formatPercent,
  formatTemp,
  formatWind,
  slugify,
} from "../../../lib/formatters";
import { useAppStore } from "../../../store/useAppStore";

export function CompareDestinationGrid({ destinations }) {
  const navigate = useNavigate();
  const toggleSavedDestination = useAppStore(
    (state) => state.toggleSavedDestination,
  );
  const toggleCompareDestination = useAppStore(
    (state) => state.toggleCompareDestination,
  );
  const savedDestinations = useAppStore((state) => state.savedDestinations);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {destinations.map((destination) => {
        const isSaved = savedDestinations.some(
          (item) =>
            item.countryCode === destination.countryCode &&
            item.place === destination.place,
        );

        const href = `/destination/${destination.countryCode}?place=${encodeURIComponent(
          destination.place,
        )}&lat=${destination.lat}&lng=${destination.lng}&slug=${slugify(
          destination.place,
        )}`;

        return (
          <ShellCard key={destination.chartKey} className="overflow-hidden p-0">
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: destination.color }}
            />
            <div className="p-6">
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
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {destination.region}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {destination.place}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {destination.countryName}
                    </p>
                  </div>
                </div>
                <Badge className="border-white/10 bg-white/5 text-slate-200">
                  {destination.travelIndex}/100
                </Badge>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-400">
                {destination.readiness}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Current</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatTemp(destination.currentTemp)}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Air read</p>
                  <p className="mt-2 font-semibold text-white">
                    {destination.aqiSummary.label}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Wind</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatWind(destination.windSpeed)}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Rain chance</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatPercent(destination.rainChance)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Badge className="border-neon/20 bg-neon/10 text-neon">
                  {destination.weatherLabel}
                </Badge>
                {destination.timezone ? (
                  <Badge className="normal-case tracking-normal text-slate-200">
                    {destination.timezone}
                  </Badge>
                ) : null}
                {destination.subregion ? (
                  <Badge className="normal-case tracking-normal text-slate-200">
                    {destination.subregion}
                  </Badge>
                ) : null}
              </div>

              <div className="mt-5 grid gap-3 text-sm text-slate-400">
                <p>
                  Population:{" "}
                  <span className="text-white">
                    {formatNumber(destination.population)}
                  </span>
                </p>
                <p>
                  Languages:{" "}
                  <span className="text-white">
                    {destination.languages.join(", ") || "Unavailable"}
                  </span>
                </p>
                <p>
                  Currency:{" "}
                  <span className="text-white">
                    {destination.currencies.join(", ") || "Unavailable"}
                  </span>
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => navigate(href)}>Open destination</Button>
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
                  variant="secondary"
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
                  Remove
                </Button>
              </div>
            </div>
          </ShellCard>
        );
      })}
    </div>
  );
}
