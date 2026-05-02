import { BookmarkCheck, CloudSun, Radar } from "lucide-react";
import { Reveal } from "../../../components/ui/Reveal";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";

const pillars = [
  {
    icon: CloudSun,
    eyebrow: "Climate layer",
    title: "Forecast, air quality, and marine signals in one view.",
    description:
      "Every destination can grow into a weather-aware intelligence page instead of a flat travel card.",
  },
  {
    icon: Radar,
    eyebrow: "Country context",
    title: "Blend population, region, language, and editorial context.",
    description:
      "The desk is designed to merge raw public APIs into a cleaner product model with richer travel meaning.",
  },
  {
    icon: BookmarkCheck,
    eyebrow: "Personal workspace",
    title: "Save, compare, and revisit destinations like a real product.",
    description:
      "E-Trav Desk is built to evolve from discovery into a persistent workspace with user memory and intelligent workflows.",
  },
];

export function MissionSection() {
  return (
    <section className="section-space pt-0">
      <div className="page-shell">
        <Reveal>
          <SectionHeading
            eyebrow="Foundation"
            title="A travel product architecture, not just a landing page."
            description="This first phase turns the project into a clearer product system by defining the visual language, the operating model, and the premium surfaces the rest of the app will grow into."
          />
        </Reveal>
        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;

            return (
              <Reveal key={pillar.title} delay={index * 0.08}>
                <ShellCard className="h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neon/20 bg-neon/10 text-neon">
                    <Icon size={20} />
                  </div>
                  <p className="mt-6 text-xs uppercase tracking-[0.22em] text-slate-500">
                    {pillar.eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {pillar.description}
                  </p>
                </ShellCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

