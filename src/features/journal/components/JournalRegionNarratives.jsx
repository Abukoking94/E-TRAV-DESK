import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { formatNumber } from "../../../lib/formatters";

export function JournalRegionNarratives({ items }) {
  const navigate = useNavigate();

  return (
    <div>
      <SectionHeading
        eyebrow="Regions"
        title="Regional narratives"
        description="This layer keeps the journal connected to the wider atlas by giving each major region a short editorial identity and clear route back into its hub."
      />
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {items.map((item) => (
          <ShellCard key={item.id} className="h-full">
            <p className="text-xs uppercase tracking-[0.18em] text-aurora">
              {item.region}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {item.anchorCountry || item.region}
            </h3>
            <p className="mt-4 text-sm leading-8 text-slate-400">{item.summary}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-slate-500">Countries</p>
                <p className="mt-2 font-semibold text-white">{item.count}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-slate-500">Population</p>
                <p className="mt-2 font-semibold text-white">
                  {formatNumber(item.totalPopulation)}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Button
                variant="secondary"
                onClick={() => navigate(`/regions/${item.region.toLowerCase()}`)}
              >
                Open regional hub
              </Button>
            </div>
          </ShellCard>
        ))}
      </div>
    </div>
  );
}
