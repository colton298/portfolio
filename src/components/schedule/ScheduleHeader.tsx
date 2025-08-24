// src/components/schedule/ScheduleHeader.tsx
import { useEffect, useMemo, useState } from "react";
import {
  formatDatePretty,
  formatMonthPretty,
  startOfWeekISO,
} from "../../utils/date";

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

export default function ScheduleHeader({
  viewMode,
  viewDate,
  onModeChange,
  onPrev,
  onToday,
  onNext,
  onDateChange,
}: Props) {
  const centerButtonLabel =
    viewMode === "day" ? "Today" : viewMode === "week" ? "This week" : "This month";

  return (
    <div className="schedule-header">
      <h3>
        {viewMode === "day" && <>Schedule for {formatDatePretty(viewDate)}</>}
        {viewMode === "week" && <>Week of {formatDatePretty(startOfWeekISO(viewDate))}</>}
        {viewMode === "month" && <>{formatMonthPretty(viewDate)}</>}
      </h3>

      <div className="schedule-controls">
        <div className="mode-switch">
          <button className={`chip ${viewMode === "day" ? "active" : ""}`} onClick={() => onModeChange("day")} aria-label="Day view">Day</button>
          <button className={`chip ${viewMode === "week" ? "active" : ""}`} onClick={() => onModeChange("week")} aria-label="Week view">Week</button>
          <button className={`chip ${viewMode === "month" ? "active" : ""}`} onClick={() => onModeChange("month")} aria-label="Month view">Month</button>
        </div>

        <div className="day-controls">
          <button className="chip" onClick={onPrev}>⟵ Prev</button>
          <button className="chip" onClick={onToday}>{centerButtonLabel}</button>
          <button className="chip" onClick={onNext}>Next ⟶</button>

          {viewMode === "day" && (
            <input
              type="date"
              aria-label="Choose day"
              value={viewDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="select date-input"
              title="Choose day"
            />
          )}
          {viewMode === "month" && (
            <input
              type="month"
              aria-label="Choose month"
              value={viewDate.slice(0, 7)}
              onChange={(e) => onDateChange(`${e.target.value}-01`)}
              className="select date-input"
              title="Choose month"
            />
          )}
        </div>
      </div>
    </div>
  );
}
