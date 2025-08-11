import { useEffect, useMemo, useRef, useState } from "react";
import "../wordle.css";

function normLetter(s: string) {
  return (s || "").slice(-1).toLowerCase().replace(/[^a-z]/g, "");
}

export default function Wordle() {
    useEffect(() => {
      document.title = "Colton Santiago | Wordle Solver";
    }, []);
  // line 1: GREEN positions (exact)
  const [greens, setGreens] = useState<string[]>(["", "", "", "", ""]);
  // line 2: YELLOW letters (exist in word, but NOT at that position)
  const [yellows, setYellows] = useState<string[]>(["", "", "", "", ""]);
  // line 3: GRAY letters (not in word at all)
  const [grays, setGrays] = useState<string>("");

  // Show/Hide results
  const [showResults, setShowResults] = useState(false);

  // Refs for auto-advance
  const greenRefs = useRef<(HTMLInputElement | null)[]>([]);
  const yellowRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [words, setWords] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // load words.txt from public/wordle/words.txt
  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}words.txt`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load words.txt (${r.status})`);
        return r.text();
      })
      .then((t) => {
        const list = t
          .split(/\r?\n/)
          .map((s) => s.trim().toLowerCase())
          .filter((s) => s.length === 5 && /^[a-z]{5}$/.test(s));
        setWords(list);
      })
      .catch((e) => setError(e.message));
  }, []);

  // normalize inputs to single letters + auto-advance
  const onGreen = (i: number, v: string) => {
    const ch = normLetter(v);
    setGreens((prev) => prev.map((c, k) => (k === i ? ch : c)));
    if (ch && i < 4) greenRefs.current[i + 1]?.focus();
  };

  const onYellow = (i: number, v: string) => {
    const ch = normLetter(v);
    setYellows((prev) => prev.map((c, k) => (k === i ? ch : c)));
    if (ch && i < 4) yellowRefs.current[i + 1]?.focus();
  };

  // handle Backspace to move left when empty
  const onKeyNav =
    (row: "green" | "yellow", i: number) =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const refs = row === "green" ? greenRefs.current : yellowRefs.current;
      if (e.key === "Backspace") {
        const val =
          row === "green" ? greens[i] : yellows[i];
        if (!val && i > 0) {
          refs[i - 1]?.focus();
        }
      } else if (e.key === "ArrowLeft" && i > 0) {
        refs[i - 1]?.focus();
        e.preventDefault();
      } else if (e.key === "ArrowRight" && i < 4) {
        refs[i + 1]?.focus();
        e.preventDefault();
      } else if (e.key === "Enter") {
        // quick action: show results
        setShowResults(true);
      }
    };

  const onGrays = (v: string) => setGrays(v.toLowerCase().replace(/[^a-z]/g, ""));

  // build constraints + filter
  const candidates = useMemo(() => {
    if (!words) return [];

    // letters that must appear at least N times (greens + yellows)
    const requiredCounts = new Map<string, number>();
    for (const g of greens) if (g) requiredCounts.set(g, (requiredCounts.get(g) ?? 0) + 1);
    for (const y of yellows) if (y) requiredCounts.set(y, (requiredCounts.get(y) ?? 0) + 1);

    // gray letters, excluding any that are already required (Wordle nuance)
    const requiredSet = new Set(requiredCounts.keys());
    const excluded = new Set<string>();
    for (const ch of grays) if (!requiredSet.has(ch)) excluded.add(ch);

    return words.filter((w) => {
      // greens (exact positions)
      for (let i = 0; i < 5; i++) if (greens[i] && w[i] !== greens[i]) return false;

      // yellows (letter exists but NOT in that slot)
      for (let i = 0; i < 5; i++) {
        const y = yellows[i];
        if (y) {
          if (w[i] === y) return false; // not allowed here
          if (!w.includes(y)) return false; // must exist somewhere
        }
      }

      // excluded letters (none can appear)
      for (const ch of excluded) if (w.includes(ch)) return false;

      // minimum counts for letters that appear multiple times
      for (const [ch, min] of requiredCounts.entries()) {
        if (count(w, ch) < min) return false;
      }

      return true;
    });
  }, [words, greens, yellows, grays]);

  return (
    <section className="wordle">
      <h1>Wordle Solver</h1>

      {error && <p style={{ color: "#f87171" }}>Error: {error}</p>}
      {!error && !words && <p>Loading dictionary…</p>}

      {/* Line 1: five green boxes */}
      <div className="row row-tight">
        {greens.map((ch, i) => (
          <input
            key={`g-${i}`}
            ref={(el) => (greenRefs.current[i] = el)}
            className="box green"
            value={ch.toUpperCase()}
            onChange={(e) => onGreen(i, e.target.value)}
            onKeyDown={onKeyNav("green", i)}
            maxLength={1}
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            aria-label={`Green position ${i + 1}`}
          />
        ))}
      </div>

      {/* Line 2: five yellow boxes */}
      <div className="row row-tight">
        {yellows.map((ch, i) => (
          <input
            key={`y-${i}`}
            ref={(el) => (yellowRefs.current[i] = el)}
            className="box yellow"
            value={ch.toUpperCase()}
            onChange={(e) => onYellow(i, e.target.value)}
            onKeyDown={onKeyNav("yellow", i)}
            maxLength={1}
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            aria-label={`Yellow not-at-position ${i + 1}`}
          />
        ))}
      </div>

      {/* Line 3: long gray box (multiple letters) */}
      <div className="row">
        <input
          className="box gray long"
          placeholder="Incorrect letters (e.g., ASDF)"
          value={grays.toUpperCase()}
          onChange={(e) => onGrays(e.target.value)}
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          aria-label="Incorrect letters"
          onKeyDown={(e) => {
            if (e.key === "Enter") setShowResults(true);
          }}
        />
      </div>

      {/* Action button */}
      <div className="row" style={{ marginTop: "0.5rem" }}>
        <button
          className="btn"
          type="button"
          onClick={() => setShowResults((s) => !s)}
          disabled={!words}
        >
          {showResults ? "Hide possible matches" : "Show possible matches"}
        </button>
      </div>

      {/* Results (only when requested) */}
      {showResults && (
        <div className="results">
          <h2>Possible matches ({candidates.length})</h2>
          <p className="list">{candidates.join(", ")}</p>
        </div>
      )}
    </section>
  );
}

function count(word: string, ch: string) {
  let n = 0;
  for (const c of word) if (c === ch) n++;
  return n;
}
