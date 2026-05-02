import { Sparkles } from "lucide-react";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";

function ScoreRow({ label, score, band, description, accent = "from-neon/80 to-neon/30" }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            {band}
          </p>
        </div>
        <p className="text-lg font-semibold text-white">{score ?? "N/A"}</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${accent}`}
          style={{ width: `${score ?? 8}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
    </div>
  );
}

export function DestinationReadinessPanel({ profile, isUnavailable = false }) {
  const rows = [
    {
      label: "Digital access",
      score: profile?.digitalScore,
      band: profile?.digitalBand,
      description:
        "Blends internet adoption and electricity access to estimate how smooth digitally dependent travel moments may feel.",
      accent: "from-neon/80 to-neon/30",
    },
    {
      label: "Connectivity",
      score: profile?.connectivityScore,
      band: profile?.connectivityBand,
      description:
        "Uses air transport and visitor flow as a proxy for external route density and general access momentum.",
      accent: "from-aurora/80 to-aurora/30",
    },
    {
      label: "Visitor pull",
      score: profile?.tourismScore,
      band: profile?.tourismBand,
      description:
        "Frames how strongly tourism appears in the public indicator set through arrivals and tourism-export exposure.",
      accent: "from-coral/80 to-coral/30",
    },
  ];

  const readinessIcon = Sparkles;
  const ReadinessIcon = readinessIcon;

  return (
    <ShellCard className="h-full">
      <SectionHeading
        eyebrow="Readiness"
        title="Travel systems posture"
        description="A derived scorecard that translates the World Bank indicators into a more human travel-readiness layer."
      />

      <div className="mt-8 rounded-[30px] border border-neon/20 bg-neon/10 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neon">
              Composite readiness
            </p>
            <p className="mt-3 font-display text-5xl font-semibold text-white">
              {profile?.readinessScore ?? "N/A"}
            </p>
          </div>
          <div className="rounded-2xl border border-neon/20 bg-atlas-950/50 p-3 text-neon">
            <ReadinessIcon size={20} />
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          {profile?.narrative ||
            (isUnavailable
              ? "The World Bank signals are not available right now, so this derived posture will return once the public indicator feed responds again."
              : "World Bank signals are still loading for this destination.")}
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
          {profile?.freshnessLabel || "Latest available year unavailable"}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <ScoreRow
            key={row.label}
            label={row.label}
            score={row.score}
            band={row.band}
            description={row.description}
            accent={row.accent}
          />
        ))}
      </div>

      <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
        <p className="text-sm leading-7 text-slate-400">
          Prosperity baseline:{" "}
          <span className="font-semibold text-white">
            {profile?.prosperityScore ?? "N/A"}
          </span>
          {" "}based on the most recent GDP-per-capita observation available in the public dataset.
        </p>
      </div>
    </ShellCard>
  );
}
