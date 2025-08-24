import { useEffect, useMemo, useState, useCallback, type CSSProperties } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../auth/AuthProvider";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import FirstVisitNotice from "../components/common/FirstVisitNotice";

/** ---------- Card / Deck helpers ---------- */
type Suit = "♠" | "♥" | "♦" | "♣";
type Card = { rank: 1|2|3|4|5|6|7|8|9|10|11|12|13; suit: Suit; id: string };
const suitSymbols: Suit[] = ["♠", "♥", "♦", "♣"];
const rankLabel = (r: number) => (r === 1 ? "A" : r === 11 ? "J" : r === 12 ? "Q" : r === 13 ? "K" : String(r));

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suitSymbols) {
    for (let r = 1 as Card["rank"]; r <= 13; r++) {
      const id = `${r}${suit}-${Math.random().toString(36).slice(2, 8)}`;
      deck.push({ rank: r as Card["rank"], suit, id });
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
  if (a === 13 && b === 1) return true;
  if (a === 1 && b === 13) return true;
  return Math.abs(a - b) === 1;
}

/** ---------- TriPeaks index model (logic) ---------- */
const row0 = [0, 1, 2];                               // top row (3)
const row1 = [3, 4, 5, 6, 7, 8];                      // 2nd row (6)
const row2 = [9,10,11,12,13,14,15,16,17];             // 3rd row (9)
const row3 = [18,19,20,21,22,23,24,25,26,27];         // base row (10)

const childrenMap: Record<number, number[]> = (() => {
  const m: Record<number, number[]> = {};
  const set = (i: number, kids: number[]) => (m[i] = kids);
  // Row0 -> Row1
  set(0, [3, 4]); set(1, [5, 6]); set(2, [7, 8]);
  // Row1 -> Row2
  set(3, [9,10]); set(4, [10,11]); set(5, [11,12]); set(6, [12,13]); set(7, [13,14]); set(8, [14,15]);
  // Row2 -> Row3
  set(9,[18,19]); set(10,[19,20]); set(11,[20,21]); set(12,[21,22]); set(13,[22,23]);
  set(14,[23,24]); set(15,[24,25]); set(16,[25,26]); set(17,[26,27]);
  // Row3 -> none
  for (const i of row3) set(i, []);
  return m;
})();

type TableauCard = { card: Card; removed: boolean };

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

  /** Load high score */
  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const ref = doc(db, "users", user.uid, "games", "tripeaks");
        const snap = await getDoc(ref);
        const hs = snap.exists() ? Number(snap.data()?.highScore ?? 0) : 0;
        setHighScore(Number.isFinite(hs) ? hs : 0);
      } catch {
        // ignore
      }
    })();
  }, [user]);

  /** New game */
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

  /** Uncovered? */
  const isUncovered = (idx: number) => childrenMap[idx].every((c) => tableau[c]?.removed);

  /** Can play */
  const canPlayIndex = (idx: number) => {
    const t = tableau[idx];
    return !!t && !t.removed && isUncovered(idx) && wasteTop && isAdjacentRank(t.card.rank, wasteTop.rank);
  };

  /** Click tableau */
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

  /** Lose detection */
  useEffect(() => {
    if (status !== "playing") return;
    const anyPlayable =
      tableau.some((t, i) => !t.removed && isUncovered(i) && wasteTop && isAdjacentRank(t.card.rank, wasteTop.rank));
    if (!anyPlayable && stock.length === 0) setStatus("lost");
  }, [tableau, stock, wasteTop, status]);

  /** Persist end-of-game score */
  useEffect(() => {
    if (!user || status === "playing") return;
    (async () => {
      try {
        const final = score;
        if (final > highScore) {
          setSaving(true);
          const ref = doc(db, "users", user.uid, "games", "tripeaks");
          await setDoc(ref, { highScore: final, updatedAt: serverTimestamp() }, { merge: true });
          setHighScore(final);
        }
      } finally {
        setSaving(false);
      }
    })();
  }, [status, score, highScore, user]);

  /** Layout helpers for grid columns */
  const row0Starts = [4, 10, 16];
  const row1Starts = [3,5,9,11,15,17];
  const row2Starts = [2,4,6,8,10,12,14,16,18];
  const row3Starts = [1,3,5,7,9,11,13,15,17,19];

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

      <style>{`
        .felt { background: #2d7a38 radial-gradient(ellipse at 50% 50%, #3aa047 0%, #226c30 70%) no-repeat; }

        /* Container-scoped size variables so stock/waste match tableau */
        .tp-container {
          position: relative;
          padding: 24px;
          padding-bottom: 48px;
          --card-w: 78px;
          --card-h: 108px;
          --half: calc(var(--card-w) / 2);
          --col-gap: 14px;
          --row-gap: 26px;
          --overlap-step: 16px;
        }

        .tp-grid  { position: relative; z-index: 1; }

        /* ==== Controls row (center the waste exactly) ==== */
        .stockbar {
          position: relative;
          z-index: 5;
          display: grid;
          grid-template-columns: 1fr var(--card-w) 1fr;
          align-items: center;
          column-gap: 16px;
          justify-items: stretch;
          /* keep a comfortable gap under the tableau */
          margin-top: calc(var(--card-h) - var(--row-gap) + (var(--overlap-step) * 2) + 24px);
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .stockbar .left  { justify-self: end; }
        .stockbar .right { justify-self: start; }

        .stockbar .waste {
          width: var(--card-w);
          height: var(--card-h);
          display: flex;
          align-items: center;
          justify-content: center;
          /* middle column, fixed width = perfectly centered under the middle peak */
          grid-column: 2;
        }
        /* Neutralize tableau overlap for controls row */
        .stockbar .tp-card { transform: none; }

        /* Tableau grid (19 columns; each card spans 2) */
        .tp-grid {
          --card-w: 78px;
          --card-h: 108px;
          --half: calc(var(--card-w) / 2);
          --col-gap: 14px;
          --row-gap: 26px;
          --overlap-step: 16px;

          display: grid;
          grid-template-columns: repeat(19, var(--half));
          grid-template-rows: repeat(4, var(--row-gap));
          justify-content: center;
          column-gap: var(--col-gap);
          row-gap: var(--row-gap);
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Card base */
        .tp-card {
          width: var(--card-w);
          height: var(--card-h);
          border-radius: 12px;
          box-shadow: 0 10px 18px rgba(0,0,0,0.35);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          letter-spacing: 0.5px;
          user-select: none;
          transform: translateY(calc(-1 * var(--overlap-step)));
          transition: transform 120ms ease, opacity 120ms ease;
        }
        .tp-card.faceup { background: var(--panel, #111); }
        .tp-card.facedown {
          background:
            linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.06) 75%),
            linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.06) 75%);
          background-size: 12px 12px;
          background-position: 0 0, 6px 6px;
          background-color: #2a2a5a;
        }
        .tp-card.playable { outline: 2px solid var(--accent, #6cf); cursor: pointer; }
        .tp-card.disabled { opacity: 0.35; cursor: default; }
        .tp-card.removed { visibility: hidden; }
        .tp-card.playable:hover { transform: translateY(calc(-1 * var(--overlap-step) - 3px)) !important; }
      `}</style>
    </section>
  );
}

/** ---------- Presentational Card ---------- */
function TPCard({
  t,
  facedown,
  onClick,
  disabled,
  highlight,
  style,
}: {
  t?: { card: Card; removed: boolean };
  facedown: boolean;
  onClick: () => void;
  disabled: boolean;
  highlight: boolean;
  style?: CSSProperties;
}) {
  if (!t) {
    return <div className="tp-card facedown disabled" style={style}></div>;
  }

  const cls = [
    "tp-card",
    facedown ? "facedown" : "faceup",
    disabled ? "disabled" : "",
    highlight && !disabled && !facedown ? "playable" : "",
    t.removed ? "removed" : "",
  ].filter(Boolean).join(" ");

  const label = !facedown && !t.removed ? `${rankLabel(t.card.rank)}${t.card.suit}` : "";

  return (
    <div
      className={cls}
      style={style}
      onClick={!disabled && !t.removed && !facedown ? onClick : undefined}
      role="button"
      aria-disabled={disabled || facedown || t.removed}
      aria-label={label}
      title={facedown ? "Covered" : label}
    >
      {label}
    </div>
  );
}
