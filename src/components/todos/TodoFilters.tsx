// src/components/todos/TodoFilters.tsx
import { useEffect, useMemo, useState } from "react";

export type FilterMode = "all" | "active" | "done";

type Props = {
  counts: { all: number; active: number; done: number };
  value: FilterMode;
  onChange: (f: FilterMode) => void;
};

export default function TodoFilters({ counts, value, onChange }: Props) {
  return (
    <div className="todo-filters">
      <button className={`chip ${value === "all" ? "active" : ""}`} onClick={() => onChange("all")}>
        All ({counts.all})
      </button>
      <button className={`chip ${value === "active" ? "active" : ""}`} onClick={() => onChange("active")}>
        Active ({counts.active})
      </button>
      <button className={`chip ${value === "done" ? "active" : ""}`} onClick={() => onChange("done")}>
        Done ({counts.done})
      </button>
    </div>
  );
}
