import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { formatNumber } from "../../../lib/formatters";

export function RegionSpotlights({ items }) {
  return (
    <div>
      <SectionHeading
        eyebrow="Spotlights"
        title="Editorial anchors inside the region"
        description="These spotlights bring a more magazine-like layer into the route using live public summaries instead of mock editorial copy."
      />
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        {items.map((item) => (
          <ShellCard key={item.id} className="h-full">
            <div className="flex items-center gap-4">
              {item.flag ? (
                <img
                  src={item.flag}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-14 rounded-[20px] object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-[20px] bg-white/5" />
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neon">
                  {item.region}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{item.title}</h3>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-400">{item.summary}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-500">Capital</p>
                <p className="mt-2 font-semibold text-white">{item.capital}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-500">Population</p>
                <p className="mt-2 font-semibold text-white">
                  {formatNumber(item.population)}
                </p>
              </div>
            </div>
          </ShellCard>
        ))}
      </div>
    </div>
  );
}
