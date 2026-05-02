import { ArrowRight, LayoutPanelTop, Radar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Reveal } from "../../../components/ui/Reveal";
import { formatNumber } from "../../../lib/formatters";

export function LaunchSection({ metrics }) {
  const navigate = useNavigate();

  return (
    <section className="section-space pt-0">
      <div className="page-shell">
        <Reveal>
          <div className="surface-panel relative overflow-hidden p-8 sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neon/10 via-transparent to-aurora/10" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="eyebrow-label">Next build surface</p>
                <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold text-white sm:text-5xl">
                  The foundation is live. Next we deepen the explorer, destination,
                  and compare workflows.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                  E-Trav Desk is already indexing {formatNumber(metrics.countryCount)}{" "}
                  countries across {formatNumber(metrics.regionCount)} regions and{" "}
                  {formatNumber(metrics.languageCount)} represented languages. The
                  next phases build real intelligence on top of that footprint.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button variant="brand" onClick={() => navigate("/explore")}>
                    Open the explorer
                    <ArrowRight size={18} />
                  </Button>
                  <Button variant="quiet" onClick={() => navigate("/compare")}>
                    Enter compare mode
                    <LayoutPanelTop size={18} />
                  </Button>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="rounded-[28px] border border-white/10 bg-atlas-950/55 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon/20 bg-neon/10 text-neon">
                      <Radar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Leading region</p>
                      <p className="text-sm text-slate-400">
                        {metrics.leadingRegion?.label || "Unavailable"} with{" "}
                        {formatNumber(metrics.leadingRegion?.count || 0)} active
                        countries
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-atlas-950/55 p-5">
                  <p className="eyebrow-label">Largest spotlight destination</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {metrics.biggestDestination?.countryName || "Unavailable"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Featured as the current scale anchor for the home experience
                    and ready to deepen into a richer destination intelligence page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
