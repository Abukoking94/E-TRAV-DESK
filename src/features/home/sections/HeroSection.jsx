import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Compass, Search, Sparkles, Waves } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Reveal } from "../../../components/ui/Reveal";
import { formatNumber } from "../../../lib/formatters";
import { siteMeta } from "../../../lib/site";

export function HeroSection({ metrics }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const pulseStates = useMemo(() => metrics.pulseStates ?? [], [metrics.pulseStates]);
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    if (pulseStates.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setPulseIndex((current) => (current + 1) % pulseStates.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, [pulseStates]);

  const activePulse =
    pulseStates[pulseIndex] ?? {
      id: "coverage",
      label: "Indexed travel nodes",
      value: metrics.countryCount,
      accent: `${formatNumber(metrics.regionCount)} active regional clusters`,
      description: "The desk is resolving its live atlas coverage.",
      status: "Pulse standby",
      cells: Array.from({ length: 32 }, (_, index) => index < 14),
    };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="section-space">
      <div className="page-shell grid items-center gap-14 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal className="relative">
          <Badge>{siteMeta.tagline}</Badge>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            A wider, smarter way to{" "}
            <span className="gradient-text">explore destinations like a live desk.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            {siteMeta.name} blends country data, climate signals, air-quality
            insight, marine conditions, and editorial context into one immersive
            frontend-only product surface.
          </p>

          <form
            onSubmit={handleSubmit}
            className="surface-panel mt-8 flex flex-col gap-3 p-3 sm:flex-row"
          >
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a country, capital, or city"
              icon={Search}
              className="h-14 border-transparent bg-transparent text-base"
            />
            <Button variant="brand" className="h-14 px-6">
              Begin exploring
              <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="quiet" onClick={() => navigate("/compare")}>
              Compare destinations
              <Compass size={18} />
            </Button>
            <Button variant="secondary" onClick={() => navigate("/saved")}>
              Build your desk
              <Sparkles size={18} />
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="eyebrow-label">Countries indexed</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatNumber(metrics.countryCount)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="eyebrow-label">Population scope</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatNumber(metrics.totalPopulation)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="eyebrow-label">Languages represented</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatNumber(metrics.languageCount)}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="relative" delay={0.12}>
          <div className="surface-panel mesh-backdrop relative overflow-hidden p-7">
            <div className="absolute inset-0 bg-gradient-to-br from-neon/10 via-transparent to-aurora/10" />
            <div className="relative z-10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Live system pulse</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    Rotating live desk metrics
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-aurora">
                    {activePulse.status}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-aurora animate-pulse shadow-[0_0_16px_rgba(125,211,252,0.65)]" />
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-night/70 p-5">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activePulse.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-end justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm text-slate-500">{activePulse.label}</p>
                      <p className="mt-3 text-4xl font-semibold text-white">
                        {formatNumber(activePulse.value)}
                      </p>
                    </div>
                    <p className="max-w-[14rem] text-right text-sm text-aurora">
                      {activePulse.accent}
                    </p>
                  </motion.div>
                </AnimatePresence>
                <div className="mt-6 grid grid-cols-8 gap-2">
                  {Array.from({ length: 32 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-12 rounded-2xl transition duration-500 ${
                        activePulse.cells?.[index]
                          ? "animate-pulseLine border border-neon/15 bg-gradient-to-t from-neon/20 via-aurora/20 to-coral/25 shadow-[0_0_0_1px_rgba(39,151,255,0.12)]"
                          : "bg-white/5 opacity-40"
                      }`}
                      style={{
                        animationDelay: `${index * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={`${activePulse.id}-description`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.24 }}
                    className="mt-5 text-sm leading-7 text-slate-400"
                  >
                    {activePulse.description}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon/20 bg-neon/10 text-neon">
                      <Waves size={16} />
                    </div>
                    <div>
                      <p className="eyebrow-label">Climate layer</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        Forecast + AQI + marine
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-aurora/20 bg-aurora/10 text-aurora">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="eyebrow-label">Editorial layer</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        Wikimedia context + region insight
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-4">
                <div className="rounded-[28px] border border-white/10 bg-atlas-950/65 p-5">
                  <p className="eyebrow-label">Dominant region</p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-2xl font-semibold text-white">
                        {metrics.leadingRegion?.label || "Unavailable"}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        {formatNumber(metrics.leadingRegion?.count || 0)} indexed
                        countries, currently the largest regional module in the desk.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Lead share
                      </p>
                      <p className="mt-1 text-xl font-semibold text-white">
                        {metrics.leadingRegion?.share || 0}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-atlas-950/65 p-5">
                  <p className="eyebrow-label">Largest spotlight destination</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {metrics.biggestDestination?.countryName || "Unavailable"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    Anchored by{" "}
                    {metrics.biggestDestination?.place ||
                      metrics.biggestDestination?.countryName ||
                      "its capital"}
                    , this destination currently leads the home-page spotlight set.
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
