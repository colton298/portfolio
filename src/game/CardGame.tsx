import { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../auth/AuthProvider";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Tri Peaks Solitaire
 * - Tableau: 28 cards arranged as 3 peaks (rows: 3, 6, 9, 10)
 * - Stock/Waste: remaining 24 cards in stock; waste starts with one flipped card
 * - Move rule: You may move an UNCOVERED tableau card to the waste if its rank is +1 or -1 from waste top (wrap K<->A)
 * - A tableau card is UNCOVERED when both cards that overlap it (its "children" below) have been removed (or it has no children)
 * - Goal: clear all 28 tableau cards
 *
 * Scoring (simple):
 *  +15 points per cleared card
 *  +5 points per consecutive run (streak) beyond the first (i.e., 0, +5, +10, ...)
 *  -0 for dealing from stock (no penalty in this simple version)
 */

// ----- Card helpers -----
type Suit = "♠" | "♥" | "♦" | "♣";
type Card = { rank: 1|2|3|4|5|6|7|8|9|10|11|12|13; suit: Suit; id: string };
const suitSymbols: Suit[] = ["♠", "♥", "♦", "♣"];
const rankLabel = (r: number) => (r === 1 ? "A" : r === 11 ? "J" : r === 12 ? "Q" : r === 13 ? "K" : String(r));

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suitSymbols) {
    for (let r = 1 as Card["rank"]; r <= 13; r++) {
      deck.push({ rank: r as Card["rank"], suit, id: `${suit}-${r}-${Math.random().toString(36).slice(2)}` });
    }
  }
  return deck;
}
function shuffle<T>(a: T[]): T[] {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function isAdjacentRank(a: number, b: number) {
  // Wrap K <-> A
  if (a === 13 && b === 1) return true;
  if (a === 1 && b === 13) return true;
  return Math.abs(a - b) === 1;
}

// ----- TriPeaks layout -----
// Indices: 0..27 (28 tableau cards)
// Rows: [0..2], [3..8], [9..17], [18..27]
const row0 = [0, 1, 2];
const row1 = [3, 4, 5, 6, 7, 8];
const row2 = [9,10,11,12,13,14,15,16,17];
const row3 = [18,19,20,21,22,23,24,25,26,27];

// For each tableau index, list the children it covers (down-left & down-right).
const childrenMap: Record<number, number[]> = (() => {
  const m: Record<number, number[]> = {};
  const set = (i: number, kids: number[]) => (m[i] = kids);

  // Row0 -> Row1
  set(0, [3, 4]);
  set(1, [5, 6]);
  set(2, [7, 8]);

  // Row1 -> Row2
  set(3, [9, 10]);
  set(4, [10, 11]);
  set(5, [12, 13]);
  set(6, [13, 14]);
  set(7, [15, 16]);
  set(8, [16, 17]);

  // Row2 -> Row3
  set(9,  [18, 19]);
  set(10, [19, 20]);
  set(11, [20, 21]);
  set(12, [21, 22]);
  set(13, [22, 23]);
  set(14, [23, 24]);
  set(15, [24, 25]);
  set(16, [25, 26]);
  set(17, [26, 27]);

  // Row3 (base) -> no children
  for (const i of row3) set(i, []);

  return m;
})();

type TableauCard = { card: Card; removed: boolean };

// ----- Component -----
export default function CardGame() {
  const { user } = useAuth(); // console.log LOCATION #TP1: auth in game
  console.log("[TriPeaks] user:", user?.uid, user?.email);

  const [tableau, setTableau] = useState<TableauCard[]>([]);
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [saving, setSaving] = useState(false);

  // Load high score once
  useEffect(() => {
    // console.log LOCATION #TP2: load high score from Firestore
    (async () => {
      if (!user) return;
      try {
        const ref = doc(db, "users", user.uid, "games", "tripeaks");
        const snap = await getDoc(ref);
        const hs = snap.exists() ? Number(snap.data()?.highScore ?? 0) : 0;
        setHighScore(hs);
        console.log("[TriPeaks] loaded highScore:", hs);
      } catch (e) {
        console.error("[TriPeaks] failed to load highScore", e);
      }
    })();
  }, [user]);

  const dealNewGame = useCallback(() => {
    console.log("[TriPeaks] new game");
    const deck = shuffle(buildDeck());
    const tableauCards = deck.slice(0, 28).map((card) => ({ card, removed: false }));
    const remaining = deck.slice(28);
    // Waste starts with one card
    const firstWaste = remaining.shift()!;
    setTableau(tableauCards);
    setStock(remaining);
    setWaste([firstWaste]);
    setScore(0);
    setStreak(0);
    setStatus("playing");
  }, []);

  // initial deal
  useEffect(() => {
    dealNewGame();
  }, [dealNewGame]);

  const wasteTop = waste[waste.length - 1];

  // Determine if a tableau index is UNCOVERED (no children remaining)
  const isUncovered = (idx: number) => {
    const kids = childrenMap[idx];
    return kids.length === 0 || kids.every((k) => tableau[k]?.removed);
  };

  const canPlayIndex = (idx: number) => {
    const t = tableau[idx];
    if (!t || t.removed || status !== "playing") return false;
    if (!isUncovered(idx)) return false;
    if (!wasteTop) return false;
    return isAdjacentRank(t.card.rank, wasteTop.rank);
  };

  const playIndex = (idx: number) => {
    // console.log LOCATION #TP3: attempt move
    if (!canPlayIndex(idx)) return;
    const t = tableau[idx];
    console.log("[TriPeaks] play", idx, t.card);

    // Move to waste
    setTableau((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx], removed: true };
      return next;
    });
    setWaste((w) => [...w, tableau[idx].card]);

    // Score: +15 per card + streak bonus (+5 per card after the first in a run)
    setScore((s) => s + 15 + Math.max(0, streak * 5));
    setStreak((x) => x + 1);

    // Win check
    setTimeout(() => {
      const remaining = (tableau.filter((t, i) => i !== idx && !t.removed).length);
      if (remaining === 0) {
        setStatus("won");
      }
    }, 0);
  };

  const dealFromStock = () => {
    // console.log LOCATION #TP4: deal from stock
    if (status !== "playing" || stock.length === 0) return;
    const c = stock[0];
    setStock((s) => s.slice(1));
    setWaste((w) => [...w, c]);
    setStreak(0); // streak resets when you draw
    // Lose check (no moves & no stock) is handled below in an effect
  };

  // Lose detection: if no stock left and no playable tableau cards
  useEffect(() => {
    if (status !== "playing") return;
    const anyPlayable =
      tableau.some((t, i) => !t.removed && isUncovered(i) && wasteTop && isAdjacentRank(t.card.rank, wasteTop.rank));
    if (!anyPlayable && stock.length === 0) {
      setStatus("lost");
    }
  }, [tableau, stock, wasteTop, status]);

  // Persist score on game end
  useEffect(() => {
    if (!user || status === "playing") return;
    // console.log LOCATION #TP5: persist end-of-game score
    (async () => {
      try {
        setSaving(true);
        const ref = doc(db, "users", user.uid, "games", "tripeaks");
        const snap = await getDoc(ref);
        const previousHigh = snap.exists() ? Number(snap.data()?.highScore ?? 0) : 0;
        const newHigh = Math.max(previousHigh, score);
        await setDoc(
          ref,
          { highScore: newHigh, lastScore: score, updatedAt: serverTimestamp() },
          { merge: true }
        );
        setHighScore(newHigh);
        console.log("[TriPeaks] saved score", { score, newHigh });
      } catch (e) {
        console.error("[TriPeaks] failed to save score", e);
      } finally {
        setSaving(false);
      }
    })();
  }, [user, status, score]);

  const subtitle = useMemo(
    () => (user?.email ? `Logged in as ${user.email}` : ""),
    [user?.email]
  );

  // Helpful UI flags
  const playableSet = useMemo(() => {
    const s = new Set<number>();
    if (wasteTop) {
      tableau.forEach((t, i) => {
        if (!t.removed && isUncovered(i) && isAdjacentRank(t.card.rank, wasteTop.rank)) s.add(i);
      });
    }
    return s;
  }, [tableau, wasteTop]);

  return (
    <section className="page">
      <Helmet>
        <title>Tri Peaks Solitaire</title>
        <meta
          name="description"
          content="Tri Peaks Solitaire that uses the same login as the To-Do List and saves your score to Firebase."
        />
      </Helmet>

      <h2>Tri Peaks Solitaire</h2>
      <p className="muted">{subtitle}</p>

      {/* Scorebar */}
      <div className="card" style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
        <div>Score: <strong>{score}</strong></div>
        <div>Streak: <strong>{streak}</strong></div>
        <div>Best: <strong>{highScore}</strong></div>
        <div>Stock: <strong>{stock.length}</strong></div>
        <div>Waste Top: <strong>{wasteTop ? `${rankLabel(wasteTop.rank)}${wasteTop.suit}` : "—"}</strong></div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="button" onClick={dealFromStock} disabled={status !== "playing" || stock.length === 0}>
            Deal from Stock
          </button>
          <button className="button outline" onClick={dealNewGame} disabled={saving}>
            New Game
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="card" style={{ padding: 16 }}>
        <div className="tripeaks">
          {/* Row 0 */}
          <div className="tp-row tp-row0">
            {row0.map((i) => (
              <TPCard
                key={i}
                t={tableau[i]}
                onClick={() => playIndex(i)}
                disabled={!canPlayIndex(i)}
                highlight={playableSet.has(i)}
              />
            ))}
          </div>
          {/* Row 1 */}
          <div className="tp-row tp-row1">
            {row1.map((i) => (
              <TPCard
                key={i}
                t={tableau[i]}
                onClick={() => playIndex(i)}
                disabled={!canPlayIndex(i)}
                highlight={playableSet.has(i)}
              />
            ))}
          </div>
          {/* Row 2 */}
          <div className="tp-row tp-row2">
            {row2.map((i) => (
              <TPCard
                key={i}
                t={tableau[i]}
                onClick={() => playIndex(i)}
                disabled={!canPlayIndex(i)}
                highlight={playableSet.has(i)}
              />
            ))}
          </div>
          {/* Row 3 (base) */}
          <div className="tp-row tp-row3">
            {row3.map((i) => (
              <TPCard
                key={i}
                t={tableau[i]}
                onClick={() => playIndex(i)}
                disabled={!canPlayIndex(i)}
                highlight={playableSet.has(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Status */}
      {status !== "playing" && (
        <div className="card" style={{ marginTop: 12 }}>
          {status === "won" ? (
            <h3>🎉 You cleared all peaks!</h3>
          ) : (
            <h3>Out of moves.</h3>
          )}
          <p className="muted">
            Final score: <strong>{score}</strong>{saving ? " • Saving…" : ""}
          </p>
          <div style={{ marginTop: 8 }}>
            <button className="button" onClick={dealNewGame} disabled={saving}>Play Again</button>
          </div>
        </div>
      )}

      {/* Minimal styles (dark friendly) */}
      <style>{`
        .tripeaks {
          display: grid;
          gap: 8px;
        }
        .tp-row {
          display: grid;
          justify-content: center;
          gap: 8px;
          margin: 4px 0;
        }
        .tp-row0 { grid-template-columns: repeat(3, 64px); }
        .tp-row1 { grid-template-columns: repeat(6, 64px); }
        .tp-row2 { grid-template-columns: repeat(9, 64px); }
        .tp-row3 { grid-template-columns: repeat(10, 64px); }

        .tp-card {
          width: 64px;
          height: 88px;
          border-radius: 10px;
          border: 1px solid var(--border, #333);
          background: var(--panel, #111);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          user-select: none;
          transition: transform 0.08s ease;
        }
        .tp-card.playable { outline: 2px solid var(--accent, #6cf); cursor: pointer; }
        .tp-card.disabled { opacity: 0.35; cursor: default; }
        .tp-card.removed { visibility: hidden; }
      `}</style>
    </section>
  );
}

// Small presentational card
function TPCard({
  t,
  onClick,
  disabled,
  highlight,
}: {
  t?: { card: Card; removed: boolean };
  onClick: () => void;
  disabled: boolean;
  highlight: boolean;
}) {
  if (!t) return <div className="tp-card disabled" />;
  const label = `${rankLabel(t.card.rank)}${t.card.suit}`;
  const cls = [
    "tp-card",
    t.removed ? "removed" : "",
    disabled ? "disabled" : "",
    highlight && !disabled ? "playable" : "",
  ].join(" ");
  return (
    <div
      className={cls}
      onClick={!disabled && !t.removed ? onClick : undefined}
      role="button"
      aria-disabled={disabled}
      aria-label={label}
    >
      {!t.removed ? label : ""}
    </div>
  );
}
