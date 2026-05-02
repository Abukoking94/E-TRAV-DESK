import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

const variants = {
  primary:
    "border-neon/30 bg-neon/10 text-neon hover:border-neon/50 hover:bg-neon/20",
  brand:
    "border-neon/40 bg-neon text-white shadow-[0_16px_44px_rgba(39,151,255,0.24)] hover:border-neon/60 hover:bg-[#4fabff]",
  secondary:
    "border-[color:var(--theme-border-soft)] bg-[var(--theme-surface)] text-[color:var(--theme-text-primary)] hover:border-[color:var(--theme-border-medium)] hover:bg-[var(--theme-surface-hover)]",
  quiet:
    "border-[color:var(--theme-border-soft)] bg-[var(--theme-surface-strong)] text-[color:var(--theme-text-secondary)] hover:border-[color:var(--theme-border-medium)] hover:bg-[var(--theme-surface-hover)]",
  ghost:
    "border-transparent bg-transparent text-[color:var(--theme-text-secondary)] hover:text-[color:var(--theme-text-primary)]",
  icon:
    "h-11 w-11 border-[color:var(--theme-border-soft)] bg-[var(--theme-surface)] text-[color:var(--theme-text-primary)] hover:border-[color:var(--theme-border-medium)] hover:bg-[var(--theme-surface-hover)]",
};

export function Button({
  children,
  className,
  variant = "secondary",
  ...props
}) {
  return (
    <motion.button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition duration-300 disabled:pointer-events-none disabled:opacity-50",
        variant === "icon" ? "px-0 py-0" : "",
        variants[variant],
        className,
      )}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
