// src/components/schedule/Timeline.tsx
import { useEffect, useMemo, useState } from "react";
import DayTimeline from "../../components/DayTimeline";
import WeekTimeline from "../../components/WeekTimeline";
import MonthCalendar from "../../components/MonthCalendar";
import { ViewMode } from "./ScheduleHeader";

type DayItem = { id: string; text: string; done: boolean; time?: string | null; start?: string | null; end?: string | null; };
type WeekItem = { id: string; text: string; done: boolean; start?: string | null; end?: string | null; };

type Props = {
  viewMode: ViewMode;
  theme: "dark" | "light" | "pink";
  day: { items: DayItem[] };
  week: { days: string[]; itemsByDate: Record<string, WeekItem[]> };
  month: { days: string[]; currentMonthRange: { first: string; last: string }; itemsByDate: Record<string, any[]> };
};

export default function Timeline({ viewMode, theme, day, week, month }: Props) {
  return (
    <div className="timeline">
      {viewMode === "day" && (
        <DayTimeline theme={theme} items={day.items} />
      )}

      {viewMode === "week" && (
        <WeekTimeline days={week.days} itemsByDate={week.itemsByDate} />
      )}

      {viewMode === "month" && (
        <MonthCalendar
          days={month.days}
          currentMonthRange={month.currentMonthRange}
          itemsByDate={month.itemsByDate}
        />
      )}
    </div>
  );
}
