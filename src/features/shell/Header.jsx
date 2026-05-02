import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ThemeSwitch } from "../../components/ui/ThemeSwitch";
import { siteMeta } from "../../lib/site";
import { useAppStore } from "../../store/useAppStore";

const links = [
  { to: "/explore", label: "Explore" },
  { to: "/compare", label: "Compare" },
  { to: "/planner", label: "Planner" },
  { to: "/saved", label: "Saved" },
  { to: "/journal", label: "Journal" },
  { to: "/about", label: "About" },
];

export function Header() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const openPalette = useAppStore((state) => state.openCommandPalette);
  const [open, setOpen] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(value)}`);
    setValue("");
    setOpen(false);
  };

  return (
    <motion.header
      className="theme-header sticky top-0 z-40 border-b backdrop-blur-2xl"
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="page-shell flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex flex-col"
          >
            <span className="font-display text-xl font-semibold tracking-[0.28em] text-[color:var(--theme-text-primary)]">
              {siteMeta.wordmark}
            </span>
            <span className="hidden text-[11px] uppercase tracking-[0.24em] text-[color:var(--theme-text-muted)] xl:block">
              {siteMeta.tagline}
            </span>
          </Link>
          <div className="hidden h-6 w-px bg-[color:var(--theme-border-soft)] lg:block" />
          <nav className="hidden items-center gap-5 lg:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="group"
              >
                {({ isActive }) => (
                  <span
                    className={`relative flex items-center gap-2 text-sm transition ${
                      isActive
                        ? "text-neon"
                        : "text-[color:var(--theme-text-secondary)] group-hover:text-[color:var(--theme-text-primary)]"
                    }`}
                  >
                    <span>{link.label}</span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition duration-300 ${
                        isActive
                          ? "nav-pulse bg-neon shadow-[0_0_18px_rgba(39,151,255,0.5)]"
                          : "bg-[color:var(--theme-border-medium)] group-hover:bg-[color:var(--theme-text-primary)]"
                      }`}
                    />
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <form onSubmit={handleSubmit} className="w-72">
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Search cities, capitals, regions..."
              icon={Search}
            />
          </form>
          <ThemeSwitch />
          <Button variant="ghost" onClick={openPalette}>
            Ctrl + K
          </Button>
          <Button variant="quiet" onClick={() => navigate("/explore")}>
            Open desk
          </Button>
        </div>

        <Button
          variant="icon"
          className="lg:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </Button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="theme-header border-t px-4 py-4 lg:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="page-shell space-y-4">
              <form onSubmit={handleSubmit}>
                <Input
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder="Search destinations..."
                  icon={Search}
                />
              </form>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--theme-border-soft)] bg-[var(--theme-surface)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--theme-text-primary)]">
                    Theme mode
                  </p>
                  <p className="text-xs text-[color:var(--theme-text-muted)]">
                    Switch the full desk between light and dark.
                  </p>
                </div>
                <ThemeSwitch className="w-[128px]" />
              </div>
              <div className="grid gap-2">
                {links.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.24, delay: index * 0.04 }}
                  >
                    <NavLink
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl border border-[color:var(--theme-border-soft)] bg-[var(--theme-surface)] px-4 py-3 text-sm text-[color:var(--theme-text-secondary)]"
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
              <Button
                variant="quiet"
                className="w-full"
                onClick={() => {
                  navigate("/explore");
                  setOpen(false);
                }}
              >
                Open desk
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
