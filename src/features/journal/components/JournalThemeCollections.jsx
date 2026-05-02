import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { formatNumber, formatPercent, formatTemp, slugify } from "../../../lib/formatters";

function formatThemeMetric(theme, item) {
  if (theme.metric === "temp") {
    return formatTemp(item.currentTemp);
  }

  if (theme.metric === "percent") {
    return formatPercent(item.rainChance);
  }

  if (theme.metric === "population") {
    return formatNumber(item.population);
  }

  return `${item.borderCount ?? 0} borders`;
}

export function JournalThemeCollections({ themes }) {
  const navigate = useNavigate();

  return (
    <div>
      <SectionHeading
        eyebrow="Themes"
        title="Live editorial lenses"
        description="Each theme is derived from the public dataset and live weather sample, so the journal can rotate perspectives without relying on mock content."
      />
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {themes.map((theme) => (
          <ShellCard key={theme.id} className="h-full">
            <p className="text-xs uppercase tracking-[0.18em] text-neon">
              {theme.label}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              {theme.description}
            </p>
            <div className="mt-6 space-y-4">
              {theme.items.map((item) => (
                <div
                  key={`${theme.id}-${item.id}`}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {item.countryName}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.place} | {item.region}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neon">
                      {formatThemeMetric(theme, item)}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        navigate(
                          `/destination/${item.countryCode}?place=${encodeURIComponent(
                            item.place,
                          )}&lat=${item.lat}&lng=${item.lng}&slug=${slugify(
                            item.place,
                          )}`,
                        )
                      }
                    >
                      Open destination
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ShellCard>
        ))}
      </div>
    </div>
  );
}
