import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

export type Todo = {
  id?: string;
  text: string;
  done: boolean;

  // NEW: exact date + exact time (both optional)
  // date: "YYYY-MM-DD" (HTML date input value)
  // time: "HH:MM" 24h (HTML time input value)
  date?: string | null;
  time?: string | null;

  createdAt?: any; // Firestore timestamp
  updatedAt?: any;
};

export function userTodosCol(uid: string) {
  return collection(db, "users", uid, "todos");
}

export function watchTodos(uid: string, onChange: (todos: Todo[]) => void) {
  const q = query(userTodosCol(uid), orderBy("createdAt", "desc"));
  console.log("[todos.watch] subscribe"); // LOCATION #T1
  const unsub = onSnapshot(q, (snap) => {
    const list: Todo[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
    console.log("[todos.watch] snapshot size:", list.length); // LOCATION #T2
    onChange(list);
  });
  return () => {
    console.log("[todos.watch] unsubscribe"); // LOCATION #T3
    unsub();
  };
}

// CREATE with optional date/time
export async function createTodo(
  uid: string,
  text: string,
  opts?: { date?: string | "" | null; time?: string | "" | null }
) {
  const date = opts?.date || null;
  const time = opts?.time || null;
  console.log("[todos.create]", { textLen: text.length, date, time }); // LOCATION #T4
  return addDoc(userTodosCol(uid), {
    text,
    done: false,
    date,
    time,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function toggleTodo(uid: string, id: string, done: boolean) {
  console.log("[todos.toggle] id:", id, "→", done); // LOCATION #T5
  const ref = doc(db, "users", uid, "todos", id);
  return updateDoc(ref, { done, updatedAt: serverTimestamp() });
}

// UPDATE text/date/time/done (any subset)
export async function updateTodo(
  uid: string,
  id: string,
  updates: Partial<Pick<Todo, "text" | "date" | "time" | "done">>
) {
  const payload: any = { ...updates, updatedAt: serverTimestamp() };
  if (payload.date === "") payload.date = null;
  if (payload.time === "") payload.time = null;
  console.log("[todos.update]", { id, updates: payload }); // LOCATION #T6
  const ref = doc(db, "users", uid, "todos", id);
  return updateDoc(ref, payload);
}

export async function removeTodo(uid: string, id: string) {
  console.log("[todos.remove] id:", id); // LOCATION #T7
  const ref = doc(db, "users", uid, "todos", id);
  return deleteDoc(ref);
}
