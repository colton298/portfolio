import { useState } from "react";
import type { ComponentType } from "react";
import { Todo, toggleTodo, removeTodo, updateTodo } from "./todos";
import { FilterMode } from "./TodoFilters";
import { formatDatePretty, formatMonthPretty, startOfWeekISO, formatRange } from "./date";


type Props = {
  uid: string;
  viewDate: string;
  viewMode: "day" | "week" | "month";
  items: Todo[];
  filter: FilterMode;
  onFilterChange: (f: FilterMode) => void;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
  onDateChange: (iso: string) => void;
  counts: { all: number; active: number; done: number };
  FiltersComponent: ComponentType<{
  counts: { all: number; active: number; done: number };
  value: FilterMode;
  onChange: (f: FilterMode) => void;
  }>;
};

export default function TodoList({
  uid,
  viewDate,
  viewMode,
  items,
  filter,
  onFilterChange,
  onPrev,
  onToday,
  onNext,
  onDateChange,
  counts,
  FiltersComponent,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingDate, setEditingDate] = useState<string>("");
  const [editingMode, setEditingMode] = useState<"single" | "range">("single");
  const [editingStart, setEditingStart] = useState<string>("");
  const [editingEnd, setEditingEnd] = useState<string>("");

  const beginEdit = (t: Todo) => {
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
      await updateTodo(uid, editingId, {
        text,
        date: editingDate || null,
        timeStart: editingStart || null,
        timeEnd: editingMode === "range" ? (editingEnd || null) : null,
      });
    }
    resetEdit();
  };

  const cancelEdit = () => resetEdit();

  const resetEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingDate("");
    setEditingStart("");
    setEditingEnd("");
    setEditingMode("single");
  };

  const centerButtonLabel =
    viewMode === "day" ? "Today" : viewMode === "week" ? "This week" : "This month";

  const heading =
    viewMode === "day"
      ? `Tasks for ${formatDatePretty(viewDate)}`
      : viewMode === "week"
      ? `Tasks for week of ${formatDatePretty(startOfWeekISO(viewDate))}`
      : `Tasks in ${formatMonthPretty(viewDate)}`;

  return (
    <div className="panel">
      <div className="view-header">
        <h3>{heading}</h3>

        <div className="tasks-nav centered">
          <button className="chip" onClick={onPrev}>⟵ Prev</button>
          <button className="chip" onClick={onToday}>{centerButtonLabel}</button>
          <button className="chip" onClick={onNext}>Next ⟶</button>
        </div>

        <div className="tasks-date centered">
          <input
            type="date"
            aria-label="Choose day for list"
            value={viewDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="select date-input"
            title="Choose day for list"
          />
      </div>

<div className="tasks-filters centered">
  <FiltersComponent counts={counts} value={filter} onChange={onFilterChange} />
</div>

      </div>

      <ul className="todo-list">
        {items.map((t) => {
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
        {items.length === 0 && (
          <li className="muted">No items for {formatDatePretty(viewDate)}.</li>
        )}
      </ul>
    </div>
  );
}
