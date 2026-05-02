import { Clock3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { ShellCard } from "../../../components/ui/ShellCard";
import { slugify } from "../../../lib/formatters";

export function RecentDestinationsPanel({
  recentDestinations,
  onRemoveRecent,
  onClearRecent,
}) {
  const navigate = useNavigate();

  return (
    <ShellCard className="h-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-aurora">
            <Clock3 size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Recent activity</p>
            <p className="text-sm text-slate-500">
              The desk now remembers what you opened recently.
            </p>
          </div>
        </div>
        {recentDestinations.length ? (
          <Button variant="ghost" onClick={onClearRecent}>
            Clear
          </Button>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
        {recentDestinations.length ? (
          recentDestinations.map((destination) => {
            const href = `/destination/${destination.countryCode}?place=${encodeURIComponent(
              destination.place,
            )}&lat=${destination.lat}&lng=${destination.lng}&slug=${slugify(
              destination.place,
            )}`;

            return (
              <div
                key={destination.id}
                className="rounded-[28px] border border-white/10 bg-white/5 p-5"
              >
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
                      <p className="font-semibold text-white">{destination.place}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {destination.countryName} | {destination.region}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {destination.viewedAtLabel}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => onRemoveRecent(destination)}
                    aria-label={`Remove ${destination.place} from recent activity`}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => navigate(href)}>
                    Reopen
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm leading-7 text-slate-400">
              Open a few destination pages and they will start appearing here as a
              reusable memory rail.
            </p>
          </div>
        )}
      </div>
    </ShellCard>
  );
}
