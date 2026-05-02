import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { formatPercent, formatTemp, slugify } from "../../../lib/formatters";

export function JournalStoryGrid({ stories }) {
  const navigate = useNavigate();

  return (
    <div>
      <SectionHeading
        eyebrow="Stories"
        title="Front-page country stories"
        description="These stories are still live-data driven, but the layout shifts the tone toward editorial reading and destination curiosity."
      />
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        {stories.map((story) => (
          <ShellCard key={story.id} className="h-full overflow-hidden p-0">
            {story.image ? (
              <div className="relative h-48">
                <img
                  src={story.image}
                  alt={story.countryName}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,13,8,0.2),rgba(20,13,8,0.88))]" />
              </div>
            ) : null}

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-neon">
                    {story.region}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">
                    {story.countryName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{story.place}</p>
                </div>
                <ArrowUpRight className="text-slate-500" size={18} />
              </div>

              <p className="mt-5 text-sm leading-8 text-slate-400">
                {story.summary ||
                  `${story.countryName} is active in the journal feed and ready for deeper destination reading.`}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Current temp</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatTemp(story.currentTemp)}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Rain chance</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatPercent(story.rainChance)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() =>
                    navigate(
                      `/destination/${story.countryCode}?place=${encodeURIComponent(
                        story.place,
                      )}&lat=${story.lat}&lng=${story.lng}&slug=${slugify(
                        story.place,
                      )}`,
                    )
                  }
                >
                  Open story destination
                </Button>
              </div>
            </div>
          </ShellCard>
        ))}
      </div>
    </div>
  );
}
