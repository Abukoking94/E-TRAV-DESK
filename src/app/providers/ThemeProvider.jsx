import { useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";

export function ThemeProvider({ children }) {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.body.dataset.theme = theme;

    const themeColor = document.querySelector('meta[name="theme-color"]');

    if (themeColor) {
      themeColor.setAttribute("content", theme === "light" ? "#f7fbff" : "#050816");
    }
  }, [theme]);

  return children;
}
