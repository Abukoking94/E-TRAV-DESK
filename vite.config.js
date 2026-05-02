import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (
            id.includes("react-router-dom") ||
            id.includes("react-router") ||
            id.includes("@remix-run/router") ||
            id.includes("react-dom") ||
            id.includes("\\react\\") ||
            id.includes("/react/") ||
            id.includes("scheduler")
          ) {
            return "react-core";
          }

          if (id.includes("@tanstack/react-query") || id.includes("zustand") || id.includes("zod")) {
            return "data-core";
          }

          if (id.includes("framer-motion")) {
            return "motion-core";
          }

          if (id.includes("recharts")) {
            return "charts-core";
          }

          if (id.includes("lucide-react")) {
            return "icons-core";
          }

          return "vendor";
        },
      },
    },
  },
});
