import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../auth/AuthProvider";
import {
  Todo,
  watchTodos,
  createTodo,
  updateTodo,
  toggleTodo,
  removeTodo,
} from "../services/todos";
import DayTimeline from "../components/DayTimeline";

/* ---------------------- helpers ---------------------- */
function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayISO() { return toISODate(new Date()); }
function addDays(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + delta);
  return toISODate(dt);
}
function formatDatePretty(iso?: string | null) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
function formatTime(hhmm?: string | null) {
  if (!hhmm) return "";
  const [h, m] = (hhmm || "0:0").split(":").map(Number);
  const dt = new Date();
  dt.setHours(h ?? 0, m ?? 0, 0, 0);
  return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
function formatRange(start?: string | null, end?: string | null) {
  if (!start) return "";
  const s = formatTime(start);
  if (!end) return s;
  return `${s}–${formatTime(end)}`;
}
function cmpTime(a?: string | null, b?: string | null) {
  const aa = a ?? "99:99";
  const bb = b ?? "99:99";
  return aa.localeCompare(bb);
}
function daySort(a: Todo, b: Todo) {
  // dated first
  const aHasDate = !!a.date;
  const bHasDate = !!b.date;
  if (aHasDate && !bHasDate) return -1;
  if (!aHasDate && bHasDate) return 1;

  // primary: start time (supports legacy single `time`)
  const t1 = (a as any).timeStart ?? (a as any).time ?? null;
  const t2 = (b as any).timeStart ?? (b as any).time ?? null;
  const tcmp = cmpTime(t1, t2);
  if (tcmp !== 0) return tcmp;

  // secondary: end time
  const e1 = (a as any).timeEnd ?? null;
  const e2 = (b as any).timeEnd ?? null;
  const ecmp = cmpTime(e1, e2);
  if (ecmp !== 0) return ecmp;

  // tertiary: text
  const xa = (a.text || "").toLowerCase();
  const xb = (b.text || "").toLowerCase();
  return xa.localeCompare(xb);
}
function isValidRange(start?: string, end?: string) {
  if (!start || !end) return true;
  return start < end;
}

/* ===================================================== */

export default function TodoPage() {
  const { user } = useAuth();
  const uid = user?.uid!;

  const [todos, setTodos] = useState<Todo[]>([]);

  // --- Add form state
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState<string>("");
  const [newMode, setNewMode] = useState<"single" | "range">("single");
  const [newStart, setNewStart] = useState<string>(""); // HH:MM
  const [newEnd, setNewEnd] = useState<string>("");

  // --- View & filters
  const [viewDate, setViewDate] = useState<string>(todayISO());
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  // --- Edit row state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingDate, setEditingDate] = useState<string>("");
  const [editingMode, setEditingMode] = useState<"single" | "range">("single");
  const [editingStart, setEditingStart] = useState<string>("");
  const [editingEnd, setEditingEnd] = useState<string>("");

  // Live subscribe and normalize time fields for UI
  useEffect(() => {
    if (!uid) return;
    const stop = watchTodos(uid, (list) => {
      const normalized = list.map((t) => ({
        ...t,
        timeStart: (t as any).timeStart ?? (t as any).time ?? null,
        timeEnd: (t as any).timeEnd ?? null,
      }));
      setTodos(normalized);
    });
    return stop;
  }, [uid]);

  // current day's tasks (undated always visible)
  const dayTodos = useMemo(
    () => todos.filter((t) => (t.date ? t.date === viewDate : true)).sort(daySort),
    [todos, viewDate]
  );

  // filters
  const filtered = useMemo(() => {
    if (filter === "active") return dayTodos.filter((t) => !t.done);
    if (filter === "done") return dayTodos.filter((t) => t.done);
    return dayTodos;
  }, [dayTodos, filter]);

  // add
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;

    if (newMode === "range" && !isValidRange(newStart || "", newEnd || "")) {
      alert("End time must be after start time.");
      return;
    }

    console.log("[TodoPage] add submit", { textLen: text.length, newMode, newStart, newEnd }); // DEBUG (Todo.tsx line ~140)

    await createTodo(uid, text, {
      date: newDate || null,
      timeStart: newStart || null,
      timeEnd: newMode === "range" ? (newEnd || null) : null,
    });

    setNewText("");
    setNewDate("");
    setNewStart("");
    setNewEnd("");
    setNewMode("single");
  };

  // edit
  const beginEdit = (t: Todo) => {
    console.log("[TodoPage] begin edit:", t.id); // DEBUG (inside beginEdit)
    setEditingId(t.id!);
    setEditingText(t.text);
    setEditingDate(t.date || "");
    const s = (t as any).timeStart ?? (t as any).time ?? "";
    const e = (t as any).timeEnd ?? "";
    setEditingStart(s || "");
    setEditingEnd(e || "");
    setEditingMode(e ? "range" : "single");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const text = editingText.trim();
    if (!text) {
      await removeTodo(uid, editingId);
    } else {
      if (editingMode === "range" && !isValidRange(editingStart || "", editingEnd || "")) {
        alert("End time must be after start time.");
        return;
      }
      console.log("[TodoPage] save edit", { editingId, editingMode, editingStart, editingEnd }); // DEBUG
      await updateTodo(uid, editingId, {
        text,
        date: editingDate || null,
        timeStart: editingStart || null,
        timeEnd: editingMode === "range" ? (editingEnd || null) : null,
      });
    }
    setEditingId(null);
    setEditingText("");
    setEditingDate("");
    setEditingStart("");
    setEditingEnd("");
    setEditingMode("single");
  };

  const cancelEdit = () => {
    console.log("[TodoPage] cancel edit"); // DEBUG
    setEditingId(null);
    setEditingText("");
    setEditingDate("");
    setEditingStart("");
    setEditingEnd("");
    setEditingMode("single");
  };

  return (
    <>
      <Helmet>
        <title>My To‑Do</title>
        <meta
          name="description"
          content="Manage your tasks by day and time. Add, edit, and complete to‑dos with optional scheduling, including time ranges."
        />
      </Helmet>

      {/* -------- Full‑width timeline ABOVE the two panels -------- */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h3>Schedule for {formatDatePretty(viewDate)}</h3>

        {/* The SVG timeline is sized/styled via CSS (.timeline-svg).
            No component props needed, just feed items. */}
        <div className="timeline">
          <DayTimeline
            items={dayTodos.map((t) => ({
              id: t.id!,
              text: t.text,
              done: t.done,
              // support both range and single time (legacy)
              time: (t as any).time ?? null,
              start: (t as any).timeStart ?? null,
              end: (t as any).timeEnd ?? null,
            }))}
          />
        </div>
      </div>

      {/* ----------------- two-column content below ----------------- */}
      <section className="todo-split">
        {/* Left: Add new */}
        <div className="panel">
          <h3>Add a new task</h3>
          <form onSubmit={add} className="add-form">
            <label>
              Name:
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="What needs to be done?"
                aria-label="New to-do"
              />
            </label>

            <div className="add-row">
              <label style={{ display: "flex", flexDirection: "column" }}>
                Date:
                <input
                  type="date"
                  aria-label="Date (optional)"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="date-input"
                  title="Date (optional)"
                />
              </label>
            </div>

            <div className="add-row" style={{ gap: ".5rem", alignItems: "center" }}>
              <label style={{ display: "flex", flexDirection: "column" }}>
                Time range:
                <select
                  aria-label="Time mode"
                  className="select"
                  value={newMode}
                  onChange={(e) => setNewMode(e.target.value as any)}
                  title="Choose single time or time range"
                >
                  <option value="single">At time</option>
                  <option value="range">Time range</option>
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column" }}>
                Start time:
                <input
                  type="time"
                  aria-label={newMode === "range" ? "Start time (optional)" : "Time (optional)"}
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="time-input"
                  title={newMode === "range" ? "Start time (optional)" : "Time (optional)"}
                />
              </label>

              {newMode === "range" && (
                <label style={{ display: "flex", flexDirection: "column" }}>
                  End time:
                  <input
                    type="time"
                    aria-label="End time (optional)"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="time-input"
                    title="End time (optional)"
                  />
                </label>
              )}
            </div>

            <button className="button" type="submit">Add</button>
            <p className="muted" style={{ marginTop: ".5rem" }}>
              Tip: leave date/time blank if this task isn’t tied to a specific schedule.
            </p>
          </form>
        </div>


        {/* Right: View by day */}
        <div className="panel">
          <div className="view-header">
            <h3>Tasks for {formatDatePretty(viewDate)}</h3>

            <div className="day-controls">
              <button className="chip" onClick={() => setViewDate(d => addDays(d, -1))}>⟵ Yesterday</button>
              <button className="chip" onClick={() => setViewDate(todayISO())}>Today</button>
              <button className="chip" onClick={() => setViewDate(d => addDays(d, +1))}>Tomorrow ⟶</button>

              <input
                type="date"
                aria-label="Choose day"
                value={viewDate}
                onChange={(e) => setViewDate(e.target.value)}
                className="select date-input"
                title="Choose day"
              />
            </div>

            <div className="todo-filters">
              <button
                className={`chip ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All ({dayTodos.length})
              </button>
              <button
                className={`chip ${filter === "active" ? "active" : ""}`}
                onClick={() => setFilter("active")}
              >
                Active ({dayTodos.filter(t => !t.done).length})
              </button>
              <button
                className={`chip ${filter === "done" ? "active" : ""}`}
                onClick={() => setFilter("done")}
              >
                Done ({dayTodos.filter(t => t.done).length})
              </button>
            </div>
          </div>

          <ul className="todo-list">
            {filtered.map((t) => {
              const start = (t as any).timeStart ?? (t as any).time ?? null;
              const end = (t as any).timeEnd ?? null;

              return (
                <li key={t.id} className={`todo-item ${t.done ? "done" : ""}`}>
                  <input
                    type="checkbox"
                    checked={!!t.done}
                    onChange={(e) => toggleTodo(uid, t.id!, e.target.checked)}
                    aria-label={`Toggle ${t.text}`}
                  />

                  {editingId === t.id ? (
                    <div className="edit-col">
                      <input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        placeholder="Task"
                      />
                      <div className="edit-row">
                        <input
                          type="date"
                          aria-label="Date (optional)"
                          value={editingDate}
                          onChange={(e) => setEditingDate(e.target.value)}
                          className="select date-input"
                        />
                        <select
                          aria-label="Time mode"
                          className="select"
                          value={editingMode}
                          onChange={(e) => setEditingMode(e.target.value as any)}
                          title="Choose single time or time range"
                        >
                          <option value="single">At time</option>
                          <option value="range">Time range</option>
                        </select>
                        <input
                          type="time"
                          aria-label={editingMode === "range" ? "Start time (optional)" : "Time (optional)"}
                          value={editingStart}
                          onChange={(e) => setEditingStart(e.target.value)}
                          className="select time-input"
                        />
                        {editingMode === "range" && (
                          <input
                            type="time"
                            aria-label="End time (optional)"
                            value={editingEnd}
                            onChange={(e) => setEditingEnd(e.target.value)}
                            className="select time-input"
                          />
                        )}
                      </div>
                      <div className="row-actions">
                        <button className="button" onClick={saveEdit}>Save</button>
                        <button className="button outline" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="todo-text" onDoubleClick={() => beginEdit(t)}>
                        {t.text}
                      </span>

                      <div className="meta-chips">
                        {(start || end) && (
                          <span className="chip small">{formatRange(start, end)}</span>
                        )}
                        {!t.date && (
                          <span className="chip small" title="This task has no date">
                            Undated
                          </span>
                        )}
                      </div>

                      <div className="row-actions">
                        <button className="button outline" onClick={() => beginEdit(t)}>Edit</button>
                        <button className="button outline" onClick={() => removeTodo(uid, t.id!)}>Delete</button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="muted">No items for {formatDatePretty(viewDate)}.</li>
            )}
          </ul>
        </div>
      </section>
    </>
  );
}
