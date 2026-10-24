import { newId } from "@/lib/id";
import { addDays, localDate, taskOccursOn, toggleTask, type State, type TaskKind } from "@/lib/model";
import { Check, Plus, Repeat } from "@phosphor-icons/react";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import { Field } from "./Primitives";

export default function PlannerScreen({ state, update }: { state: State; update: Update }) {
  const [start, setStart] = useState(localDate());
  const [open, setOpen] = useState(false);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return <>
    <div className="sectionHead"><div><div className="sectionLabel">MULTI-DAY VIEW</div><h2>Plan the shape, not every minute.</h2></div><button className="primary" onClick={() => setOpen(!open)}><Plus /> New task</button></div>
    {open && <form className="card plannerForm" onSubmit={(e) => {
      e.preventDefault(); const f = new FormData(e.currentTarget);
      update((s) => ({ ...s, tasks: [...s.tasks, { id: newId(), title: String(f.get("title")).trim(), date: String(f.get("date")), time: String(f.get("time")), deadline: String(f.get("deadline")), kind: String(f.get("kind")) as TaskKind, duration: Number(f.get("duration")) || 30, repeat: String(f.get("repeat")) as "none" | "daily" | "weekly", area: String(f.get("area")) as "home" | "outside" | "anywhere", effort: String(f.get("effort")) as "light" | "deep", completedAt: null }] })); e.currentTarget.reset(); setOpen(false);
    }}>
      <Field label="What needs doing?"><input name="title" required autoFocus /></Field>
      <Field label="Plan for"><input name="date" type="date" defaultValue={start} required /></Field>
      <Field label="Type"><select name="kind"><option value="fixed">Fixed</option><option value="deadline">Deadline</option><option value="flexible">Flexible</option><option value="optional">Optional</option></select></Field>
      <Field label="Time (for fixed tasks)"><input name="time" type="time" /></Field>
      <Field label="Deadline"><input name="deadline" type="date" /></Field>
      <Field label="Duration"><select name="duration" defaultValue="30"><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">1 hour</option><option value="90">90 min</option></select></Field>
      <Field label="Repeat"><select name="repeat"><option value="none">Doesn’t repeat</option><option value="daily">Daily</option><option value="weekly">Weekly</option></select></Field>
      <Field label="Where"><select name="area"><option value="anywhere">Anywhere</option><option value="home">At home</option><option value="outside">Out & about</option></select></Field>
      <Field label="Energy"><select name="effort"><option value="light">Light</option><option value="deep">Deep focus</option></select></Field>
      <button className="primary">Add task</button>
    </form>}
    <div className="plannerToolbar"><button onClick={() => setStart(addDays(start, -7))}>Previous week</button><button onClick={() => setStart(localDate())}>Today</button><button onClick={() => setStart(addDays(start, 7))}>Next week</button></div>
    <div className="weekColumns">{days.map((date) => {
      const items = state.tasks.filter((t) => taskOccursOn(t, date));
      return <section className={"dayColumn " + (date === localDate() ? "isToday" : "")} key={date}><header><strong>{new Date(date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" })}</strong><span>{new Date(date + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span><small>{items.reduce((n, t) => n + t.duration, 0)}m planned</small></header><div>{items.length ? items.map((t) => <article className={"plannerTask " + t.kind + " " + (t.completedAt ? "done" : "")} key={date + "-" + t.id}><button aria-label={(t.completedAt ? "Reopen " : "Complete ") + t.title} onClick={() => update((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === t.id ? toggleTask(x) : x) }))}>{t.completedAt ? <Check /> : null}</button><strong>{t.title}</strong><span>{t.time || t.duration + " min"} · {t.kind}</span>{t.repeat !== "none" && <small><Repeat /> {t.repeat}</small>}</article>) : <p className="quiet">No plans yet</p>}</div></section>;
    })}</div>
  </>;
}
