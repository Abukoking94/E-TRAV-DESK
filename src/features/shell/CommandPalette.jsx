import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useAppStore } from "../../store/useAppStore";

const paletteLinks = [
  { label: "Explore destinations", to: "/explore" },
  { label: "Open compare board", to: "/compare" },
  { label: "Open planner", to: "/planner" },
  { label: "View saved journeys", to: "/saved" },
  { label: "Read the journal", to: "/journal" },
];

export function CommandPalette() {
  const navigate = useNavigate();
  const isOpen = useAppStore((state) => state.isCommandPaletteOpen);
  const close = useAppStore((state) => state.closeCommandPalette);
  const recents = useAppStore((state) => state.recentDestinations);

  useEffect(() => {
    const listener = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (isOpen) {
          close();
          return;
        }
        useAppStore.getState().openCommandPalette();
      }

      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [close, isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="theme-command-overlay fixed inset-0 z-50 flex items-start justify-center px-4 pt-24 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
        >
          <motion.div
            className="glass-panel w-full max-w-2xl rounded-[28px] p-6"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-neon/20 bg-neon/10 p-2 text-neon">
                  <Search size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--theme-text-primary)]">
                    Quick actions
                  </p>
                  <p className="text-xs text-[color:var(--theme-text-secondary)]">
                    Jump across the experience or reopen a recent destination.
                  </p>
                </div>
              </div>
              <Button variant="icon" onClick={close} aria-label="Close command palette">
                <X size={16} />
              </Button>
            </div>

            <div className="grid gap-3">
              {paletteLinks.map((item, index) => (
                <motion.button
                  key={item.to}
                  type="button"
                  onClick={() => {
                    navigate(item.to);
                    close();
                  }}
                  className="rounded-2xl border border-[color:var(--theme-border-soft)] px-4 py-4 text-left transition hover:border-neon/30 hover:bg-[var(--theme-surface)]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, delay: index * 0.04 }}
                >
                  <p className="text-sm font-medium text-[color:var(--theme-text-primary)]">
                    {item.label}
                  </p>
                </motion.button>
              ))}
            </div>

            {recents.length ? (
              <div className="mt-6 border-t border-[color:var(--theme-border-soft)] pt-5">
                <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[color:var(--theme-text-muted)]">
                  Recent destinations
                </p>
                <div className="grid gap-2">
                  {recents.slice(0, 4).map((item, index) => (
                    <motion.button
                      key={`${item.countryCode}-${item.place}`}
                      type="button"
                      onClick={() => {
                        navigate(
                          `/destination/${item.countryCode}?place=${encodeURIComponent(
                            item.place,
                          )}&lat=${item.lat}&lng=${item.lng}`,
                        );
                        close();
                      }}
                      className="rounded-2xl border border-[color:var(--theme-border-soft)] px-4 py-3 text-left transition hover:border-aurora/30 hover:bg-[var(--theme-surface)]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, delay: 0.12 + index * 0.04 }}
                    >
                      <p className="text-sm text-[color:var(--theme-text-primary)]">
                        {item.place}
                      </p>
                      <p className="text-xs text-[color:var(--theme-text-secondary)]">
                        {item.country}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
