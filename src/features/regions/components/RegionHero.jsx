import { useNavigate } from "react-router-dom";
import { Compass, Layers3, MapPinned } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ShellCard } from "../../../components/ui/ShellCard";

export function RegionHero({ profile, regionTitle, summary }) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <ShellCard className="relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,143,84,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(231,195,125,0.08),transparent_34%)]" />
        <div className="relative">
          <Badge className="border-neon/20 bg-neon/10 text-neon">Regional hub</Badge>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {regionTitle} live discovery desk
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            {profile.headline}
          </p>
          <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-400">
            {summary || profile.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {profile.tags.map((tag) => (
              <Badge
                key={tag}
                className="normal-case tracking-normal text-slate-200"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => navigate("/explore")}>Open explorer</Button>
            <Button variant="secondary" onClick={() => navigate("/compare")}>
              Open compare board
            </Button>
          </div>
        </div>
      </ShellCard>

      <div className="grid gap-6">
        <ShellCard>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-neon/20 bg-neon/10 p-3 text-neon">
              <Compass size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Regional framing</p>
              <p className="text-sm text-slate-500">
                This route is designed as a narrative hub, not just a filtered list.
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-400">
            The region surface combines broad country context, a live weather sample,
            and editorial spotlighting so the desk feels like a product-grade discovery
            layer.
          </p>
        </ShellCard>

        <ShellCard>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-atlas-950/70 p-3 text-aurora">
                  <Layers3 size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Hub format</p>
                  <p className="text-sm text-slate-500">Overview + climate + grid</p>
                </div>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-atlas-950/70 p-3 text-neon">
                  <MapPinned size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Use case</p>
                  <p className="text-sm text-slate-500">Shortlist and compare destinations</p>
                </div>
              </div>
            </div>
          </div>
        </ShellCard>
      </div>
    </div>
  );
}
