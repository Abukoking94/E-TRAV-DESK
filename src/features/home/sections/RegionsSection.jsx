import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "../../../components/ui/Reveal";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { formatNumber } from "../../../lib/formatters";

export function RegionsSection({ regions }) {
  return (
    <section className="section-space pt-0">
      <div className="page-shell">
        <Reveal>
          <SectionHeading
            eyebrow="Regions"
            title="Navigate the atlas through continental hubs."
            description="Each region route can evolve into its own editorial and discovery surface with mood filters, climate layers, and live country rankings."
          />
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {regions.map((region, index) => (
            <Reveal key={region.slug} delay={index * 0.08}>
              <Link
                to={`/regions/${region.slug}`}
                className="surface-panel group block rounded-[28px] p-6 transition hover:border-neon/25"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-2xl text-white">{region.label}</p>
                  <ArrowRight
                    className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-neon"
                    size={18}
                  />
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {formatNumber(region.count)} countries currently indexed with live
                  climate and country metadata.
                </p>
                <div className="soft-divider my-5" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Share of desk</span>
                  <span className="font-medium text-white">{region.share}%</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
