import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../auth/AuthProvider";
import { Todo, watchTodos } from "../components/todos/todos";
import { useDocumentTheme } from "../components/todos/useDocumentTheme";
import type { ViewMode } from "../components/todos/ScheduleHeader";

import ScheduleHeader from "../components/todos/ScheduleHeader";
import Timeline from "../components/todos/Timeline";
import AddTodoForm from "../components/todos/AddTodoForm";
import TodoFilters, { FilterMode } from "../components/todos/TodoFilters";
import TodoList from "../components/todos/TodoList";
import FirstVisitNotice from "../components/common/FirstVisitNotice";

import {
  todayISO,
  addDays,
  addMonths,
  getWeekDays,
  monthGrid,
  firstOfMonthISO,
  lastOfMonthISO,
  daySort,
} from "../components/todos/date";

type DayItem = {
  id: string;
  text: string;
  done: boolean;
  time?: string | null;
  start?: string | null;
  end?: string | null;
};
type WeekItem = {
  id: string;
  text: string;
  done: boolean;
  start?: string | null;
  end?: string | null;
};

const toTime = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;

export default function TodoPage() {
  const { user } = useAuth();
  const uid = user?.uid!;
  const theme = useDocumentTheme();

  const [todos, setTodos] = useState<Todo[]>([]);

  // --- View & filters
  const [viewDate, setViewDate] = useState<string>(todayISO());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [filter, setFilter] = useState<FilterMode>("all");

  // Live subscribe and normalize time fields for UI
  useEffect(() => {
    if (!uid) return;
    const stop = watchTodos(uid, (list) => {
      const normalized = list.map((t) => ({
        ...t,
        done: !!t.done, // ensure boolean
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

  // week data
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

  // filters (for list)
  const filtered = useMemo(() => {
    if (filter === "active") return dayTodos.filter((t) => !t.done);
    if (filter === "done") return dayTodos.filter((t) => t.done);
    return dayTodos;
  }, [dayTodos, filter]);

  // navigation amounts vary by mode
  const goPrev = () => {
    if (viewMode === "day") setViewDate((d) => addDays(d, -1));
    else if (viewMode === "week") setViewDate((d) => addDays(d, -7));
    else setViewDate((d) => addMonths(d, -1));
  };
  const goToday = () => setViewDate(todayISO());
  const goNext = () => {
    if (viewMode === "day") setViewDate((d) => addDays(d, +1));
    else if (viewMode === "week") setViewDate((d) => addDays(d, +7));
    else setViewDate((d) => addMonths(d, +1));
  };

  return (
    <>
      <Helmet>
        <title>My To-Do</title>
        <meta
          name="description"
          content="Manage your tasks by day, week, or month. Add, edit, and complete to-dos with optional scheduling, including time ranges."
        />
      </Helmet>

      <FirstVisitNotice storageKey="todo-welcome-v1">
        Welcome to my To-Do List! Use the left panel to add a task, the right panel to view tasks each day, and the top panel for a daily, weekly, or monthly timeline!
        Tasks can be set to a specific time, time range, or left to simply occur on a day. 
      </FirstVisitNotice>


      {/* -------- Schedule panel -------- */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <ScheduleHeader
          viewMode={viewMode}
          viewDate={viewDate}
          onModeChange={setViewMode}
          onPrev={goPrev}
          onToday={goToday}
          onNext={goNext}
          onDateChange={setViewDate}
        />

        <Timeline
  viewMode={viewMode}
  theme={theme}
  day={{
    items: dayTodos.map<DayItem>((t) => ({
      id: t.id!,
      text: t.text,
      done: !!t.done,                           // <-- coerce to boolean
      time: toTime((t as any).time ?? null),
      start: toTime((t as any).timeStart ?? null),
      end: toTime((t as any).timeEnd ?? null),
    })),
  }}
  week={{
    days: weekDays,
    itemsByDate: Object.fromEntries(
      weekDays.map((d) => {
        const items = (weekMap[d] || []).map<WeekItem>((t) => ({
          id: t.id!,
          text: t.text,
          done: !!t.done,                       // <-- coerce to boolean
          start: toTime((t as any).timeStart ?? (t as any).time ?? null),
          end: toTime((t as any).timeEnd ?? null),
        }));
        return [d, items];
      })
    ) as Record<string, WeekItem[]>             // <-- tighten the type
  }}
  month={{
    days: monthDays,
    currentMonthRange: { first: monthFirst, last: monthLast },
    // Month accepts any[] internally, so no extra narrowing needed:
    itemsByDate: Object.fromEntries(monthDays.map((d) => [d, (monthMap[d] || [])])),
  }}
/>

      </div>

      {/* ----------------- two-column content below ----------------- */}
      <section className="todo-split">
        {/* Left: Add new */}
        <AddTodoForm uid={uid} />

        {/* Right: View list */}
        <TodoList
          uid={uid}
          viewDate={viewDate}
          viewMode={viewMode}
          items={filtered}
          filter={filter}
          onFilterChange={setFilter}
          onPrev={goPrev}
          onToday={goToday}
          onNext={goNext}
          onDateChange={setViewDate}
          counts={{
            all: dayTodos.length,
            active: dayTodos.filter(t => !t.done).length,
            done: dayTodos.filter(t => t.done).length,
          }}
          FiltersComponent={TodoFilters}
        />
      </section>
    </>
  );
}
