import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/cn";

export function Reveal({
  as: Component = motion.div,
  className,
  delay = 0,
  distance = 24,
  children,
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Component
      className={cn(className)}
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.01, delay: 0 }
          : { duration: 0.65, delay, ease: [0.21, 1, 0.35, 1] }
      }
    >
      {children}
    </Component>
  );
}
