import { SectionHeading } from "../../../components/ui/SectionHeading";
import { DestinationCard } from "../../../components/cards/DestinationCard";
import { Reveal } from "../../../components/ui/Reveal";

export function TrendingSection({ destinations }) {
  return (
    <section className="section-space pt-0">
      <div className="page-shell">
        <Reveal>
          <SectionHeading
            eyebrow="Trending"
            title="Population-scale destinations with the strongest discovery pull."
            description="These spotlight entries are derived from live country data, giving the homepage a real intelligence backbone from day one."
          />
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {destinations.map((destination, index) => (
            <Reveal key={destination.id} delay={index * 0.08}>
              <DestinationCard destination={destination} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
