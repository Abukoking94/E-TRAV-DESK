import { cn } from "../../lib/cn";
import { Reveal } from "./Reveal";
import { Badge } from "./Badge";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}) {
  return (
    <Reveal
      className={cn(
        align === "center" ? "mx-auto max-w-3xl text-center" : "",
        className,
      )}
      distance={18}
    >
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[color:var(--theme-text-primary)] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--theme-text-secondary)] sm:text-base">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
