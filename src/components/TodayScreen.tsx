import { newId } from "@/lib/id";
import { taskOccursOn, toggleTask, type State } from "@/lib/model";
import { Check, Lightbulb, Plus, Sparkle } from "@phosphor-icons/react";
import { useState } from "react";
import Image from "next/image";
import type { Update } from "@/lib/ui-types";
import WeatherCard from "./WeatherCard";
import { Empty } from "./Primitives";
import { useLanguage } from "./LanguageContext";
import SeasonalCompass from "./SeasonalCompass";
import BeautifulMomentsPanel from "./BeautifulMomentsPanel";

export default function TodayScreen({ state, today, update }: { state: State; today: string; update: Update }) {
  const [idea, setIdea] = useState("");
  const [libraryId, setLibraryId] = useState("");
  const [weatherCode, setWeatherCode] = useState<number>();
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const todayTasks = state.tasks.filter((t) => taskOccursOn(t, today));
  const todayDate = new Date(`${today}T12:00:00`);
  const quotes = state.library.filter((item) => item.category === "quotes");
  const quoteSeed = [...today].reduce((total, character) => total + character.charCodeAt(0), 0);
  const dailyQuote = quotes.length ? quotes[quoteSeed % quotes.length] : { title: hr ? "Primijeti ono zbog čega se vraćaš sebi." : "Notice what brings you back to yourself.", group: "UNBOUND" };
  const done = state.routineDone[today] || [];
  const toggleRoutine = (id: string) => update((s) => ({ ...s, routineDone: { ...s.routineDone, [today]: done.includes(id) ? done.filter((x) => x !== id) : [...done, id] } }));
  const addLibrary = () => {
    const item = state.library.find((x) => x.id === libraryId);
    if (!item) return;
    update((s) => ({ ...s, tasks: [...s.tasks, { id: newId(), title: item.title, date: today, time: "", deadline: "", kind: "optional", duration: 30, repeat: "none", area: item.category === "shopping" || item.category === "places" ? "outside" : "anywhere", effort: "light", completedAt: null }] }));
    setLibraryId("");
  };
  return <>
    <section className="livingTodayStage">
      <div className="livingTodayVisual">
        <Image src="/living-frames/today-morning.jpg" alt="" fill sizes="(max-width: 760px) 100vw, 68vw" priority />
        <div className="livingVisualShade" />
        <div className="livingVisualMeta"><span>{todayDate.toLocaleDateString(hr ? "hr-HR" : "en-GB", { weekday: "long" })}</span><span>{todayDate.toLocaleDateString(hr ? "hr-HR" : "en-GB", { day: "numeric", month: "long" })}</span><span>{new Date().toLocaleTimeString(hr ? "hr-HR" : "en-GB", { hour: "2-digit", minute: "2-digit" })}</span></div>
        <div className="livingVisualCaption"><span>{hr ? "DANAS / TVOJ PROSTOR" : "TODAY / YOUR SPACE"}</span><h1>{hr ? <>Sačuvaj oblik<br />svoga dana.</> : <>Protect the shape<br />of the day.</>}</h1></div>
      </div>
      <aside className="livingAgenda">
        <div className="livingAgendaHead"><div><span className="sectionLabel">{hr ? `DANAS / ${todayTasks.length} TRENUTKA` : `TODAY / ${todayTasks.length} MOMENTS`}</span><h2>{hr ? "Tvoj dan, u jednom mirnom pogledu." : "Your day, in one quiet view."}</h2></div></div>
        <div className="livingAgendaList">{todayTasks.map((t) => <button className={t.completedAt ? "isDone" : ""} key={t.id} aria-label={(t.completedAt ? (hr ? "Ponovno otvori " : "Reopen ") : (hr ? "Dovrši " : "Complete ")) + t.title} aria-pressed={!!t.completedAt} onClick={() => update((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === t.id ? toggleTask(x) : x) }))}><time>{t.time || "—"}</time><span><strong>{t.title}</strong><small>{t.duration} min · {hr ? ({ home: "doma", outside: "vani", anywhere: "bilo gdje" } as const)[t.area] : t.area}</small></span><i>{t.completedAt ? <Check /> : null}</i></button>)}</div>
        {!todayTasks.length && <p className="livingEmpty">{hr ? "Dan je još otvoren." : "The day is still open."}</p>}
        <blockquote>{dailyQuote.title}<cite>{dailyQuote.group}</cite></blockquote>
      </aside>
    </section>
    <div className="livingDayDetails">
    <WeatherCard onWeatherChange={setWeatherCode} />
    <SeasonalCompass update={update} today={today} weatherCode={weatherCode} obligations={todayTasks.filter((task) => !task.completedAt).map((task) => task.title)} />
    <div className="checkinBand">
      <div><span className="sectionLabel">{hr ? "KAKO STIŽEŠ U OVAJ DAN?" : "HOW ARE YOU ARRIVING?"}</span><strong>{hr ? "Neka plan prati tvoj stvarni kapacitet." : "Let the plan reflect your actual capacity."}</strong></div>
      {(["low", "steady", "high"] as const).map((v) => <button key={v} aria-pressed={state.energies[today] === v} onClick={() => update((s) => ({ ...s, energies: { ...s.energies, [today]: s.energies[today] === v ? "" : v } }))}>{hr ? "Energija" : "Energy"} · {hr ? ({ low: "niska", steady: "stabilna", high: "visoka" } as const)[v] : v}</button>)}
      {(["scattered", "present", "focused"] as const).map((v) => <button key={v} aria-pressed={state.focus[today] === v} onClick={() => update((s) => ({ ...s, focus: { ...s.focus, [today]: s.focus[today] === v ? "" : v } }))}>{hr ? "Fokus" : "Focus"} · {hr ? ({ scattered: "raspršen", present: "prisutan", focused: "dubok" } as const)[v] : v}</button>)}
    </div>
    <BeautifulMomentsPanel state={state} today={today} update={update} />
    <div className={`todayGrid ${todayDate.getDay() === 0 ? "hasWeekly" : ""}`}>
      {(["morning", "evening", ...(todayDate.getDay() === 0 ? ["weekly" as const] : [])] as const).map((period) => <section className="card routineCard" key={period}>
        <div className="sectionLabel">{period === "morning" ? (hr ? "JUTARNJA RUTINA" : "MORNING ROUTINE") : period === "evening" ? (hr ? "VEČERNJA RUTINA" : "EVENING ROUTINE") : (hr ? "NEDJELJNA RUTINA" : "SUNDAY ROUTINE")}</div>
        <h2>{period === "morning" ? (hr ? "Počni polako." : "Begin gently.") : period === "evening" ? (hr ? "Olakšaj si sutra." : "Make tomorrow lighter.") : (hr ? "Vrati tjedan na njegovo mjesto." : "Set the week gently back in place.")}</h2>
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
    </section>
    </div>
  </>;
}
