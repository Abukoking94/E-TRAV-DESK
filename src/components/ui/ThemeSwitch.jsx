import { motion } from "framer-motion";
import { MoonStar, SunMedium } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";

export function ThemeSwitch({ className }) {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const isLight = theme === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      className={cn(
        "theme-switch relative inline-grid h-11 w-[142px] grid-cols-2 items-center rounded-full p-1 text-xs font-medium",
        className,
      )}
      onClick={toggleTheme}
    >
      <motion.span
        className="theme-switch-thumb absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full"
        animate={{ x: isLight ? "100%" : "0%" }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      />
      <span
        className={cn(
          "theme-switch-segment relative z-10 flex items-center justify-center gap-1.5 rounded-full px-2",
          !isLight ? "is-active" : "",
        )}
      >
        <MoonStar size={14} />
        <span>Dark</span>
      </span>
      <span
        className={cn(
          "theme-switch-segment relative z-10 flex items-center justify-center gap-1.5 rounded-full px-2",
          isLight ? "is-active" : "",
        )}
      >
        <SunMedium size={14} />
        <span>Light</span>
      </span>
    </button>
  );
}
