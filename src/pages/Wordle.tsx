import { useMemo, useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import "../wordle.css";

function normLetter(s: string) {
  return (s || "").slice(-1).toLowerCase().replace(/[^a-z]/g, "");
}

export default function Wordle() {
  // load words.txt from public/wordle/words.txt
  const [words, setWords] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}words.txt`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load words.txt (${r.status})`);
        return r.text();
      })
      .then((t) => {
        const list = t
          .split(/\r?\n/).map((s) => s.trim().toLowerCase())
          .filter((s) => s.length === 5 && /^[a-z]{5}$/.test(s));
        setWords(list);
      })
      .catch((e) => setError(e.message));
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

  const onKeyNav =
    (row: "green" | "yellow", i: number) =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const refs = row === "green" ? greenRefs.current : yellowRefs.current;
      if (e.key === "Backspace") {
        const val = row === "green" ? greens[i] : yellows[i];
        if (!val && i > 0) refs[i - 1]?.focus();
      } else if (e.key === "ArrowLeft" && i > 0) {
        refs[i - 1]?.focus();
        e.preventDefault();
      } else if (e.key === "ArrowRight" && i < 4) {
        refs[i + 1]?.focus();
        e.preventDefault();
      } else if (e.key === "Enter") {
        setShowResults(true);
      }
    };

  const onGrays = (v: string) => setGrays(v.toLowerCase().replace(/[^a-z]/g, ""));

  const candidates = useMemo(() => {
    if (!words) return [];
    const requiredCounts = new Map<string, number>();
    for (const g of greens) if (g) requiredCounts.set(g, (requiredCounts.get(g) ?? 0) + 1);
    for (const y of yellows) if (y) requiredCounts.set(y, (requiredCounts.get(y) ?? 0) + 1);
    const requiredSet = new Set(requiredCounts.keys());
    const excluded = new Set<string>();
    for (const ch of grays) if (!requiredSet.has(ch)) excluded.add(ch);

    return words.filter((w) => {
      for (let i = 0; i < 5; i++) if (greens[i] && w[i] !== greens[i]) return false;
      for (let i = 0; i < 5; i++) {
        const y = yellows[i];
        if (y) {
          if (w[i] === y) return false;
          if (!w.includes(y)) return false;
        }
      }
      for (const ch of excluded) if (w.includes(ch)) return false;
      for (const [ch, min] of requiredCounts.entries()) {
        if (count(w, ch) < min) return false;
      }
      return true;
    });
  }, [words, greens, yellows, grays]);

  return (
    <section className="wordle">
      <Helmet>
        <title>Colton Santiago | Wordle Solver</title>
        <meta
          name="description"
          content="Interactive Wordle solver by Colton Santiago. Enter greens, yellows, and grays to get valid matches."
        />
        <meta property="og:title" content="Colton Santiago | Wordle Solver" />
        <meta
          property="og:description"
          content="A fast, interactive solver to help find Wordle answers based on your clues."
        />
      </Helmet>

      <h1>Wordle Solver</h1>

      {error && <p style={{ color: "#f87171" }}>Error: {error}</p>}
      {!error && !words && <p>Loading dictionary…</p>}

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
