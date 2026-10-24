import { newId } from "@/lib/id";
import { taskOccursOn, toggleTask, type State } from "@/lib/model";
import { Check, Lightbulb, Plus, Sparkle } from "@phosphor-icons/react";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import WeatherCard from "./WeatherCard";
import { Empty } from "./Primitives";

export default function TodayScreen({ state, today, update }: { state: State; today: string; update: Update }) {
  const [idea, setIdea] = useState("");
  const [libraryId, setLibraryId] = useState("");
  const todayTasks = state.tasks.filter((t) => taskOccursOn(t, today));
  const done = state.routineDone[today] || [];
  const toggleRoutine = (id: string) => update((s) => ({ ...s, routineDone: { ...s.routineDone, [today]: done.includes(id) ? done.filter((x) => x !== id) : [...done, id] } }));
  const addLibrary = () => {
    const item = state.library.find((x) => x.id === libraryId);
    if (!item) return;
    update((s) => ({ ...s, tasks: [...s.tasks, { id: newId(), title: item.title, date: today, time: "", deadline: "", kind: "optional", duration: 30, repeat: "none", area: item.category === "shopping" || item.category === "places" ? "outside" : "anywhere", effort: "light", completedAt: null }] }));
    setLibraryId("");
  };
  return <>
    <WeatherCard />
    <div className="checkinBand">
      <div><span className="sectionLabel">HOW ARE YOU ARRIVING?</span><strong>Match the plan to your capacity.</strong></div>
      {(["low", "steady", "high"] as const).map((v) => <button key={v} aria-pressed={state.energies[today] === v} onClick={() => update((s) => ({ ...s, energies: { ...s.energies, [today]: s.energies[today] === v ? "" : v } }))}>Energy · {v}</button>)}
      {(["scattered", "present", "focused"] as const).map((v) => <button key={v} aria-pressed={state.focus[today] === v} onClick={() => update((s) => ({ ...s, focus: { ...s.focus, [today]: s.focus[today] === v ? "" : v } }))}>Focus · {v}</button>)}
    </div>
    <div className="todayGrid">
      {(["morning", "evening"] as const).map((period) => <section className="card routineCard" key={period}>
        <div className="sectionLabel">{period.toUpperCase()} ROUTINE</div>
        <h2>{period === "morning" ? "Begin gently." : "Make tomorrow lighter."}</h2>
        {state.routines.filter((r) => r.period === period).map((r) => <label className="routineRow" key={r.id}><input type="checkbox" checked={done.includes(r.id)} onChange={() => toggleRoutine(r.id)} /><span>{r.title}</span></label>)}
      </section>)}
    </div>
    <section className="card ideaCapture">
      <Lightbulb size={26} weight="duotone" />
      <div><div className="sectionLabel">QUICK IDEA CAPTURE</div><h2>Keep the mojo before it moves on.</h2></div>
      <input aria-label="Quick idea" placeholder="A thought worth returning to…" value={idea} onChange={(e) => setIdea(e.target.value)} />
      <button className="primary" disabled={!idea.trim()} onClick={() => { update((s) => ({ ...s, thoughts: [{ id: newId(), text: idea.trim(), createdAt: new Date().toISOString() }, ...s.thoughts] })); setIdea(""); }}><Sparkle /> Save</button>
    </section>
    <section className="tasksSection">
      <div className="sectionHead"><div><div className="sectionLabel">TODAY’S PLAN</div><h2>Enough direction. Room to adapt.</h2></div><span className="quiet">{todayTasks.reduce((n, t) => n + t.duration, 0)} min planned</span></div>
      <div className="libraryQuick"><select aria-label="Choose from My Library" value={libraryId} onChange={(e) => setLibraryId(e.target.value)}><option value="">Choose from My Library…</option>{state.library.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.group}</option>)}</select><button onClick={addLibrary} disabled={!libraryId}><Plus /> Add to today</button></div>
      {!todayTasks.length && <Empty>Your day is open. Add something from My Library or plan it in Planner.</Empty>}
      <div className="taskList">{todayTasks.map((t) => <div className={"task " + (t.completedAt ? "done" : "")} key={t.id}><button className="check" aria-label={(t.completedAt ? "Reopen " : "Complete ") + t.title} aria-pressed={!!t.completedAt} onClick={() => update((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === t.id ? toggleTask(x) : x) }))}>{t.completedAt ? <Check size={22} /> : null}</button><div className="taskText"><strong>{t.title}</strong><span>{t.kind} · {t.duration} min · {t.area}</span></div>{t.time && <span className="deadline">{t.time}</span>}</div>)}</div>
    </section>
  </>;
}
