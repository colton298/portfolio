import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import '../css/index.css';

type Theme = "dark" | "light" | "pink";

function getInitialTheme(): Exclude<Theme, "pink"> {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // keep the real theme separate from the easter-egg theme
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const lastRealTheme = useRef<Exclude<Theme, "pink">>(theme as Exclude<Theme, "pink">);

  // spam-click detection
  const clickTimes = useRef<number[]>([]);
  const PINK_CLICK_COUNT = 6;         // clicks…
  const PINK_CLICK_WINDOW = 1200;     // …within this many ms
  const [pinkUntil, setPinkUntil] = useState(0); // when the pink lock ends

  // Apply theme to <html data-theme="..."> and persist only real themes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme !== "pink") {
      lastRealTheme.current = theme;
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  // Live-update if OS theme changes AND user hasn't explicitly chosen (only for first visit)
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setTheme(mq.matches ? "dark" : "light");
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const isDark = theme === "dark";
  const toggleLabel = useMemo(
    () =>
      theme === "pink"
        ? "Pink mode is active"
        : isDark
          ? "Switch to light mode"
          : "Switch to dark mode",
    [isDark, theme]
  );

  function handleThemeClick() {
    const now = Date.now();

    // If we're currently pink…
    if (theme === "pink") {
      // …and the user has waited long enough, a click will restore the saved theme
      if (now >= pinkUntil) {
        setTheme(lastRealTheme.current);
      }
      // If they haven't waited, ignore clicks
      return;
    }

    // Not pink: record the click and check for spam pattern
    clickTimes.current.push(now);
    // keep only recent clicks inside the window
    clickTimes.current = clickTimes.current.filter((t) => now - t <= PINK_CLICK_WINDOW);

    if (clickTimes.current.length >= PINK_CLICK_COUNT) {
      // Trigger pink, lock it for a short time, and do NOT persist
      setTheme("pink");
      setPinkUntil(now + 2500); // must wait this long before the next click can exit pink
      clickTimes.current = [];
      return;
    }

    // Normal toggle (persisted)
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="site-title">
          <a href="/" className="brand-link">Colton Santiago</a>
        </div>

        <div id="subheader-slot" className="subheader-slot" />

        {/* Desktop Nav */}
        <nav className="site-nav">
          <NavLink to="/" className="nav-link">Home</NavLink>
          <NavLink to="/projects" className="nav-link">Projects</NavLink>
          <NavLink to="/resume" className="nav-link">Resume</NavLink>
          <NavLink to="/contact" className="nav-link">Contact</NavLink>
        </nav>

        {/* Right cluster: theme toggle + hamburger */}
        <div className="right-cluster">
          <button
            className="theme-toggle"
            onClick={handleThemeClick}
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            {theme === "pink" ? (
              // Heart—just for fun in pink mode
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s-6.5-4.35-9.2-7.07a5.5 5.5 0 1 1 7.78-7.78L12 5.57l1.42-1.42a5.5 5.5 0 1 1 7.78 7.78C18.5 16.65 12 21 12 21z" fill="currentColor"/>
              </svg>
            ) : isDark ? (
              // Sun
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4V2m0 20v-2M4 12H2m20 0h-2M5.64 5.64 4.22 4.22m15.56 15.56-1.42-1.42M18.36 5.64l1.42-1.42M4.22 19.78l1.42-1.42" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            ) : (
              // Moon
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            )}
            <span className="theme-toggle-text">
              {theme === "pink" ? "Pink!" : isDark ? "Light" : "Dark"}
            </span>
          </button>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`} id="mobile-menu">
        <div className="mobile-menu-content">
          <NavLink to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/projects" className="mobile-link" onClick={() => setMenuOpen(false)}>Projects</NavLink>
          <NavLink to="/resume" className="mobile-link" onClick={() => setMenuOpen(false)}>Resume</NavLink>
          <NavLink to="/contact" className="mobile-link" onClick={() => setMenuOpen(false)}>Contact</NavLink>

          <button
            className="theme-toggle mobile"
            onClick={handleThemeClick}
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            {theme === "pink" ? "Pink!" : isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>
      </div>
    </header>
  );
}
