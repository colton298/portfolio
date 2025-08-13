import React, { useMemo } from "react";
import "./day-timeline.css";

type TimelineItem = {
  id: string;
  text: string;
  done?: boolean;
  // One of:
  time?: string | null;        // e.g., "14:30"  (milestone)
  start?: string | null;       // e.g., "09:00"  (time range)
  end?: string | null;         // e.g., "10:45"
};

type Props = {
  items: TimelineItem[];
  // Optional: show hour grid (default true)
  showGrid?: boolean;
};

const DAY_MIN = 24 * 60;

function toMinutes(hhmm?: string | null) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

/** Assign items to rows (lanes) to avoid overlaps */
function computeLanes(rangeItems: Array<{ startMin: number; endMin: number; i: number }>) {
  // Greedy lane packing
  // Each lane keeps the latest end time in that lane
  const lanes: number[][] = [];     // lane -> item indices
  const laneEnds: number[] = [];    // lane -> last endMin

  for (const it of rangeItems) {
    let placed = false;
    for (let l = 0; l < laneEnds.length; l++) {
      if (it.startMin >= laneEnds[l] - 0.5 /* fudge */) {
        lanes[l].push(it.i);
        laneEnds[l] = it.endMin;
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes.push([it.i]);
      laneEnds.push(it.endMin);
    }
  }

  // Map item index -> lane number
  const laneOf: Record<number, number> = {};
  lanes.forEach((arr, lane) => arr.forEach((idx) => (laneOf[idx] = lane)));
  return { laneOf, laneCount: lanes.length || 1 };
}

export default function DayTimeline({ items, showGrid = true }: Props) {
  // Robust dependency: recompute if any relevant field changes
  const depKey = useMemo(
    () => items.map(i => `${i.id}|${i.time ?? ""}|${i.start ?? ""}|${i.end ?? ""}|${i.done ? 1 : 0}`).join(","),
    [items]
  );

  // Normalize items into milestones & ranges
  const normalized = useMemo(() => {
    const milestones: Array<{
      i: number; id: string; text: string; done?: boolean; min: number;
    }> = [];
    const ranges: Array<{
      i: number; id: string; text: string; done?: boolean; startMin: number; endMin: number;
    }> = [];

    items.forEach((t, i) => {
      const timeMin = toMinutes(t.time ?? undefined);
      const startMin = toMinutes(t.start ?? undefined);
      const endMin = toMinutes(t.end ?? undefined);

      if (startMin != null && endMin != null) {
        // Ensure minimum duration for visibility
        const s = Math.max(0, Math.min(DAY_MIN, startMin));
        const e = Math.max(0, Math.min(DAY_MIN, endMin));
        const start = Math.min(s, e);
        const end = Math.max(s, e);
        // if duration is zero, render as milestone instead
        if (end - start < 8) {
          milestones.push({ i, id: t.id, text: t.text, done: t.done, min: start });
        } else {
          ranges.push({ i, id: t.id, text: t.text, done: t.done, startMin: start, endMin: end });
        }
      } else if (timeMin != null) {
        milestones.push({ i, id: t.id, text: t.text, done: t.done, min: Math.max(0, Math.min(DAY_MIN, timeMin)) });
      }
    });

    // Sort for consistent lane packing
    ranges.sort((a, b) => (a.startMin - b.startMin) || (a.endMin - b.endMin));
    const { laneOf, laneCount } = computeLanes(ranges);

    return { milestones, ranges, laneOf, laneCount };
  }, [depKey]); // <- recompute on edits

  const hourTicks = Array.from({ length: 25 }, (_, h) => ({
    h,
    xPct: (h * 60) / DAY_MIN * 100,
    label: ((h + 11) % 12) + 1 + (h < 12 ? "a" : "p")
  }));

  // Layout
  const laneHeight = 26;     // px per lane
  const milLaneHeight = 20;  // px, milestones sit below ranges
  const paddingTop = 8;
  const paddingBottom = 8;
  const rangesHeight = Math.max(1, normalized.laneCount) * laneHeight;
  const milestonesY = paddingTop + rangesHeight + 20; // a bit of gap
  const totalHeight = milestonesY + milLaneHeight + paddingBottom;

  return (
    <div className="timeline">
      <div className="day-timeline">
        <svg
          className="day-timeline-svg"
          viewBox={`0 0 100 ${totalHeight}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="Day timeline"
        >
          {/* Background track */}
          <rect x={0} y={paddingTop} width={100} height={rangesHeight} rx={2} className="tl-track" />

          {/* Hour grid */}
          {showGrid && hourTicks.map((t) => (
            <g key={`grid-${t.h}`}>
              <line
                x1={t.xPct}
                y1={paddingTop}
                x2={t.xPct}
                y2={paddingTop + rangesHeight}
                className={`tl-grid ${t.h % 6 === 0 ? "major" : ""}`}
              />
              {t.h % 3 === 0 && t.h > 0 && t.h < 24 && (
                <text x={t.xPct} y={paddingTop - 2} className="tl-hour" textAnchor="middle">
                  {t.label}
                </text>
              )}
            </g>
          ))}

          {/* Range bars */}
          {normalized.ranges.map((r) => {
            const lane = normalized.laneOf[r.i] ?? 0;
            const y = paddingTop + lane * laneHeight + 4;
            const x = clamp01(r.startMin / DAY_MIN) * 100;
            const w = clamp01((r.endMin - r.startMin) / DAY_MIN) * 100;
            return (
              <g key={`range-${r.id}`} className={`tl-item ${r.done ? "done" : ""}`}>
                <rect x={x} y={y} width={Math.max(w, 0.7)} height={laneHeight - 8} rx={3} className="tl-bar" />
                <text x={x + 0.6} y={y + laneHeight / 2 + 4} className="tl-label" textAnchor="start">
                  {r.text}
                </text>
              </g>
            );
          })}

          {/* Milestones (diamonds) */}
          {normalized.milestones.map((m) => {
            const x = clamp01(m.min / DAY_MIN) * 100;
            const y = milestonesY;
            const s = 3.5; // diamond half-size
            return (
              <g key={`mil-${m.id}`} className={`tl-item ${m.done ? "done" : ""}`}>
                <polygon
                  points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`}
                  className="tl-milestone"
                />
                <text x={x} y={y + 12} className="tl-mil-label" textAnchor="middle">
                  {m.text}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="tl-legend">
          <span className="legend-box range" /> Time range
          <span className="legend-dot" /> Set time
        </div>
      </div>
    </div>
  );
}
