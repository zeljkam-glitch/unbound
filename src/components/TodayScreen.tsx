import { newId } from "@/lib/id";
import { taskOccursOn, toggleTask, type State } from "@/lib/model";
import { Check, Lightbulb, Plus, Sparkle } from "@phosphor-icons/react";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import WeatherCard from "./WeatherCard";
import { Empty } from "./Primitives";
import AtmosphereFrame from "./AtmosphereFrame";
import { useLanguage } from "./LanguageContext";

export default function TodayScreen({ state, today, update }: { state: State; today: string; update: Update }) {
  const [idea, setIdea] = useState("");
  const [libraryId, setLibraryId] = useState("");
  const { locale } = useLanguage();
  const hr = locale === "hr";
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
    <AtmosphereFrame today={today} />
    <WeatherCard />
    <div className="checkinBand">
      <div><span className="sectionLabel">{hr ? "KAKO STIŽEŠ U OVAJ DAN?" : "HOW ARE YOU ARRIVING?"}</span><strong>{hr ? "Neka plan prati tvoju stvarnu snagu." : "Let the plan meet your actual capacity."}</strong></div>
      {(["low", "steady", "high"] as const).map((v) => <button key={v} aria-pressed={state.energies[today] === v} onClick={() => update((s) => ({ ...s, energies: { ...s.energies, [today]: s.energies[today] === v ? "" : v } }))}>{hr ? "Energija" : "Energy"} · {hr ? ({ low: "niska", steady: "stabilna", high: "visoka" } as const)[v] : v}</button>)}
      {(["scattered", "present", "focused"] as const).map((v) => <button key={v} aria-pressed={state.focus[today] === v} onClick={() => update((s) => ({ ...s, focus: { ...s.focus, [today]: s.focus[today] === v ? "" : v } }))}>{hr ? "Fokus" : "Focus"} · {hr ? ({ scattered: "raspršen", present: "prisutan", focused: "dubok" } as const)[v] : v}</button>)}
    </div>
    <div className="todayGrid">
      {(["morning", "evening"] as const).map((period) => <section className="card routineCard" key={period}>
        <div className="sectionLabel">{period === "morning" ? (hr ? "JUTARNJI RITUAL" : "MORNING ROUTINE") : (hr ? "VEČERNJI RITUAL" : "EVENING ROUTINE")}</div>
        <h2>{period === "morning" ? (hr ? "Počni polako." : "Begin gently.") : (hr ? "Olakšaj si sutra." : "Make tomorrow lighter.")}</h2>
        {state.routines.filter((r) => r.period === period).map((r) => <label className="routineRow" key={r.id}><input type="checkbox" checked={done.includes(r.id)} onChange={() => toggleRoutine(r.id)} /><span>{r.title}</span></label>)}
      </section>)}
    </div>
    <section className="card ideaCapture">
      <Lightbulb size={26} weight="duotone" />
      <div><div className="sectionLabel">{hr ? "BRZA BILJEŠKA" : "QUICK IDEA"}</div><h2>{hr ? "Sačuvaj misao prije nego ode." : "Keep the thought before it moves on."}</h2></div>
      <input aria-label={hr ? "Brza bilješka" : "Quick idea"} placeholder={hr ? "Nešto čemu se želiš vratiti…" : "Something worth returning to…"} value={idea} onChange={(e) => setIdea(e.target.value)} />
      <button className="primary" disabled={!idea.trim()} onClick={() => { update((s) => ({ ...s, thoughts: [{ id: newId(), text: idea.trim(), createdAt: new Date().toISOString() }, ...s.thoughts] })); setIdea(""); }}><Sparkle /> {hr ? "Spremi" : "Save"}</button>
    </section>
    <section className="tasksSection">
      <div className="sectionHead"><div><div className="sectionLabel">{hr ? "DANAŠNJI PLAN" : "TODAY’S PLAN"}</div><h2>{hr ? "Dovoljno smjera. Dovoljno prostora." : "Enough direction. Enough room."}</h2></div><span className="quiet">{todayTasks.reduce((n, t) => n + t.duration, 0)} {hr ? "min planirano" : "min planned"}</span></div>
      <div className="libraryQuick"><select aria-label={hr ? "Odaberi iz Moje zbirke" : "Choose from My Library"} value={libraryId} onChange={(e) => setLibraryId(e.target.value)}><option value="">{hr ? "Odaberi iz Moje zbirke…" : "Choose from My Library…"}</option>{state.library.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.group}</option>)}</select><button onClick={addLibrary} disabled={!libraryId}><Plus /> {hr ? "Dodaj danas" : "Add today"}</button></div>
      {!todayTasks.length && <Empty>{hr ? "Dan ti je još otvoren. Dodaj nešto iz svoje zbirke ili ga oblikuj u Planeru." : "Your day is still open. Add something from your library or shape it in Planner."}</Empty>}
      <div className="taskList">{todayTasks.map((t) => <div className={"task " + (t.completedAt ? "done" : "")} key={t.id}><button className="check" aria-label={(t.completedAt ? (hr ? "Ponovno otvori " : "Reopen ") : (hr ? "Dovrši " : "Complete ")) + t.title} aria-pressed={!!t.completedAt} onClick={() => update((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === t.id ? toggleTask(x) : x) }))}>{t.completedAt ? <Check size={22} /> : null}</button><div className="taskText"><strong>{t.title}</strong><span>{hr ? ({ fixed: "čvrsto", deadline: "rok", flexible: "fleksibilno", optional: "opcionalno" } as const)[t.kind] : t.kind} · {t.duration} min · {hr ? ({ home: "doma", outside: "vani", anywhere: "bilo gdje" } as const)[t.area] : t.area}</span></div>{t.time && <span className="deadline">{t.time}</span>}</div>)}</div>
    </section>
  </>;
}
