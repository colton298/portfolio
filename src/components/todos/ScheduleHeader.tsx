// components/todos/ScheduleHeader.tsx
import React from "react";
import { formatDatePretty, formatMonthPretty, startOfWeekISO } from "../todos/date"; // adjust path if needed

export type ViewMode = "day" | "week" | "month";

type Props = {
  viewMode: ViewMode;
  viewDate: string;
  onModeChange: (m: ViewMode) => void;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
  onDateChange: (iso: string) => void;
};

// components/todos/ScheduleHeader.tsx
// ...imports unchanged...

export default function ScheduleHeader({ viewMode, viewDate, onModeChange, onPrev, onToday, onNext, onDateChange }: Props) {
  const title =
    viewMode === "day"
      ? `Schedule for ${formatDatePretty(viewDate)}`
      : viewMode === "week"
      ? `Schedule for week of ${formatDatePretty(startOfWeekISO(viewDate))}`
      : `Schedule for ${formatMonthPretty(viewDate)}`;

  return (
    <header className="schedule-header">
      <h2 className="sh-title">{title}</h2>

      {/* Row 1: mode pills */}
      <div className="sh-row sh-modes">
        <button className={`chip ${viewMode === "day" ? "active" : ""}`}  onClick={() => onModeChange("day")}>Day</button>
        <button className={`chip ${viewMode === "week" ? "active" : ""}`} onClick={() => onModeChange("week")}>Week</button>
        <button className={`chip ${viewMode === "month" ? "active" : ""}`}onClick={() => onModeChange("month")}>Month</button>
      </div>

      {/* Row 2: centered nav */}
      <div className="sh-row sh-nav-row">
        <div className="sh-nav">
          <button className="chip" onClick={onPrev}>⟵ Prev</button>
          <button className="chip" onClick={onToday}>Today</button>
          <button className="chip" onClick={onNext}>Next ⟶</button>
        </div>
      </div>

      {/* Row 3: date, aligned with timeline’s content edge */}
      <div className="sh-row sh-date-row">
        <input
          type="date"
          aria-label="Choose date"
          value={viewDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="select date-input"
          title="Choose date"
        />
      </div>
    </header>
  );
}
