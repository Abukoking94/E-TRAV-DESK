import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "../../../components/ui/Reveal";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { productModes } from "../../../lib/site";

export function ModesSection() {
  return (
    <section className="section-space pt-0">
      <div className="page-shell">
        <Reveal>
          <SectionHeading
            eyebrow="Modules"
            title="Operate the product in three clear modes."
            description="This is part of the foundation phase too: the landing page should explain the product surface clearly enough that the rest of the routes feel intentional."
          />
        </Reveal>
        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {productModes.map((mode, index) => (
            <Reveal key={mode.id} delay={index * 0.08}>
              <Link
                to={mode.route}
                className="surface-panel group block h-full overflow-hidden p-6 transition duration-300 hover:border-neon/25"
              >
                <p className="eyebrow-label">{mode.eyebrow}</p>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  {mode.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  {mode.description}
                </p>
                <div className="soft-divider my-6" />
                <div className="flex items-center gap-2 text-sm text-neon">
                  Open module
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

