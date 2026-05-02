import { cn } from "../../lib/cn";

export function ShellCard({ children, className }) {
  return (
    <div
      className={cn(
        "glass-panel rounded-[28px] p-5 sm:p-6 transition duration-500 hover:-translate-y-1 hover:border-[color:var(--theme-border-medium)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
