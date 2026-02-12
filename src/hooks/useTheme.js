import { useEffect } from "react";

export function useTheme(theme) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
}
