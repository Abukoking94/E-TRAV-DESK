import { useNavigate } from "react-router-dom";
import { ArrowRight, Compass, Newspaper } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { formatPercent, formatTemp, slugify } from "../../../lib/formatters";

export function JournalHero({ spotlight }) {
  const navigate = useNavigate();
  const primary = spotlight.primary;
  const secondary = spotlight.secondary;

  const openPrimary = () => {
    if (!primary) {
      return;
    }

    navigate(
      `/destination/${primary.countryCode}?place=${encodeURIComponent(
        primary.place,
      )}&lat=${primary.lat}&lng=${primary.lng}&slug=${slugify(primary.place)}`,
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <ShellCard className="relative overflow-hidden p-0">
        {primary?.image ? (
          <div className="absolute inset-0">
            <img
              src={primary.image}
              alt={primary.title || primary.countryName}
              decoding="async"
              className="h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,13,8,0.92),rgba(20,13,8,0.78))]" />
          </div>
        ) : null}

        <div className="relative p-6 sm:p-8">
          <Badge className="border-neon/20 bg-neon/10 text-neon">
            Weekly spotlight
          </Badge>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Editorial discovery built from live public data.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            The journal turns E-Trav Desk into a travel intelligence publication,
            blending country context, climate readings, and editorial summaries into one
            softer, more narrative surface.
          </p>

          {primary ? (
            <div className="mt-8 rounded-[32px] border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-aurora">
                    {primary.region}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">
                    {primary.countryName}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {primary.place} | {primary.capital}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Live read
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatTemp(primary.currentTemp)}
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-300">
                {primary.summary ||
                  `${primary.countryName} is carrying the strongest editorial score on the desk right now.`}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Badge className="normal-case tracking-normal text-slate-200">
                  Rain chance {formatPercent(primary.rainChance)}
                </Badge>
                <Badge className="normal-case tracking-normal text-slate-200">
                  Capital {primary.capital}
                </Badge>
              </div>
              <div className="mt-6">
                <Button onClick={openPrimary}>
                  Open spotlight
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </ShellCard>

      <div className="grid gap-6">
        <ShellCard>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-neon/20 bg-neon/10 p-3 text-neon">
              <Newspaper size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Publication surface</p>
              <p className="text-sm text-slate-500">
                The journal emphasizes story framing over dense utility panels.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <SectionHeading
              eyebrow="Dispatches"
              title="Fast editorial reads"
              description="Secondary stories keep the journal moving like a live magazine front page."
            />
          </div>
          <div className="mt-6 space-y-4">
            {secondary.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/destination/${story.countryCode}?place=${encodeURIComponent(
                      story.place,
                    )}&lat=${story.lat}&lng=${story.lng}&slug=${slugify(story.place)}`,
                  )
                }
                className="w-full rounded-[28px] border border-white/10 bg-white/5 p-5 text-left transition hover:border-neon/20 hover:bg-white/[0.08]"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-neon">
                  {story.region}
                </p>
                <p className="mt-3 text-xl font-semibold text-white">
                  {story.countryName}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {story.summary || `${story.countryName} is active on the editorial desk.`}
                </p>
              </button>
            ))}
          </div>
        </ShellCard>

        <ShellCard>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-aurora">
              <Compass size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Desk angle</p>
              <p className="text-sm text-slate-500">
                This route helps the project read like a product brand, not just a dashboard.
              </p>
            </div>
          </div>
        </ShellCard>
      </div>
    </div>
  );
}
