// src/utils/date.ts
import { Todo } from "./todos";

/* ---------------------- date helpers ---------------------- */
export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function todayISO() { return toISODate(new Date()); }

export function addDays(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + delta);
  return toISODate(dt);
}
export function addMonths(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setMonth(dt.getMonth() + delta);
  return toISODate(dt);
}
export function startOfWeekISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  const day = dt.getDay(); // 0..6 (Sun..Sat)
  dt.setDate(dt.getDate() - day);
  return toISODate(dt);
}
export function getWeekDays(iso: string) {
  const start = startOfWeekISO(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
export function firstOfMonthISO(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return toISODate(new Date(y, (m ?? 1) - 1, 1));
}
export function lastOfMonthISO(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return toISODate(new Date(y, (m ?? 1), 0));
}
export function monthGrid(iso: string) {
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

/* ---------------------- formatters ---------------------- */
export function formatDatePretty(iso?: string | null) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
export function formatMonthPretty(iso?: string | null) {
  if (!iso) return "";
  const [y, m] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, 1);
  return dt.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
export function formatTime(hhmm?: string | null) {
  if (!hhmm) return "";
  const [h, m] = (hhmm || "0:0").split(":").map(Number);
  const dt = new Date();
  dt.setHours(h ?? 0, m ?? 0, 0, 0);
  return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
export function formatRange(start?: string | null, end?: string | null) {
  if (!start) return "";
  const s = formatTime(start);
  if (!end) return s;
  return `${s}–${formatTime(end)}`;
}

/* ---------------------- sorting & validation ---------------------- */
function cmpTime(a?: string | null, b?: string | null) {
  const aa = a ?? "99:99";
  const bb = b ?? "99:99";
  return aa.localeCompare(bb);
}
export function daySort(a: Todo, b: Todo) {
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
export function isValidRange(start?: string, end?: string) {
  if (!start || !end) return true;
  return start < end;
}
