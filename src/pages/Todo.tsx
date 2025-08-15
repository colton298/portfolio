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
import WeekTimeline from "../components/WeekTimeline";
import MonthCalendar from "../components/MonthCalendar";

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
function addMonths(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setMonth(dt.getMonth() + delta);
  return toISODate(dt);
}
function startOfWeekISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  const day = dt.getDay(); // 0..6 (Sun..Sat)
  dt.setDate(dt.getDate() - day);
  return toISODate(dt);
}
function getWeekDays(iso: string) {
  const start = startOfWeekISO(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
function firstOfMonthISO(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return toISODate(new Date(y, (m ?? 1) - 1, 1));
}
function lastOfMonthISO(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return toISODate(new Date(y, (m ?? 1), 0));
}
function monthGrid(iso: string) {
  const first = firstOfMonthISO(iso);
  const start = startOfWeekISO(first);
  const days: string[] = [];
  let cur = start;
  for (let i = 0; i < 42; i++) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
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
function formatMonthPretty(iso?: string | null) {
  if (!iso) return "";
  const [y, m] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, 1);
  return dt.toLocaleDateString(undefined, { month: "long", year: "numeric" });
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
  const aHasDate = !!a.date;
  const bHasDate = !!b.date;
  if (aHasDate && !bHasDate) return -1;
  if (!aHasDate && bHasDate) return 1;

  const t1 = (a as any).timeStart ?? (a as any).time ?? null;
  const t2 = (b as any).timeStart ?? (b as any).time ?? null;
  const tcmp = cmpTime(t1, t2);
  if (tcmp !== 0) return tcmp;

  const e1 = (a as any).timeEnd ?? null;
  const e2 = (b as any).timeEnd ?? null;
  const ecmp = cmpTime(e1, e2);
  if (ecmp !== 0) return ecmp;

  const xa = (a.text || "").toLowerCase();
  const xb = (b.text || "").toLowerCase();
  return xa.localeCompare(xb);
}
function isValidRange(start?: string, end?: string) {
  if (!start || !end) return true;
  return start < end;
}

/** Observe <html data-theme="..."> so children (e.g., DayTimeline) can react to pink mode */
function useDocumentTheme() {
  const get = () =>
    (document.documentElement.getAttribute("data-theme") || "dark") as
      "dark" | "light" | "pink";
  const [theme, setTheme] = useState<"dark" | "light" | "pink">(get);

  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(get()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return theme;
}

/* ===================================================== */

export default function TodoPage() {
  const { user } = useAuth();
  const uid = user?.uid!;

  const theme = useDocumentTheme(); // <-- call hook INSIDE the component

  const [todos, setTodos] = useState<Todo[]>([]);

  // --- Add form state
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState<string>("");
  const [newMode, setNewMode] = useState<"single" | "range">("single");
  const [newStart, setNewStart] = useState<string>(""); // HH:MM
  const [newEnd, setNewEnd] = useState<string>("");

  // --- View & filters
  const [viewDate, setViewDate] = useState<string>(todayISO());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
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

  useEffect(() => {
    console.log("[TodoPage] viewMode changed:", viewMode); // DEBUG (Todo.tsx - useEffect)
  }, [viewMode]);

  // current day's tasks (undated always visible)
  const dayTodos = useMemo(
    () => todos.filter((t) => (t.date ? t.date === viewDate : true)).sort(daySort),
    [todos, viewDate]
  );

  // weekly data
  const weekDays = useMemo(() => getWeekDays(viewDate), [viewDate]);
  const weekMap = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    weekDays.forEach((d) => (map[d] = []));
    todos.forEach((t) => {
      const dd = t.date;
      if (!dd) return; // undated excluded from week grid
      if (map[dd]) map[dd].push(t);
    });
    Object.values(map).forEach((arr) => arr.sort(daySort));
    return map;
  }, [todos, weekDays]);

  // month data
  const monthDays = useMemo(() => monthGrid(viewDate), [viewDate]);
  const monthFirst = useMemo(() => firstOfMonthISO(viewDate), [viewDate]);
  const monthLast = useMemo(() => lastOfMonthISO(viewDate), [viewDate]);
  const monthMap = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    monthDays.forEach((d) => (map[d] = []));
    todos.forEach((t) => {
      const dd = t.date;
      if (!dd) return;
      if (map[dd]) map[dd].push(t);
    });
    Object.values(map).forEach((arr) => arr.sort(daySort));
    return map;
  }, [todos, monthDays]);

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

    console.log("[TodoPage] add submit", { textLen: text.length, newMode, newStart, newEnd }); // DEBUG (Todo.tsx add handler)

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
    console.log("[TodoPage] begin edit:", t.id); // DEBUG (Todo.tsx beginEdit)
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
      console.log("[TodoPage] save edit", { editingId, editingMode, editingStart, editingEnd }); // DEBUG (Todo.tsx saveEdit)
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
    console.log("[TodoPage] cancel edit"); // DEBUG (Todo.tsx cancelEdit)
    setEditingId(null);
    setEditingText("");
    setEditingDate("");
    setEditingStart("");
    setEditingEnd("");
    setEditingMode("single");
  };

  // navigation amounts vary by mode
  const goPrev = () => {
    if (viewMode === "day") setViewDate((d) => addDays(d, -1));
    else if (viewMode === "week") setViewDate((d) => addDays(d, -7));
    else setViewDate((d) => addMonths(d, -1));
    console.log("[TodoPage] nav prev", { viewMode }); // DEBUG (Todo.tsx goPrev)
  };
  const goToday = () => {
    setViewDate(todayISO());
    console.log("[TodoPage] nav today/this", { viewMode }); // DEBUG (Todo.tsx goToday)
  };
  const goNext = () => {
    if (viewMode === "day") setViewDate((d) => addDays(d, +1));
    else if (viewMode === "week") setViewDate((d) => addDays(d, +7));
    else setViewDate((d) => addMonths(d, +1));
    console.log("[TodoPage] nav next", { viewMode }); // DEBUG (Todo.tsx goNext)
  };

  const centerButtonLabel =
    viewMode === "day" ? "Today" : viewMode === "week" ? "This week" : "This month";

  return (
    <>
      <Helmet>
        <title>My To-Do</title>
        <meta
          name="description"
          content="Manage your tasks by day, week, or month. Add, edit, and complete to-dos with optional scheduling, including time ranges."
        />
      </Helmet>

      {/* -------- Schedule panel (mode-aware) -------- */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="schedule-header">
          <h3>
            {viewMode === "day" && <>Schedule for {formatDatePretty(viewDate)}</>}
            {viewMode === "week" && <>Week of {formatDatePretty(startOfWeekISO(viewDate))}</>}
            {viewMode === "month" && <>{formatMonthPretty(viewDate)}</>}
          </h3>

          <div className="schedule-controls">
            <div className="mode-switch">
              <button
                className={`chip ${viewMode === "day" ? "active" : ""}`}
                onClick={() => setViewMode("day")}
                aria-label="Day view"
              >
                Day
              </button>
              <button
                className={`chip ${viewMode === "week" ? "active" : ""}`}
                onClick={() => setViewMode("week")}
                aria-label="Week view"
              >
                Week
              </button>
              <button
                className={`chip ${viewMode === "month" ? "active" : ""}`}
                onClick={() => setViewMode("month")}
                aria-label="Month view"
              >
                Month
              </button>
            </div>

            <div className="day-controls">
              <button className="chip" onClick={goPrev}>⟵ Prev</button>
              <button className="chip" onClick={goToday}>{centerButtonLabel}</button>
              <button className="chip" onClick={goNext}>Next ⟶</button>

              {viewMode === "day" && (
                <input
                  type="date"
                  aria-label="Choose day"
                  value={viewDate}
                  onChange={(e) => setViewDate(e.target.value)}
                  className="select date-input"
                  title="Choose day"
                />
              )}
              {viewMode === "month" && (
                <input
                  type="month"
                  aria-label="Choose month"
                  value={viewDate.slice(0, 7)}
                  onChange={(e) => setViewDate(`${e.target.value}-01`)}
                  className="select date-input"
                  title="Choose month"
                />
              )}
            </div>
          </div>
        </div>

        {/* Timeline body */}
        <div className="timeline">
          {viewMode === "day" && (
            <DayTimeline
              theme={theme}   // pass theme down (dark | light | pink)
              items={dayTodos.map((t) => ({
                id: t.id!,
                text: t.text,
                done: t.done,
                time: (t as any).time ?? null,
                start: (t as any).timeStart ?? null,
                end: (t as any).timeEnd ?? null,
              }))}
            />
          )}

          {viewMode === "week" && (
            <WeekTimeline
              days={weekDays}
              itemsByDate={Object.fromEntries(
                weekDays.map((d) => [
                  d,
                  (weekMap[d] || []).map((t) => ({
                    id: t.id!,
                    text: t.text,
                    done: t.done,
                    start: (t as any).timeStart ?? (t as any).time ?? null,
                    end: (t as any).timeEnd ?? null,
                  })),
                ])
              )}
            />
          )}

          {viewMode === "month" && (
            <MonthCalendar
              days={monthDays}
              currentMonthRange={{ first: monthFirst, last: monthLast }}
              itemsByDate={Object.fromEntries(
                monthDays.map((d) => [d, (monthMap[d] || [])])
              )}
            />
          )}
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

        {/* Right: View list */}
        <div className="panel">
          <div className="view-header">
            <h3>
              {viewMode === "day" ? `Tasks for ${formatDatePretty(viewDate)}` :
               viewMode === "week" ? `Tasks for week of ${formatDatePretty(startOfWeekISO(viewDate))}` :
               `Tasks in ${formatMonthPretty(viewDate)}`}
            </h3>

            <div className="day-controls">
              <button className="chip" onClick={goPrev}>⟵ Prev</button>
              <button className="chip" onClick={goToday}>{centerButtonLabel}</button>
              <button className="chip" onClick={goNext}>Next ⟶</button>

              <input
                type="date"
                aria-label="Choose day for list"
                value={viewDate}
                onChange={(e) => setViewDate(e.target.value)}
                className="select date-input"
                title="Choose day for list"
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
