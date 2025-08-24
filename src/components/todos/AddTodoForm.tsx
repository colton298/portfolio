import { useState } from "react";
import type { FormEvent } from "react";
import { createTodo } from "./todos";
import { isValidRange } from "./date";

type Props = {
  uid: string;
};

export default function AddTodoForm({ uid }: Props) {
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState<string>("");
  const [newMode, setNewMode] = useState<"single" | "range">("single");
  const [newStart, setNewStart] = useState<string>(""); // HH:MM
  const [newEnd, setNewEnd] = useState<string>("");

  
  const add = async (e: FormEvent) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;

    if (newMode === "range" && !isValidRange(newStart || "", newEnd || "")) {
      alert("End time must be after start time.");
      return;
    }

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

  return (
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
  );
}
