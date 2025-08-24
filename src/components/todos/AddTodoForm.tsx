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
      <div className="form-row">
      <div className="form-label">Name:</div>
      <div className="form-control">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="New to-do"
          />
        </div>
      </div>

        <div className="form-row">
          <div className="form-label">Date:</div>
          <div className="form-control">
            <input
              type="date"
              aria-label="Date (optional)"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="date-input"
              title="Date (optional)"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-label">Time range:</div>
          <div className="form-control">
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
          </div>
        </div>

        <div className="form-row">
          <div className="form-label">Start time:</div>
          <div className="form-control">
            <input
              type="time"
              aria-label={newMode === "range" ? "Start time (optional)" : "Time (optional)"}
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="time-input"
              title={newMode === "range" ? "Start time (optional)" : "Time (optional)"}
            />
          </div>
        </div>

        {newMode === "range" && (
          <div className="form-row">
            <div className="form-label">End time:</div>
            <div className="form-control">
              <input
                type="time"
                aria-label="End time (optional)"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="time-input"
                title="End time (optional)"
              />
            </div>
          </div>
        )}

        <button className="button" type="submit">Add</button>
        <p className="muted" style={{ marginTop: ".5rem" }}>
          Tip: leave date/time blank if this task isn’t tied to a specific schedule.
        </p>

      </form>
    </div>
  );
}
