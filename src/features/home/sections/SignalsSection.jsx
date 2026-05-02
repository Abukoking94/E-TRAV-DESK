import { Languages, Network, Orbit, Users2 } from "lucide-react";
import { MetricCard } from "../../../components/ui/MetricCard";
import { Reveal } from "../../../components/ui/Reveal";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { formatNumber } from "../../../lib/formatters";

export function SignalsSection({ metrics }) {
  const cards = [
    {
      label: "Indexed countries",
      value: formatNumber(metrics.countryCount),
      description:
        "A live country base from REST Countries gives the product its global structure from the start.",
      icon: Orbit,
      accent: "neon",
    },
    {
      label: "Population scope",
      value: formatNumber(metrics.totalPopulation),
      description:
        "The desk already spans a massive global population footprint through real country records.",
      icon: Users2,
      accent: "aurora",
    },
    {
      label: "Languages represented",
      value: formatNumber(metrics.languageCount),
      description:
        "Language diversity becomes a real exploration signal for destinations, not just a metadata field.",
      icon: Languages,
      accent: "slate",
    },
    {
      label: "Border connections",
      value: formatNumber(metrics.borderLinkCount),
      description:
        "Cross-border links create room for route thinking, neighboring-country discovery, and regional journeys.",
      icon: Network,
      accent: "coral",
    },
  ];

  return (
    <section className="section-space pt-0">
      <div className="page-shell">
        <Reveal>
          <SectionHeading
            eyebrow="Signals"
            title="Live operating signals for the desk."
            description="These are not placeholder marketing stats. They are derived from the real indexed country dataset already powering the app."
          />
        </Reveal>
        <div className="mt-10 grid gap-6 xl:grid-cols-4">
          {cards.map((card, index) => (
            <Reveal key={card.label} delay={index * 0.08}>
              <MetricCard {...card} />
            </Reveal>
          ))}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Reveal delay={0.12}>
            <ShellCard className="h-full">
              <p className="eyebrow-label">Dominant regional cluster</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">
                {metrics.leadingRegion?.label || "Unavailable"}
              </h3>
              <p className="mt-4 section-intro">
                {formatNumber(metrics.leadingRegion?.count || 0)} indexed
                countries, representing about {metrics.leadingRegion?.share || 0}%
                of the desk&apos;s current regional inventory.
              </p>
            </ShellCard>
          </Reveal>
          <Reveal delay={0.2}>
            <ShellCard className="h-full">
              <p className="eyebrow-label">Most connected country node</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">
                {metrics.mostConnectedCountry?.name.common || "Unavailable"}
              </h3>
              <p className="mt-4 section-intro">
                {formatNumber(metrics.mostConnectedCountry?.borders?.length || 0)}{" "}
                direct border connections make it a strong candidate for route-led
                regional exploration and future neighboring-country experiences.
              </p>
            </ShellCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

