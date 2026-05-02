import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { formatNumber, formatPercent, formatTemp } from "../../../lib/formatters";

function formatCollectionValue(item) {
  if (item.kind === "temp") {
    return formatTemp(item.value);
  }

  if (item.kind === "percent") {
    return formatPercent(item.value);
  }

  return formatNumber(item.value);
}

export function RegionCollections({ collections }) {
  return (
    <div>
      <SectionHeading
        eyebrow="Collections"
        title="Curated region lenses"
        description="These collection panels help the route feel intentionally editorial while still being driven by live and public data."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        {collections.map((collection) => (
          <ShellCard key={collection.id} className="h-full">
            <p className="text-xs uppercase tracking-[0.18em] text-neon">
              {collection.label}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              {collection.description}
            </p>

            <div className="mt-6 space-y-4">
              {collection.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
                    </div>
                    <p className="text-sm font-semibold text-neon">
                      {formatCollectionValue(item)}
                    </p>
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
