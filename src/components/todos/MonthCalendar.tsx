// src/components/MonthCalendar.tsx
type TodoLite = { id?: string; text: string; done?: boolean; timeStart?: string | null; timeEnd?: string | null };
export default function MonthCalendar({
  days,
  currentMonthRange,
  itemsByDate,
}: {
  days: string[];
  currentMonthRange: { first: string; last: string };
  itemsByDate: Record<string, TodoLite[]>;
}) {
  const month = new Date(currentMonthRange.first).getMonth();
  return (
    <div className="month-grid">
      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
        <div key={d} className="month-dow">{d}</div>
      ))}
      {days.map((iso) => {
        const dt = new Date(iso);
        const inMonth = dt.getMonth() === month;
        const list = itemsByDate[iso] || [];
        return (
          <div key={iso} className={`month-cell ${inMonth ? "" : "muted"}`}>
            <div className="month-cell-header">
              {dt.getDate()}
              {list.length > 0 && <span className="badge">{list.length}</span>}
            </div>
            <ul className="month-cell-list">
              {list.slice(0, 3).map((t, i) => (
                <li key={i} className="month-item">{t.text}</li>
              ))}
              {list.length > 3 && <li className="month-more muted">+{list.length - 3} more</li>}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
