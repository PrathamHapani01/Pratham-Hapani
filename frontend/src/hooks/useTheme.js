import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const current = document.documentElement.dataset.theme;
    return current === "blue" ? "blue" : "peach";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* storage can be blocked */
    }
  }, [theme]);

  function toggle() {
    setTheme((current) => (current === "peach" ? "blue" : "peach"));
  }

  return { theme, setTheme, toggle };
}
