import React from "react";

/**
 * DayTimeline (responsive, fills parent)
 * - Time ranges = rounded bars. Single times = triangle pins (or 🐱 in pink mode).
 * - Legend shows circle/triangle (or ❤️/🐱 in pink mode).
 * - End label shows 12a (not 12p) at midnight.
 *
 * Props:
 *   items: { id: string; text: string; done?: boolean;
 *            time?: string|null; start?: string|null; end?: string|null }[]
 *   theme?: "dark" | "light" | "pink"
 */
type Item = {
  id: string;
  text: string;
  start?: string | null; // HH:MM
  end?: string | null;   // HH:MM
  time?: string | null;  // single time
  done?: boolean;
};

type Props = {
  items: Item[];
  theme?: "dark" | "light" | "pink";
};

const DAY_MIN = 0;
const DAY_MAX = 24 * 60;

function toMin(hhmm: string | null | undefined): number | null {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export default function DayTimeline({ items, theme = "dark" }: Props) {
  


  const PAD_X = 32;
  const PAD_Y = 22;
  const TRACK_TOP = 60;
  const TRACK_H = 100;

  const hours = Array.from({ length: 25 }, (_, i) => i); // 0..24 inclusive
  
  const VB_W = 1200;
  const innerW = VB_W - PAD_X * 2;
  const xAt = (mins: number) =>
    PAD_X + (clamp(mins, DAY_MIN, DAY_MAX) / DAY_MAX) * innerW;

  const isPink = theme === "pink";

  const c = {
    bg: "var(--surface-2)",
    railStroke: "#2a2f3c",
    grid: "#1f2431",
    text: "var(--text)",
    muted: "var(--muted)",
    barFill: isPink ? "#ff7abf" : "#6366f1",
    barFillDone: isPink ? "#d48db0" : "#475569",
    barStroke: "#1f2431",
    pinFill: isPink ? "#ff9ad1" : "#22c55e",
  };

  type Range = { x1: number; x2: number; y: number; text: string; done?: boolean };
  const ranges: Range[] = [];
  const pins: { x: number; text: string; done?: boolean }[] = [];

  // Normalize inputs
  for (const it of items) {
    const s = toMin(it.start ?? null);
    const e = toMin(it.end ?? null);
    const t = toMin(it.time ?? null);

    if (s != null && e != null) {
      ranges.push({
        x1: xAt(s),
        x2: xAt(Math.max(e, s + 1)),
        y: 0,
        text: it.text,
        done: it.done,
      });
    } else if (t != null) {
      pins.push({ x: xAt(t), text: it.text, done: it.done });
    }
  }

  // Lane assignment to avoid overlap
  
  const laneEndXs: number[] = [];
    for (const r of ranges.sort((a, b) => a.x1 - b.x1)) {
      let lane = 0;
      while (lane < laneEndXs.length && r.x1 < laneEndXs[lane] + 8) lane++;
      laneEndXs[lane] = r.x2;
      r.y = TRACK_TOP + 12 + lane * 28;
    }


const lanes = Math.max(1, laneEndXs.length);
const VB_H = 220 + lanes * 28; // base + per-lane growth

  const pinY = TRACK_TOP - 8;


  
  return (
    <div className="timeline-card">
      <svg
        className="timeline-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        aria-label="Day timeline"
      >
        {/* Panel background */}
        <rect
          x="1" y="1" width={VB_W - 2} height={VB_H - 2}
          rx="16" ry="16" fill={c.bg} stroke={c.railStroke}
        />

        {/* Rail */}
        <rect
          x={PAD_X} y={TRACK_TOP} width={innerW} height={TRACK_H}
          rx="10" ry="10" fill="transparent" stroke={c.railStroke}
        />

        {/* Grid + hour labels */}
        {hours.map((h) => {
          const x = xAt(h * 60);
          const label =
            h === 0 || h === 24 ? "12a" :
            h < 12 ? `${h}a` :
            h === 12 ? "12p" : `${h - 12}p`;

          return (
            <g key={h}>
              <line x1={x} x2={x} y1={TRACK_TOP} y2={TRACK_TOP + TRACK_H} stroke={c.grid} strokeWidth="1" />
              <text x={x} y={TRACK_TOP - 18} textAnchor="middle" fontSize="14" fill={c.muted}>
                {label}
              </text>
            </g>
          );
        })}

        {/* Ranges (bars) */}
        {ranges.map((r, i) => {
          const w = Math.max(6, r.x2 - r.x1);
          const fill = r.done ? c.barFillDone : c.barFill;
          return (
            <g key={`range-${i}`}>
              <rect x={r.x1} y={r.y} width={w} height={22} rx={8} ry={8} fill={fill} stroke={c.barStroke} />
              {w > 46 && (
                <text x={r.x1 + 6} y={r.y + 15} fontSize="12" fill="#fff" style={{ pointerEvents: "none" }}>
                  {r.text.slice(0, 40)}
                </text>
              )}
            </g>
          );
        })}

        {/* Pins */}
        {pins.map((p, i) => {
          if (isPink) {
            return (
              <text
                key={`pin-${i}`}
                x={p.x}
                y={pinY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={16}
                aria-label="Set time"
              >
                🐱
              </text>
            );
          }
          const s = 8;
          return (
            <polygon
              key={`pin-${i}`}
              points={`${p.x},${pinY - s} ${p.x - s},${pinY + s} ${p.x + s},${pinY + s}`}
              fill={c.pinFill}
              stroke={c.barStroke}
            />
          );
        })}

        {/* Legend */}
        <g transform={`translate(${PAD_X}, ${VB_H - PAD_Y - 8})`}>
          {isPink ? (
            <>
              {/* heart = time range */}
              <text x="0" y="4" textAnchor="middle" fontSize="16">❤️</text>
              <text x="16" y="4" fontSize="14" fill={c.muted}>Time range</text>

              {/* cat = set time */}
              <text x="122" y="4" textAnchor="middle" fontSize="16">🐱</text>
              <text x="138" y="4" fontSize="14" fill={c.muted}>Set time</text>
            </>
          ) : (
            <>
              <circle cx="0" cy="0" r="6" fill={c.barFill} />
              <text x="12" y="4" fontSize="14" fill={c.muted}>Time range</text>
              <polygon transform="translate(110,-4)" points={`0,-6 -6,6 6,6`} fill={c.pinFill} stroke={c.barStroke} />
              <text x="124" y="4" fontSize="14" fill={c.muted}>Set time</text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
