import { motion, useReducedMotion } from "framer-motion";

const transition = {
  duration: 18,
  ease: "easeInOut",
  repeat: Infinity,
  repeatType: "mirror",
};

export function AmbientShell() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <div className="theme-ambient-aurora pointer-events-none absolute inset-0" />
      <div className="theme-grid-overlay pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="theme-ambient-blob neon absolute -left-24 top-24 h-72 w-72 rounded-full blur-3xl"
          animate={
            shouldReduceMotion
              ? { opacity: 0.75 }
              : { x: [0, 48, -24], y: [0, -26, 18], scale: [1, 1.08, 0.96] }
          }
          transition={shouldReduceMotion ? { duration: 0.2 } : transition}
        />
        <motion.div
          className="theme-ambient-blob aurora absolute right-[-8rem] top-1/3 h-96 w-96 rounded-full blur-3xl"
          animate={
            shouldReduceMotion
              ? { opacity: 0.65 }
              : { x: [0, -64, 26], y: [0, 34, -12], scale: [1, 0.92, 1.04] }
          }
          transition={
            shouldReduceMotion ? { duration: 0.2 } : { ...transition, duration: 22 }
          }
        />
        <motion.div
          className="theme-ambient-blob coral absolute bottom-[-7rem] left-1/3 h-80 w-80 rounded-full blur-3xl"
          animate={
            shouldReduceMotion
              ? { opacity: 0.7 }
              : { x: [0, 40, -18], y: [0, -36, 12], scale: [1, 1.06, 0.94] }
          }
          transition={
            shouldReduceMotion ? { duration: 0.2 } : { ...transition, duration: 20 }
          }
        />
        <motion.div
          className="theme-ambient-line absolute inset-x-0 top-1/4 h-px"
          animate={
            shouldReduceMotion
              ? { opacity: 0.35 }
              : { x: ["-8%", "12%", "-6%"], opacity: [0.3, 0.9, 0.28] }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0.2 }
              : { duration: 14, ease: "easeInOut", repeat: Infinity }
          }
        />
      </div>
    </>
  );
}
