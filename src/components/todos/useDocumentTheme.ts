// src/hooks/useDocumentTheme.ts
import { useEffect, useState } from "react";

/** Observe <html data-theme="..."> so children can react to pink/dark/light */
export function useDocumentTheme() {
  const get = () =>
    (document.documentElement.getAttribute("data-theme") || "dark") as
      "dark" | "light" | "pink";

  const [theme, setTheme] = useState<"dark" | "light" | "pink">(get);

  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(get()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  return theme;
}
