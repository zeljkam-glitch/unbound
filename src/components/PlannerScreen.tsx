import { newId } from "@/lib/id";
import { addDays, deadlineAwareness, localDate, parseTaskInput, taskOccursOn, toggleTask, type State, type Task, type TaskKind } from "@/lib/model";
import { ArrowLeft, ArrowRight, CalendarBlank, Check, Clock, Note, Plus, Repeat, Tag, Warning } from "@phosphor-icons/react";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import { Field } from "./Primitives";
import TwelveWeekView from "./TwelveWeekView";
import { useLanguage } from "./LanguageContext";
import { seasonalContext } from "@/lib/season";
import { MonthView, shiftMonth, shiftYear, YearView } from "./CalendarViews";

const durationOptions = [5, 10, 15, 30, 60, 120, 180, 240, 480];
const minutesLabel = (minutes: number) => minutes < 60 ? `${minutes}m` : minutes % 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes / 60}h`;

export default function PlannerScreen({ state, update }: { state: State; update: Update }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const seasonal = seasonalContext(new Date(), locale);
  const [start, setStart] = useState(localDate());
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [movingTask, setMovingTask] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [view, setView] = useState<"week" | "month" | "year" | "twelve">("week");
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const tags = Array.from(new Set(state.tasks.flatMap((task) => task.tags || []))).sort();
  const filtered = state.tasks.filter((task) => (!projectFilter || task.projectId === projectFilter) && (!tagFilter || task.tags?.includes(tagFilter)));
  const moveTask = (taskId: string, date: string, time?: string) => update((s) => ({ ...s, tasks: s.tasks.map((task) => task.id === taskId ? { ...task, date, ...(time === undefined ? {} : { time }) } : task) }));
  const taskCard = (t: Task, date: string) => {
    const deadline = deadlineAwareness(t.deadline, localDate(), locale);
    const afterDeadline = !!t.deadline && date > t.deadline;
    const moveKey = `${t.id}@${date}`;
    return <article className={`plannerTask ${t.kind} ${t.completedAt ? "done" : ""} ${afterDeadline ? "afterDeadline" : ""}`} key={date + "-" + t.id} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", t.id); event.dataTransfer.effectAllowed = "move"; }}>
      <button aria-label={(t.completedAt ? (hr ? "Ponovno otvori " : "Reopen ") : (hr ? "Dovrši " : "Complete ")) + t.title} onClick={() => update((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === t.id ? toggleTask(x) : x) }))}>{t.completedAt ? <Check /> : null}</button>
      <strong>{t.title}</strong>
      <span><Clock /> {minutesLabel(t.duration)}{t.time ? ` · ${t.time}` : (hr ? " · bez satnice" : " · no set time")}</span>
      {deadline && <small className={`deadline ${deadline.tone}`}><CalendarBlank /> {deadline.label} · {new Date(t.deadline + "T12:00:00").toLocaleDateString(hr ? "hr-HR" : "en-GB", { day: "numeric", month: "short" })}</small>}
      {afterDeadline && <small className="deadline overdue"><Warning /> {hr ? "Planirano nakon krajnjeg roka" : "Planned after deadline"}</small>}
      {t.repeat !== "none" && <small><Repeat /> {hr ? (t.repeat === "daily" ? "svaki dan" : "svaki tjedan") : t.repeat}</small>}{t.tags?.length ? <small><Tag /> {t.tags.map((tag) => `#${tag}`).join(" ")}</small> : null}{t.notes && <small><Note /> {t.notes}</small>}
      <button className="moveTaskButton" aria-label={`${hr ? "Premjesti" : "Move"} ${t.title}`} onClick={() => setMovingTask(movingTask === moveKey ? null : moveKey)}><CalendarBlank /> {hr ? "Premjesti" : "Move"}</button>
      {movingTask === moveKey && <form className="moveTaskPanel" onSubmit={(event) => { event.preventDefault(); const f = new FormData(event.currentTarget); moveTask(t.id, String(f.get("moveDate")), String(f.get("moveTime"))); setMovingTask(null); }}>
        <div className="moveQuick"><button type="button" aria-label={hr ? "Premjesti dan ranije" : "Move one day earlier"} onClick={() => { moveTask(t.id, addDays(t.date || date, -1)); setMovingTask(null); }}><ArrowLeft /> {hr ? "1 dan" : "1 day"}</button><button type="button" aria-label={hr ? "Premjesti dan kasnije" : "Move one day later"} onClick={() => { moveTask(t.id, addDays(t.date || date, 1)); setMovingTask(null); }}>{hr ? "1 dan" : "1 day"} <ArrowRight /></button></div>
        <label>{hr ? "Premjesti na datum" : "Move to date"}<input aria-label={hr ? "Premjesti na datum" : "Move to date"} name="moveDate" type="date" required defaultValue={t.date || date} /></label>
        <label>{hr ? "Vrijeme · nije obavezno" : "Time · optional"}<input aria-label={hr ? "Premjesti na vrijeme" : "Move to time"} name="moveTime" type="time" defaultValue={t.time} /></label>
        <div className="moveQuick"><button type="button" onClick={() => { moveTask(t.id, t.date || date, ""); setMovingTask(null); }}>{hr ? "Makni satnicu" : "Remove time"}</button><button className="primary">{hr ? "Spremi" : "Save move"}</button></div>
      </form>}
    </article>;
  };
  return <>
    <div className="plannerHero"><div><div className="sectionLabel">03 / {hr ? "PLANER" : "PLANNER"} · {seasonal.month.toUpperCase()} · {seasonal.seasonName.toUpperCase()}</div><h2>{view === "month" ? (hr ? <>Vidi mjesec.<br />Sačuvaj prostor.</> : <>See the month.<br />Keep some room.</>) : view === "year" ? (hr ? <>Godina u<br />jednom pogledu.</> : <>The year in<br />one view.</>) : (hr ? <>Oblikuj tjedan.<br />Ne moraš ga ispuniti.</> : <>Shape the week.<br />You don’t have to fill it.</>)}</h2><p className="plannerSeason">{seasonal.theme}</p></div><div className="viewSwitch"><button aria-pressed={view === "week"} onClick={() => setView("week")}>{hr ? "Tjedan" : "Week"}</button><button aria-pressed={view === "month"} onClick={() => setView("month")}>{hr ? "Mjesec" : "Month"}</button><button aria-pressed={view === "year"} onClick={() => setView("year")}>{hr ? "Godina" : "Year"}</button><button aria-pressed={view === "twelve"} onClick={() => setView("twelve")}>{hr ? "12 tjedana" : "12 weeks"}</button></div>{view === "week" && <button className="primary" onClick={() => setOpenDate(days.includes(localDate()) ? localDate() : start)}><Plus /> {hr ? "Novi zadatak" : "New task"}</button>}</div>
    {view === "twelve" ? <TwelveWeekView state={state} update={update} /> : <>
    <div className="plannerFilters" aria-label={hr ? "Filtri planera" : "Planner filters"}>
      <Field label={hr ? "Cilj" : "Project"}><select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}><option value="">{hr ? "Svi ciljevi" : "All projects"}</option>{state.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></Field>
      <Field label={hr ? "Oznaka" : "Tag"}><select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}><option value="">{hr ? "Sve oznake" : "All tags"}</option>{tags.map((tag) => <option key={tag} value={tag}>#{tag}</option>)}</select></Field>
      {(projectFilter || tagFilter) && <button onClick={() => { setProjectFilter(""); setTagFilter(""); }}>{hr ? "Očisti filtre" : "Clear filters"}</button>}
    </div>
    <div className="plannerToolbar">{view === "week" ? <><button onClick={() => setStart(addDays(start, -7))}>{hr ? "Prošli tjedan" : "Previous week"}</button><button onClick={() => setStart(localDate())}>{hr ? "Danas" : "Today"}</button><button onClick={() => setStart(addDays(start, 7))}>{hr ? "Sljedeći tjedan" : "Next week"}</button></> : view === "month" ? <><button onClick={() => setStart(shiftMonth(start, -1))}>{hr ? "Prošli mjesec" : "Previous month"}</button><button onClick={() => setStart(localDate())}>{hr ? "Ovaj mjesec" : "This month"}</button><button onClick={() => setStart(shiftMonth(start, 1))}>{hr ? "Sljedeći mjesec" : "Next month"}</button></> : <><button onClick={() => setStart(shiftYear(start, -1))}>{hr ? "Prošla godina" : "Previous year"}</button><button onClick={() => setStart(localDate())}>{hr ? "Ova godina" : "This year"}</button><button onClick={() => setStart(shiftYear(start, 1))}>{hr ? "Sljedeća godina" : "Next year"}</button></>}</div>
    {view === "month" ? <MonthView tasks={filtered} anchor={start} locale={locale} today={localDate()} onOpenDay={(date) => { setStart(date); setView("week"); }} /> : view === "year" ? <YearView tasks={filtered} anchor={start} locale={locale} today={localDate()} onOpenMonth={(date) => { setStart(date); setView("month"); }} /> : <div className="weekColumns">{days.map((date) => {
      const items = filtered.filter((t) => taskOccursOn(t, date));
      const planned = items.reduce((n, t) => n + t.duration, 0);
      return <section className={"dayColumn " + (date === localDate() ? "isToday" : "")} key={date} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={(event) => { event.preventDefault(); const taskId = event.dataTransfer.getData("text/plain"); if (taskId) moveTask(taskId, date); }}>
        <header><strong>{new Date(date + "T12:00:00").toLocaleDateString(hr ? "hr-HR" : "en-GB", { weekday: "short" })}</strong><span>{new Date(date + "T12:00:00").toLocaleDateString(hr ? "hr-HR" : "en-GB", { day: "numeric", month: "short" })}</span><small>{hr ? "Planirano" : "Planned"}: {minutesLabel(planned)} · {hr ? "Otvoreno" : "Open"}: {minutesLabel(Math.max(0, 480 - planned))}</small></header>
        <div>{items.length ? items.map((t) => taskCard(t, date)) : <p className="quiet">{hr ? "Još nema plana" : "No plans yet"}</p>}</div>
        {openDate === date ? <form className="inlineTaskComposer" onSubmit={(e) => {
          e.preventDefault(); const f = new FormData(e.currentTarget); const parsed = parseTaskInput(String(f.get("title")), Number(f.get("duration")) || 30); if (!parsed.title) return;
          update((s) => ({ ...s, tasks: [...s.tasks, { id: newId(), title: parsed.title, date, time: parsed.time, deadline: String(f.get("deadline")), kind: String(f.get("kind")) as TaskKind, duration: parsed.duration, repeat: String(f.get("repeat")) as "none" | "daily" | "weekly", area: "anywhere", effort: "light", completedAt: null, notes: String(f.get("notes")).trim(), tags: parsed.tags, projectId: String(f.get("projectId")) }] })); setOpenDate(null);
        }}>
          <label className="srOnly" htmlFor={`task-${date}`}>{hr ? "Naziv zadatka za" : "Task title for"} {date}</label><input id={`task-${date}`} name="title" required autoFocus placeholder={hr ? "Zadatak #oznaka @16:00 t25m" : "Task #tag @16:00 t25m"} />
          <div className="composerRow"><select aria-label={hr ? "Trajanje" : "Duration"} name="duration" defaultValue="30">{durationOptions.map((duration) => <option key={duration} value={duration}>{minutesLabel(duration)}</option>)}</select><select aria-label={hr ? "Vrsta" : "Type"} name="kind" defaultValue="flexible"><option value="fixed">{hr ? "Čvrsto" : "Fixed"}</option><option value="deadline">{hr ? "S rokom" : "Deadline"}</option><option value="flexible">{hr ? "Fleksibilno" : "Flexible"}</option><option value="optional">{hr ? "Opcionalno" : "Optional"}</option></select><select aria-label={hr ? "Ponavljanje" : "Repeat"} name="repeat" defaultValue="none"><option value="none">{hr ? "Bez ponavljanja" : "No repeat"}</option><option value="daily">{hr ? "Svaki dan" : "Daily"}</option><option value="weekly">{hr ? "Svaki tjedan" : "Weekly"}</option></select></div>
          <div className="composerRow"><select aria-label={hr ? "Cilj" : "Project"} name="projectId" defaultValue=""><option value="">{hr ? "Bez cilja" : "No project"}</option>{state.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><input aria-label={hr ? "Krajnji rok" : "Deadline"} name="deadline" type="date" /></div>
          <textarea aria-label={hr ? "Bilješke" : "Notes"} name="notes" placeholder={hr ? "Dodaj bilješku…" : "Add a note…"} />
          <div className="composerActions"><button type="button" onClick={() => setOpenDate(null)}>{hr ? "Odustani" : "Cancel"}</button><button className="primary">{hr ? "Dodaj zadatak" : "Add task"}</button></div>
        </form> : <button className="addDayTask" onClick={() => setOpenDate(date)}><Plus /> {hr ? "Dodaj" : "Add"}</button>}
      </section>;
    })}</div>}</>}
  </>;
}
