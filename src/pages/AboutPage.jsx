import { SectionHeading } from "../components/ui/SectionHeading";
import { ShellCard } from "../components/ui/ShellCard";
import { siteMeta } from "../lib/site";

export function AboutPage() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionHeading
          eyebrow="About"
          title="A frontend-only product vision built to feel like a serious travel platform."
          description={`${siteMeta.name} is designed to showcase product thinking, state architecture, API orchestration, premium UI, and scalable frontend structure without needing a backend.`}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <ShellCard>
            <h3 className="text-lg font-semibold text-white">Product mindset</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              The layout is wide, modular, and route-based so you can grow from a
              landing page into a real discovery experience.
            </p>
          </ShellCard>
          <ShellCard>
            <h3 className="text-lg font-semibold text-white">Real data only</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              The starter already uses public APIs for countries, weather, air
              quality, marine conditions, geocoding, and destination summaries.
            </p>
          </ShellCard>
          <ShellCard>
            <h3 className="text-lg font-semibold text-white">Built to extend</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Region hubs, compare workflows, editorial stories, saved journeys,
              and search memory are all wired as real expansion points.
            </p>
          </ShellCard>
        </div>
      </div>
    </section>
  );
}
