import { taskOccursOn, type Task } from "@/lib/model";

type Locale = "hr" | "en";

const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const dateFromIso = (value: string) => new Date(`${value}T12:00:00`);
const minutesLabel = (minutes: number, locale: Locale) => minutes < 60 ? `${minutes} min` : minutes % 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes / 60} h`;

export const shiftMonth = (anchor: string, amount: number) => {
  const date = dateFromIso(anchor);
  return isoDate(new Date(date.getFullYear(), date.getMonth() + amount, 1, 12));
};

export const shiftYear = (anchor: string, amount: number) => {
  const date = dateFromIso(anchor);
  return isoDate(new Date(date.getFullYear() + amount, 0, 1, 12));
};

export function MonthView({ tasks, anchor, locale, today, onOpenDay }: { tasks: Task[]; anchor: string; locale: Locale; today: string; onOpenDay: (date: string) => void }) {
  const hr = locale === "hr";
  const anchorDate = dateFromIso(anchor);
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const first = new Date(year, month, 1, 12);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const dates = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return isoDate(date);
  });
  const weekdays = Array.from({ length: 7 }, (_, index) => {
    const monday = new Date(2026, 0, 5 + index, 12);
    return monday.toLocaleDateString(hr ? "hr-HR" : "en-GB", { weekday: "short" });
  });
  return <section className="monthView" aria-labelledby="month-view-title">
    <header className="calendarViewHeader"><div><span className="sectionLabel">{hr ? "MJESEČNI PREGLED" : "MONTH VIEW"}</span><h2 id="month-view-title">{first.toLocaleDateString(hr ? "hr-HR" : "en-GB", { month: "long", year: "numeric" })}</h2></div><p>{hr ? "Klikni dan za detaljan tjedni prikaz." : "Choose a day to open its detailed week."}</p></header>
    <div className="monthWeekdays" aria-hidden="true">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
    <div className="monthGrid">{dates.map((date) => {
      const calendarDate = dateFromIso(date);
      const items = tasks.filter((task) => taskOccursOn(task, date));
      const planned = items.reduce((total, task) => total + task.duration, 0);
      const outside = calendarDate.getMonth() !== month;
      return <button type="button" className={`${outside ? "outsideMonth " : ""}${date === today ? "isToday" : ""}`} key={date} onClick={() => onOpenDay(date)} aria-label={`${calendarDate.toLocaleDateString(hr ? "hr-HR" : "en-GB", { weekday: "long", day: "numeric", month: "long" })}${items.length ? `, ${items.length} ${hr ? "stavki" : "items"}` : ""}`}>
        <time dateTime={date}>{calendarDate.getDate()}</time>
        <span className="monthItems">{items.slice(0, 3).map((task) => <span className={task.completedAt ? "done" : ""} key={task.id}>{task.time && <i>{task.time}</i>}{task.title}</span>)}</span>
        {items.length > 3 && <small>+ {items.length - 3} {hr ? "još" : "more"}</small>}
        {planned > 0 && <em>{minutesLabel(planned, locale)}</em>}
      </button>;
    })}</div>
  </section>;
}

export function YearView({ tasks, anchor, locale, today, onOpenMonth }: { tasks: Task[]; anchor: string; locale: Locale; today: string; onOpenMonth: (date: string) => void }) {
  const hr = locale === "hr";
  const year = dateFromIso(anchor).getFullYear();
  const current = dateFromIso(today);
  const months = Array.from({ length: 12 }, (_, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, day) => isoDate(new Date(year, month, day + 1, 12)));
    const occurrences = dates.flatMap((date) => tasks.filter((task) => taskOccursOn(task, date)).map((task) => ({ task, date })));
    return {
      month,
      anchor: isoDate(new Date(year, month, 1, 12)),
      label: new Date(year, month, 1, 12).toLocaleDateString(hr ? "hr-HR" : "en-GB", { month: "long" }),
      plannedDays: new Set(occurrences.map((item) => item.date)).size,
      items: occurrences.length,
      minutes: occurrences.reduce((total, item) => total + item.task.duration, 0),
      deadlines: tasks.filter((task) => task.deadline.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length,
    };
  });
  return <section className="yearView" aria-labelledby="year-view-title">
    <header className="calendarViewHeader"><div><span className="sectionLabel">{hr ? "GODIŠNJI PREGLED" : "YEAR VIEW"}</span><h2 id="year-view-title">{year}</h2></div><p>{hr ? "Godina kao ritam, ne kao popis za ispuniti." : "The year as a rhythm, not a list to fill."}</p></header>
    <div className="yearGrid">{months.map((month) => <button type="button" key={month.month} className={year === current.getFullYear() && month.month === current.getMonth() ? "isCurrent" : ""} onClick={() => onOpenMonth(month.anchor)}>
      <span className="yearMonthNumber">{String(month.month + 1).padStart(2, "0")}</span>
      <h3>{month.label}</h3>
      <dl><div><dt>{hr ? "Planiranih dana" : "Planned days"}</dt><dd>{month.plannedDays}</dd></div><div><dt>{hr ? "Stavki" : "Items"}</dt><dd>{month.items}</dd></div><div><dt>{hr ? "Vrijeme" : "Time"}</dt><dd>{minutesLabel(month.minutes, locale)}</dd></div>{month.deadlines > 0 && <div className="yearDeadlines"><dt>{hr ? "Rokovi" : "Deadlines"}</dt><dd>{month.deadlines}</dd></div>}</dl>
    </button>)}</div>
  </section>;
}
