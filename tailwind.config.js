/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        atlas: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#b7dcff",
          300: "#84c4ff",
          400: "#49a7ff",
          500: "#1889ff",
          600: "#0f6ddd",
          700: "#1155ad",
          800: "#113d7f",
          900: "#0d2449",
          950: "#050816",
        },
        night: "#02050f",
        aurora: "#8edbff",
        neon: "#2797ff",
        coral: "#5ab6ff",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(39, 151, 255, 0.28), 0 18px 44px rgba(4, 10, 28, 0.46)",
      },
      backgroundImage: {
        "atlas-grid":
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        "atlas-aurora":
          "radial-gradient(circle at top left, rgba(142, 219, 255, 0.18), transparent 34%), radial-gradient(circle at top right, rgba(39, 151, 255, 0.16), transparent 28%), radial-gradient(circle at bottom, rgba(90, 182, 255, 0.14), transparent 38%)",
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        shell: "1440px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseLine: "pulseLine 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
