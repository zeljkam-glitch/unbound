import { newId } from "@/lib/id";
import { addDays, deadlineAwareness, localDate, parseTaskInput, taskOccursOn, toggleTask, type State, type Task, type TaskKind } from "@/lib/model";
import { ArrowLeft, ArrowRight, CalendarBlank, Check, Clock, Note, Plus, Repeat, Tag, Warning } from "@phosphor-icons/react";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import { Field } from "./Primitives";
import TwelveWeekView from "./TwelveWeekView";

const durationOptions = [5, 10, 15, 30, 60, 120, 180, 240, 480];
const minutesLabel = (minutes: number) => minutes < 60 ? `${minutes}m` : minutes % 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes / 60}h`;

export default function PlannerScreen({ state, update }: { state: State; update: Update }) {
  const [start, setStart] = useState(localDate());
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [movingTask, setMovingTask] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [view, setView] = useState<"week" | "twelve">("week");
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const tags = Array.from(new Set(state.tasks.flatMap((task) => task.tags || []))).sort();
  const filtered = state.tasks.filter((task) => (!projectFilter || task.projectId === projectFilter) && (!tagFilter || task.tags?.includes(tagFilter)));
  const moveTask = (taskId: string, date: string, time?: string) => update((s) => ({ ...s, tasks: s.tasks.map((task) => task.id === taskId ? { ...task, date, ...(time === undefined ? {} : { time }) } : task) }));
  const taskCard = (t: Task, date: string) => {
    const deadline = deadlineAwareness(t.deadline);
    const afterDeadline = !!t.deadline && date > t.deadline;
    const moveKey = `${t.id}@${date}`;
    return <article className={`plannerTask ${t.kind} ${t.completedAt ? "done" : ""} ${afterDeadline ? "afterDeadline" : ""}`} key={date + "-" + t.id} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", t.id); event.dataTransfer.effectAllowed = "move"; }}>
      <button aria-label={(t.completedAt ? "Reopen " : "Complete ") + t.title} onClick={() => update((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === t.id ? toggleTask(x) : x) }))}>{t.completedAt ? <Check /> : null}</button>
      <strong>{t.title}</strong>
      <span><Clock /> {minutesLabel(t.duration)}{t.time ? ` · ${t.time}` : " · no set time"}</span>
      {deadline && <small className={`deadline ${deadline.tone}`}><CalendarBlank /> {deadline.label} · {new Date(t.deadline + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</small>}
      {afterDeadline && <small className="deadline overdue"><Warning /> Planned after deadline</small>}
      {t.repeat !== "none" && <small><Repeat /> {t.repeat}</small>}{t.tags?.length ? <small><Tag /> {t.tags.map((tag) => `#${tag}`).join(" ")}</small> : null}{t.notes && <small><Note /> {t.notes}</small>}
      <button className="moveTaskButton" aria-label={`Move ${t.title}`} onClick={() => setMovingTask(movingTask === moveKey ? null : moveKey)}><CalendarBlank /> Move</button>
      {movingTask === moveKey && <form className="moveTaskPanel" onSubmit={(event) => { event.preventDefault(); const f = new FormData(event.currentTarget); moveTask(t.id, String(f.get("moveDate")), String(f.get("moveTime"))); setMovingTask(null); }}>
        <div className="moveQuick"><button type="button" aria-label="Move one day earlier" onClick={() => { moveTask(t.id, addDays(t.date || date, -1)); setMovingTask(null); }}><ArrowLeft /> 1 day</button><button type="button" aria-label="Move one day later" onClick={() => { moveTask(t.id, addDays(t.date || date, 1)); setMovingTask(null); }}>1 day <ArrowRight /></button></div>
        <label>Move to date<input aria-label="Move to date" name="moveDate" type="date" required defaultValue={t.date || date} /></label>
        <label>Time — optional<input aria-label="Move to time" name="moveTime" type="time" defaultValue={t.time} /></label>
        <div className="moveQuick"><button type="button" onClick={() => { moveTask(t.id, t.date || date, ""); setMovingTask(null); }}>Remove time</button><button className="primary">Save move</button></div>
      </form>}
    </article>;
  };
  return <>
    <div className="plannerHero"><div><div className="sectionLabel">03 / PLANNER</div><h2>Shape the week.<br />Don’t fill it.</h2></div><div className="viewSwitch"><button aria-pressed={view === "week"} onClick={() => setView("week")}>Week</button><button aria-pressed={view === "twelve"} onClick={() => setView("twelve")}>12 weeks</button></div>{view === "week" && <button className="primary" onClick={() => setOpenDate(days.includes(localDate()) ? localDate() : start)}><Plus /> New task</button>}</div>
    {view === "twelve" ? <TwelveWeekView state={state} update={update} /> : <>
    <div className="plannerFilters" aria-label="Planner filters">
      <Field label="Project"><select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}><option value="">All projects</option>{state.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></Field>
      <Field label="Tag"><select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}><option value="">All tags</option>{tags.map((tag) => <option key={tag} value={tag}>#{tag}</option>)}</select></Field>
      {(projectFilter || tagFilter) && <button onClick={() => { setProjectFilter(""); setTagFilter(""); }}>Clear filters</button>}
    </div>
    <div className="plannerToolbar"><button onClick={() => setStart(addDays(start, -7))}>Previous week</button><button onClick={() => setStart(localDate())}>Today</button><button onClick={() => setStart(addDays(start, 7))}>Next week</button></div>
    <div className="weekColumns">{days.map((date) => {
      const items = filtered.filter((t) => taskOccursOn(t, date));
      const planned = items.reduce((n, t) => n + t.duration, 0);
      return <section className={"dayColumn " + (date === localDate() ? "isToday" : "")} key={date} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={(event) => { event.preventDefault(); const taskId = event.dataTransfer.getData("text/plain"); if (taskId) moveTask(taskId, date); }}>
        <header><strong>{new Date(date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" })}</strong><span>{new Date(date + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span><small>Planned: {minutesLabel(planned)} · Available: {minutesLabel(Math.max(0, 480 - planned))}</small></header>
        <div>{items.length ? items.map((t) => taskCard(t, date)) : <p className="quiet">No plans yet</p>}</div>
        {openDate === date ? <form className="inlineTaskComposer" onSubmit={(e) => {
          e.preventDefault(); const f = new FormData(e.currentTarget); const parsed = parseTaskInput(String(f.get("title")), Number(f.get("duration")) || 30); if (!parsed.title) return;
          update((s) => ({ ...s, tasks: [...s.tasks, { id: newId(), title: parsed.title, date, time: parsed.time, deadline: String(f.get("deadline")), kind: String(f.get("kind")) as TaskKind, duration: parsed.duration, repeat: String(f.get("repeat")) as "none" | "daily" | "weekly", area: "anywhere", effort: "light", completedAt: null, notes: String(f.get("notes")).trim(), tags: parsed.tags, projectId: String(f.get("projectId")) }] })); setOpenDate(null);
        }}>
          <label className="srOnly" htmlFor={`task-${date}`}>Task title for {date}</label><input id={`task-${date}`} name="title" required autoFocus placeholder="Task #tag @16:00 t25m" />
          <div className="composerRow"><select aria-label="Duration" name="duration" defaultValue="30">{durationOptions.map((duration) => <option key={duration} value={duration}>{minutesLabel(duration)}</option>)}</select><select aria-label="Type" name="kind" defaultValue="flexible"><option value="fixed">Fixed</option><option value="deadline">Deadline</option><option value="flexible">Flexible</option><option value="optional">Optional</option></select><select aria-label="Repeat" name="repeat" defaultValue="none"><option value="none">No repeat</option><option value="daily">Daily</option><option value="weekly">Weekly</option></select></div>
          <div className="composerRow"><select aria-label="Project" name="projectId" defaultValue=""><option value="">Inbox / no project</option>{state.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><input aria-label="Deadline" name="deadline" type="date" /></div>
          <textarea aria-label="Notes" name="notes" placeholder="Add a note…" />
          <div className="composerActions"><button type="button" onClick={() => setOpenDate(null)}>Cancel</button><button className="primary">Add task</button></div>
        </form> : <button className="addDayTask" onClick={() => setOpenDate(date)}><Plus /> Add</button>}
      </section>;
    })}</div></>}
  </>;
}
