import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import {
  Todo,
  watchTodos,
  createTodo,
  updateTodo,
  toggleTodo,
  removeTodo,
} from "../services/todos";

/* ---------- helpers ---------- */
function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayISO() {
  return toISODate(new Date());
}
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
  return dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(hhmm?: string | null) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const dt = new Date();
  dt.setHours(h ?? 0, m ?? 0, 0, 0);
  return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/* sort: dated items first by time, then undated items (by time->text) */
function daySort(a: Todo, b: Todo) {
  const aHasDate = !!a.date;
  const bHasDate = !!b.date;
  if (aHasDate && !bHasDate) return -1;
  if (!aHasDate && bHasDate) return 1;

  const ta = a.time ?? "99:99";
  const tb = b.time ?? "99:99";
  const tcmp = ta.localeCompare(tb);
  if (tcmp !== 0) return tcmp;

  const xa = (a.text || "").toLowerCase();
  const xb = (b.text || "").toLowerCase();
  return xa.localeCompare(xb);
}

export default function TodoPage() {
  const { user } = useAuth();
  const uid = user?.uid!;
  const [todos, setTodos] = useState<Todo[]>([]);

  /* ----- Add form state ----- */
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState<string>(""); // optional
  const [newTime, setNewTime] = useState<string>(""); // optional

  /* ----- View section state ----- */
  const [viewDate, setViewDate] = useState<string>(todayISO());
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  /* ----- Edit state ----- */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingDate, setEditingDate] = useState<string>("");
  const [editingTime, setEditingTime] = useState<string>("");

  useEffect(() => {
    document.title = "My To‑Do";
    console.log("[TodoPage] mounted"); // DEBUG #D1
  }, []);

  useEffect(() => {
    if (!uid) return;
    const stop = watchTodos(uid, setTodos);
    return stop;
  }, [uid]);

  /* Show items for the selected day + ALL UNDATED items */
  const dayTodos = useMemo(
    () =>
      todos
        .filter(t => (t.date ? t.date === viewDate : true))
        .sort(daySort),
    [todos, viewDate]
  );

  const filtered = useMemo(() => {
    if (filter === "active") return dayTodos.filter(t => !t.done);
    if (filter === "done") return dayTodos.filter(t => t.done);
    return dayTodos;
  }, [dayTodos, filter]);

  /* ----- Add new ----- */
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    await createTodo(uid, text, {
      date: newDate || null,
      time: newTime || null,
    });
    setNewText("");
    setNewDate("");
    setNewTime("");
  };

  /* ----- Edit ----- */
  const beginEdit = (t: Todo) => {
    console.log("[TodoPage] begin edit:", t.id); // DEBUG #D2
    setEditingId(t.id!);
    setEditingText(t.text);
    setEditingDate(t.date || "");
    setEditingTime(t.time || "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const text = editingText.trim();
    if (!text) {
      await removeTodo(uid, editingId);
    } else {
      await updateTodo(uid, editingId, {
        text,
        date: editingDate || null,
        time: editingTime || null,
      });
    }
    setEditingId(null);
    setEditingText("");
    setEditingDate("");
    setEditingTime("");
  };

  const cancelEdit = () => {
    console.log("[TodoPage] cancel edit"); // DEBUG #D3
    setEditingId(null);
    setEditingText("");
    setEditingDate("");
    setEditingTime("");
  };

  return (
    <section className="todo-split">
      {/* ---------- Left: Add new ---------- */}
      <div className="panel">
        <h3>Add a new task</h3>
        <form onSubmit={add} className="add-form">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="What needs to be done?"
            aria-label="New to-do"
          />
          <div className="add-row">
            <input
              type="date"
              aria-label="Date (optional)"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="select date-input"
              title="Date (optional)"
            />
            <input
              type="time"
              aria-label="Time (optional)"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="select time-input"
              title="Time (optional)"
            />
          </div>
          <button className="button" type="submit">Add</button>
          <p className="muted" style={{marginTop:".5rem"}}>
            Tip: leave date/time blank if this task isn’t tied to a specific schedule.
          </p>
        </form>
      </div>

      {/* ---------- Right: View by day ---------- */}
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
          {filtered.map((t) => (
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
                    <input
                      type="time"
                      aria-label="Time (optional)"
                      value={editingTime}
                      onChange={(e) => setEditingTime(e.target.value)}
                      className="select time-input"
                    />
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
                    {/* show time (if any). undated items appear here automatically thanks to filtering */}
                    {t.time && <span className="chip small">{formatTime(t.time)}</span>}
                    {!t.date && <span className="chip small" title="This task has no date">Undated</span>}
                  </div>

                  <div className="row-actions">
                    <button className="button outline" onClick={() => beginEdit(t)}>Edit</button>
                    <button className="button outline" onClick={() => removeTodo(uid, t.id!)}>Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="muted">No items for {formatDatePretty(viewDate)}.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
