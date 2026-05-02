import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { productModes, siteMeta } from "../../lib/site";

export function Footer() {
  return (
    <motion.footer
      className="relative z-10 border-t border-[color:var(--theme-border-soft)]"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="page-shell py-10">
        <div className="glass-panel rounded-[32px] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <p className="font-display text-lg tracking-[0.26em] text-[color:var(--theme-text-primary)]">
                {siteMeta.wordmark}
              </p>
              <p className="max-w-xl text-sm leading-7 text-[color:var(--theme-text-secondary)]">
                {siteMeta.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-[color:var(--theme-text-secondary)]">
                <Link className="link-hover" to="/explore">
                  Explore
                </Link>
                <Link className="link-hover" to="/compare">
                  Compare
                </Link>
                <Link className="link-hover" to="/saved">
                  Saved
                </Link>
                <Link className="link-hover" to="/journal">
                  Journal
                </Link>
                <Link className="link-hover" to="/about">
                  About
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {productModes.map((mode) => (
                <Link
                  key={mode.id}
                  to={mode.route}
                  className="rounded-[24px] border border-[color:var(--theme-border-soft)] bg-[var(--theme-surface)] px-4 py-4 transition hover:border-neon/25 hover:bg-[var(--theme-surface-hover)]"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-neon">
                    {mode.eyebrow}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[color:var(--theme-text-primary)]">
                    {mode.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
