import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "../../features/shell/Footer";
import { Header } from "../../features/shell/Header";
import { AmbientShell } from "../../features/shell/AmbientShell";
import { CommandPalette } from "../../features/shell/CommandPalette";

export function RootLayout() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const mainRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    const frame = window.requestAnimationFrame(() => {
      mainRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <AmbientShell />
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          ref={mainRef}
          key={location.pathname}
          id="main-content"
          tabIndex={-1}
          className="relative z-10"
          initial={
            shouldReduceMotion
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 24, filter: "blur(10px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            shouldReduceMotion
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: -16, filter: "blur(8px)" }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0.01 }
              : { duration: 0.48, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-neon/45 to-transparent"
            initial={shouldReduceMotion ? { scaleX: 1, opacity: 0.82 } : { scaleX: 0.12, opacity: 0.4 }}
            animate={{ scaleX: 1, opacity: 0.82 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.01 }
                : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
            }
          />
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <CommandPalette />
    </div>
  );
}
