import { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../auth/AuthProvider";
import FirstVisitNotice from "../common/FirstVisitNotice";

import type { TableauCard, Card } from "./types";
import { buildDeck, shuffle, isAdjacentRank } from "./deck";
import TPCard from "./TPCard";
import { row0, row1, row2, row3, childrenMap, row0Starts, row1Starts, row2Starts, row3Starts } from "./layout";
import { CARDGAME_CSS } from "./styles";
import { fetchHighScore, maybeSaveHighScore } from "./storage";

export default function CardGame() {
  const { user } = useAuth();
  const [tableau, setTableau] = useState<TableauCard[]>([]);
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [saving, setSaving] = useState(false);

  // Load high score
  useEffect(() => {
    (async () => {
      const hs = await fetchHighScore(user ?? null);
      setHighScore(hs);
    })();
  }, [user]);

  // New game
  const dealNewGame = useCallback(() => {
    const deck = shuffle(buildDeck());
    const table: TableauCard[] = [];
    for (let i = 0; i < 28; i++) table.push({ card: deck[i], removed: false });
    setTableau(table);
    setStock(deck.slice(28));
    setWaste([]);
    setScore(0);
    setStreak(0);
    setStatus("playing");
  }, []);
  useEffect(() => { dealNewGame(); }, [dealNewGame]);

  const wasteTop = waste[waste.length - 1];

  // Uncovered?
  const isUncovered = (idx: number) =>
  childrenMap[idx]?.every((c) => tableau[c] && tableau[c].removed);


  // Can play
  const canPlayIndex = (idx: number) => {
    const t = tableau[idx];
    return !!t && !t.removed && isUncovered(idx) && wasteTop && isAdjacentRank(t.card.rank, wasteTop.rank);
  };

  // Click tableau
  const playIndex = (idx: number) => {
    if (status !== "playing" || !canPlayIndex(idx)) return;
    setTableau((arr) => {
      const next = arr.slice();
      next[idx] = { ...next[idx], removed: true };
      return next;
    });
    setWaste((w) => [...w, tableau[idx].card]);
    setScore((s) => s + 15 + Math.max(0, streak * 5));
    setStreak((x) => x + 1);
    setTimeout(() => {
      const remaining = tableau.filter((t, i) => i !== idx && !t.removed).length;
      if (remaining === 0) setStatus("won");
    }, 0);
  };

  const dealFromStock = () => {
    if (status !== "playing" || stock.length === 0) return;
    const c = stock[0];
    setStock((s) => s.slice(1));
    setWaste((w) => [...w, c]);
    setStreak(0);
  };

  useEffect(() => {
  // assert every upper has exactly 2 children except the base row
  const problems: number[] = [];
  [...row0, ...row1, ...row2].forEach(i => {
    if ((childrenMap[i] ?? []).length !== 2) problems.push(i);
  });
  if (problems.length) {
    // eslint-disable-next-line no-console
    console.warn("Coverage geometry mismatch at indices:", problems);
  }
}, []);


  // Lose detection
  useEffect(() => {
    if (status !== "playing") return;
    const anyPlayable =
      tableau.some((t, i) => !t.removed && isUncovered(i) && wasteTop && isAdjacentRank(t.card.rank, wasteTop.rank));
    if (!anyPlayable && stock.length === 0) setStatus("lost");
  }, [tableau, stock, wasteTop, status]);

  // Persist end-of-game score
  useEffect(() => {
    if (status === "playing") return;
    (async () => {
      const final = score;
      if (final > highScore) {
        setSaving(true);
        const ok = await maybeSaveHighScore(user ?? null, final);
        if (ok) setHighScore(final);
        setSaving(false);
      }
    })();
  }, [status, score, highScore, user]);

  const playableSet = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i < tableau.length; i++) if (canPlayIndex(i)) s.add(i);
    return s;
  }, [tableau, wasteTop]);

  const subtitle = user?.email ? `Logged in as ${user.email}` : "Not signed in";

  return (
    <section className="page">
      <Helmet>
        <title>Tri Peaks Solitaire</title>
        <meta name="description" content="Tri Peaks Solitaire with correct peak geometry, comfortable spacing, and Firebase scores." />
      </Helmet>

      <FirstVisitNotice storageKey="tripeaks-welcome-v1">
        <h3 style={{ marginTop: 0 }}>How to play Tri Peaks</h3>
        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
          <li>Try to pick up all cards from the three piles.</li>
          <li>A card can be picked up if your currently held card is one rank higher or lower than it, and if it is not covered by another card.</li>
          <li>Picking up a card makes that card your currently held card.</li>
          <li>If you cannot play, you can deal from the stock, but only a limited number of times.</li>
        </ul>
        <p>Note: This game is much easier to play on large screens, rather than on mobile.</p>
        <p style={{ marginTop: "0.75rem" }}>
          Tip: playable cards are highlighted. Click × to start.
        </p>
      </FirstVisitNotice>

      <h2>Tri Peaks Solitaire</h2>
      <p className="muted">{subtitle}</p>

      <div className="felt card tp-container">
        {/* Tableau */}
        <div className="tp-grid">
          {row0.map((i, n) => {
            const t = tableau[i];
            const facedown = !!t && !t.removed && !isUncovered(i);
            const disabled = !t || t.removed || facedown || !canPlayIndex(i);
            const highlight = playableSet.has(i);
            return (
              <TPCard
                key={i}
                t={t}
                facedown={facedown}
                onClick={() => playIndex(i)}
                disabled={disabled}
                highlight={highlight}
                style={{ gridColumn: `${row0Starts[n]} / span 2`, gridRow: "1" }}
              />
            );
          })}

          {row1.map((i, n) => {
            const t = tableau[i];
            const facedown = !!t && !t.removed && !isUncovered(i);
            const disabled = !t || t.removed || facedown || !canPlayIndex(i);
            const highlight = playableSet.has(i);
            return (
              <TPCard
                key={i}
                t={t}
                facedown={facedown}
                onClick={() => playIndex(i)}
                disabled={disabled}
                highlight={highlight}
                style={{ gridColumn: `${row1Starts[n]} / span 2`, gridRow: "2" }}
              />
            );
          })}

          {row2.map((i, n) => {
            const t = tableau[i];
            const facedown = !!t && !t.removed && !isUncovered(i);
            const disabled = !t || t.removed || facedown || !canPlayIndex(i);
            const highlight = playableSet.has(i);
            return (
              <TPCard
                key={i}
                t={t}
                facedown={facedown}
                onClick={() => playIndex(i)}
                disabled={disabled}
                highlight={highlight}
                style={{ gridColumn: `${row2Starts[n]} / span 2`, gridRow: "3" }}
              />
            );
          })}

          {row3.map((i, n) => {
            const t = tableau[i];
            const facedown = false;
            const disabled = !t || t.removed || facedown || !canPlayIndex(i);
            const highlight = playableSet.has(i);
            return (
              <TPCard
                key={i}
                t={t}
                facedown={facedown}
                onClick={() => playIndex(i)}
                disabled={disabled}
                highlight={highlight}
                style={{ gridColumn: `${row3Starts[n]} / span 2`, gridRow: "4" }}
              />
            );
          })}
        </div>

        {/* Stock / Waste (centered waste) */}
        <div className="stockbar">
          <button className="button left" onClick={dealFromStock} disabled={status !== "playing" || stock.length === 0}>
            Deal from Stock ({stock.length})
          </button>

          <div className="waste">
            {wasteTop ? (
              <TPCard
                t={{ card: wasteTop, removed: false }}
                facedown={false}
                onClick={() => {}}
                disabled={true}
                highlight={false}
              />
            ) : (
              <div className="tp-card faceup">—</div>
            )}
          </div>

          <button className="button outline right" onClick={dealNewGame} disabled={saving}>
            New Game
          </button>
        </div>
      </div>

      {/* Score / Status */}
      <div className="card" style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 12 }}>
        <div>Score: <strong>{score}</strong></div>
        <div>Streak: <strong>{streak}</strong></div>
        <div>Best: <strong>{highScore}</strong></div>
        {status !== "playing" && (
          <div style={{ marginLeft: "auto" }}>
            {status === "won" ? "You cleared all peaks!" : "Out of moves."} {saving ? "Saving…" : ""}
            <button className="button" onClick={dealNewGame} style={{ marginLeft: 12 }} disabled={saving}>
              Play Again
            </button>
          </div>
        )}
      </div>

      <style>{CARDGAME_CSS}</style>
    </section>
  );
}
