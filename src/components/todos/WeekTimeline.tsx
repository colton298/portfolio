import { parseISODateLocal } from "./date"; 
type Item = {
  id: string;
  text: string;
  done?: boolean;
  start?: string | null; // "HH:MM"
  end?: string | null;   // "HH:MM"
};

function fmtTime(hhmm?: string | null) {
  if (!hhmm) return "";
  const [h, m] = (hhmm || "").split(":").map(Number);
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function fmtRange(start?: string | null, end?: string | null) {
  if (!start && !end) return "";
  if (start && !end) return fmtTime(start);
  if (!start && end) return fmtTime(end);
  return `${fmtTime(start)}–${fmtTime(end)}`;
}

export default function WeekTimeline({
  days,
  itemsByDate,
}: {
  days: string[];
  itemsByDate: Record<string, Item[]>;
}) {
  return (
    <div className="week-grid">
      {days.map((iso) => {
        const date = parseISODateLocal(iso);
        const items = (itemsByDate[iso] || []).slice().sort((a, b) => {
          const aa = a.start ?? "99:99";
          const bb = b.start ?? "99:99";
          return aa.localeCompare(bb) || a.text.localeCompare(b.text);
        });

        return (
          <div key={iso} className="week-col">
            <div className="week-col-header">
              {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </div>

            <ul className="week-list">
              {items.length === 0 && <li className="muted small">—</li>}

              {items.map((it) => (
                <li
                  key={it.id}
                  className={`week-list-item ${it.done ? "done" : ""}`}
                  title={it.text}
                >
                  <div className="week-card" role="group" aria-label={`${it.text} at ${fmtRange(it.start, it.end)}`}>
                    <span className="text">{it.text}</span>
                    <span className="time">{fmtRange(it.start, it.end)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
