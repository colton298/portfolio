// services/todos.ts

import {
  collection,
  addDoc,
  doc as fsDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

/** A task. Times are "HH:MM" 24h format; date is "YYYY-MM-DD". */
export type Todo = {
  id?: string;
  text: string;
  done?: boolean;
  date?: string | null;

  /** Legacy single time (kept for UI/back-compat reads). */
  time?: string | null;

  /** Preferred fields going forward. */
  timeStart?: string | null;
  timeEnd?: string | null;

  createdAt?: any;
  updatedAt?: any;
};

export function userTodosCol(uid: string) {
  return collection(db, "users", uid, "todos");
}

/** Convert raw Firestore data into our Todo, filling legacy fields as needed. */
function normalizeTodo(raw: any, id: string): Todo {
  // Prefer timeStart/timeEnd; fall back to legacy time.
  const timeStart: string | null =
    raw.timeStart ?? (raw.time ?? null);
  const timeEnd: string | null =
    raw.timeEnd ?? null;

  // Keep legacy `time` populated so existing UI continues to work.
  const time: string | null =
    raw.time ?? timeStart ?? null;

  return {
    id,
    text: raw.text ?? "",
    done: !!raw.done,
    date: raw.date ?? null,
    timeStart,
    timeEnd,
    time,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
}

/** Live subscription to a user's todos. */
export function watchTodos(uid: string, onChange: (todos: Todo[]) => void) {
  const q = query(userTodosCol(uid), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    const list: Todo[] = [];
    snap.forEach((d) => list.push(normalizeTodo(d.data(), d.id)));
    onChange(list);
  });
  return unsub;
}

/**
 * Create a todo.
 * Pass either:
 *  - { time: "HH:MM" }   // single time
 *  - { timeStart: "HH:MM", timeEnd: "HH:MM" } // range
 */
export async function createTodo(
  uid: string,
  text: string,
  opts?: {
    date?: string | null;
    time?: string | null;        // legacy single time (still supported)
    timeStart?: string | null;   // new start time
    timeEnd?: string | null;     // new end time
  }
) {
  const date = opts?.date ?? null;

  // Decide which times to persist:
  const normalizedTimeStart =
    opts?.timeStart ?? opts?.time ?? null;
  const normalizedTimeEnd =
    opts?.timeEnd ?? null;

  // We also write legacy `time` for back-compat with any older clients.
  const legacyTime = opts?.time ?? null;

  const payload: any = {
    text,
    done: false,
    date,
    timeStart: normalizedTimeStart,
    timeEnd: normalizedTimeEnd,
    time: legacyTime, // keep writing for now (can be removed later in a migration)
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(userTodosCol(uid), payload);
}

/**
 * Toggle completion.
 */
export async function toggleTodo(uid: string, id: string, done: boolean) {
  const ref = fsDoc(db, "users", uid, "todos", id);
  return updateDoc(ref, { done, updatedAt: serverTimestamp() });
}

/**
 * Update any subset of fields.
 * Accepts either single `time` or `timeStart`/`timeEnd`.
 * Empty strings are normalized to nulls.
 */
export async function updateTodo(
  uid: string,
  id: string,
  patch: Partial<
    Pick<Todo, "text" | "date" | "time" | "timeStart" | "timeEnd" | "done">
  >
) {
  const payload: Record<string, any> = { updatedAt: serverTimestamp() };

  if ("text" in patch) payload.text = (patch.text ?? "").trim();
  if ("done" in patch) payload.done = !!patch.done;

  if ("date" in patch) {
    payload.date = patch.date === "" ? null : (patch.date ?? null);
  }

  // Normalize time fields:
  // If a single legacy `time` is supplied, mirror it to `timeStart` too.
  const hasLegacyTime = "time" in patch;
  const hasStart = "timeStart" in patch;
  const hasEnd = "timeEnd" in patch;

  if (hasLegacyTime) {
    const t =
      patch.time === "" ? null : (patch.time ?? null);
    payload.time = t;                // keep legacy field updated
    payload.timeStart = hasStart
      ? (patch.timeStart === "" ? null : (patch.timeStart ?? null))
      : t; // if caller didn’t provide timeStart explicitly, mirror legacy time
  }

  if (hasStart) {
    payload.timeStart =
      patch.timeStart === "" ? null : (patch.timeStart ?? null);
  }
  if (hasEnd) {
    payload.timeEnd =
      patch.timeEnd === "" ? null : (patch.timeEnd ?? null);
  }

  const ref = fsDoc(db, "users", uid, "todos", id);
  return updateDoc(ref, payload);
}

/** Delete a todo. */
export async function removeTodo(uid: string, id: string) {
  const ref = fsDoc(db, "users", uid, "todos", id);
  return deleteDoc(ref);
}
