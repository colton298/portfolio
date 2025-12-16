"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import "./wordle.css";

function normLetter(s: string) {
  return (s || "").slice(-1).toLowerCase().replace(/[^a-z]/g, "");
}

export default function WordleClient() {
  const [words, setWords] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/assets/words.txt")
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

  const [greens, setGreens] = useState(["", "", "", "", ""]);
  const [yellows, setYellows] = useState(["", "", "", "", ""]);
  const [grays, setGrays] = useState("");
  const [showResults, setShowResults] = useState(false);

  const greenRefs = useRef<(HTMLInputElement | null)[]>([]);
  const yellowRefs = useRef<(HTMLInputElement | null)[]>([]);

  const onGreen = (i: number, v: string) => {
    const ch = normLetter(v);
    setGreens((p) => p.map((c, k) => (k === i ? ch : c)));
    if (ch && i < 4) greenRefs.current[i + 1]?.focus();
  };

  const onYellow = (i: number, v: string) => {
    const ch = normLetter(v);
    setYellows((p) => p.map((c, k) => (k === i ? ch : c)));
    if (ch && i < 4) yellowRefs.current[i + 1]?.focus();
  };

  const onKeyNav =
    (row: "green" | "yellow", i: number) =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const refs = row === "green" ? greenRefs.current : yellowRefs.current;
      if (e.key === "Backspace" && i > 0) refs[i - 1]?.focus();
      if (e.key === "Enter") setShowResults(true);
    };

  const candidates = useMemo(() => {
    if (!words) return [];
    const required = new Map<string, number>();
    for (const g of greens) if (g) required.set(g, (required.get(g) ?? 0) + 1);
    for (const y of yellows) if (y) required.set(y, (required.get(y) ?? 0) + 1);

    const excluded = new Set([...grays].filter((c) => !required.has(c)));

    return words.filter((w) => {
      for (let i = 0; i < 5; i++) if (greens[i] && w[i] !== greens[i]) return false;
      for (let i = 0; i < 5; i++) {
        const y = yellows[i];
        if (y && (w[i] === y || !w.includes(y))) return false;
      }
      for (const c of excluded) if (w.includes(c)) return false;
      for (const [c, n] of required) if (count(w, c) < n) return false;
      return true;
    });
  }, [words, greens, yellows, grays]);

  return (
    <section className="wordle">
      <h1>Wordle Solver</h1>

      {error && <p className="error">Error: {error}</p>}
      {!error && !words && <p>Loading dictionary…</p>}

      <div className="row row-tight">
        {greens.map((ch, i) => (
          <input
            key={i}
            ref={(el) => {greenRefs.current[i] = el}}
            className="box green"
            value={ch.toUpperCase()}
            onChange={(e) => onGreen(i, e.target.value)}
            onKeyDown={onKeyNav("green", i)}
          />
        ))}
      </div>

      <div className="row row-tight">
        {yellows.map((ch, i) => (
          <input
            key={i}
            ref={(el) => {yellowRefs.current[i] = el}}
            className="box yellow"
            value={ch.toUpperCase()}
            onChange={(e) => onYellow(i, e.target.value)}
            onKeyDown={onKeyNav("yellow", i)}
          />
        ))}
      </div>

      <div className="row">
        <input
          className="box gray long"
          placeholder="Incorrect letters"
          value={grays.toUpperCase()}
          onChange={(e) => setGrays(e.target.value.toLowerCase())}
        />
      </div>

      <button className="btn" onClick={() => setShowResults((s) => !s)}>
        {showResults ? "Hide results" : "Show results"}
      </button>

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
  return [...word].filter((c) => c === ch).length;
}
