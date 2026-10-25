import { newId } from "@/lib/id";
import { localDate, pauseProject, weekStart, type State } from "@/lib/model";
import { Pause, Play, Plus, Target } from "@phosphor-icons/react";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import { Empty, Field } from "./Primitives";
import { useLanguage } from "./LanguageContext";
import ReportsPanel from "./ReportsPanel";
import TwelveWeekView from "./TwelveWeekView";

export default function GoalsScreen({ state, update }: { state: State; update: Update }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const [open, setOpen] = useState(false);
  const [showTwelveWeek, setShowTwelveWeek] = useState(false);
  const week = localDate(weekStart());
  const checkin = state.weeklyCheckins[week] || { win: "", learned: "", next: "", energy: "" };
  const setCheckin = (key: keyof typeof checkin, value: string) => update((s) => ({ ...s, weeklyCheckins: { ...s.weeklyCheckins, [week]: { ...(s.weeklyCheckins[week] || { win: "", learned: "", next: "", energy: "" }), [key]: value } } }));
  return <>
    <div className="sectionHead"><div><div className="sectionLabel">{hr ? "CILJEVI · BEZ FORSIRANJA" : "GOALS · AT YOUR PACE"}</div><h2>{hr ? "Vidi što si već pomaknula. I što još čeka." : "See what has moved. See what is still waiting."}</h2></div><button className="primary" onClick={() => setOpen(!open)}><Plus /> {hr ? "Novi cilj" : "New goal"}</button></div>
    <div className="goalConcept"><span className="sectionLabel">{hr ? "KAKO SE ČITA CILJ" : "HOW TO READ A GOAL"}</span><p>{hr ? "Naziv je smjer. Opis kaže kako taj smjer izgleda u stvarnom životu. Postotak pomičeš sama kada osjetiš stvaran pomak — aplikacija ga ne izračunava niti te ocjenjuje. Sljedeći korak je jedna konkretna stvar koju sada možeš napraviti." : "The name is a direction. The description says what that direction looks like in real life. You move the percentage yourself when you notice real progress—the app does not calculate or grade it. The next step is one concrete thing you can do now."}</p></div>
    {open && <form className="card goalForm" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); update((s) => ({ ...s, projects: [...s.projects, { id: newId(), name: String(f.get("name")).trim(), outcome: String(f.get("outcome")).trim(), deadline: String(f.get("deadline")), nextAction: String(f.get("nextAction")).trim(), status: "active", place: "", progress: 0 }] })); e.currentTarget.reset(); setOpen(false); }}>
      <Field label={hr ? "Cilj" : "Goal"}><input name="name" required autoFocus /></Field><Field label={hr ? "Kako bi uspjeh izgledao u stvarnom životu?" : "What would success look like in real life?"}><input name="outcome" required /></Field><Field label={hr ? "Željeni datum · nije obavezno" : "Target date · optional"}><input name="deadline" type="date" /></Field><Field label={hr ? "Sljedeći mali korak" : "Next small step"}><input name="nextAction" /></Field><button className="primary">{hr ? "Spremi cilj" : "Save goal"}</button>
    </form>}
    {!state.projects.length && <Empty>{hr ? "Još nema ciljeva. Počni smjerom koji ti je zaista važan." : "No goals yet. Begin with a direction that genuinely matters to you."}</Empty>}
    <div className="goalGrid">{state.projects.map((goal) => {
      const example = goal.id === "p1";
      return <article className="card goalCard" key={goal.id}>
        <div className="goalTop"><Target size={25} /><span className={"status " + goal.status}>{example ? (hr ? "primjer cilja" : "example goal") : hr ? ({ active: "aktivan", paused: "na pauzi", completed: "završen" } as const)[goal.status] : goal.status}</span></div>
        <div className="sectionLabel">{hr ? "SMJER" : "DIRECTION"}</div><h2>{goal.name}</h2>
        <div className="sectionLabel goalOutcomeLabel">{hr ? "KAKO TO IZGLEDA U ŽIVOTU" : "WHAT IT LOOKS LIKE IN LIFE"}</div><p>{goal.outcome}</p>
        <div className="progressMeta"><span>{goal.progress}% {hr ? "pomaka koji sama označiš" : "movement you mark yourself"}</span><span>{100 - goal.progress}% {hr ? "još otvoreno" : "still open"}</span></div>
        <input aria-label={(hr ? "Napredak za " : "Progress for ") + goal.name} className="progressRange" type="range" min="0" max="100" step="5" value={goal.progress} onChange={(e) => update((s) => ({ ...s, projects: s.projects.map((p) => p.id === goal.id ? { ...p, progress: Number(e.target.value), status: Number(e.target.value) === 100 ? "completed" : p.status === "completed" ? "active" : p.status } : p) }))} />
        <small className="goalProgressNote">{hr ? "Ovo nije automatska ocjena ni mjera uspjeha." : "This is not an automatic score or a measure of success."}</small>
        <div className="next"><div className="sectionLabel">{hr ? "JEDAN SLJEDEĆI KORAK" : "ONE NEXT STEP"}</div><p>{goal.nextAction || (hr ? "Odaberi ga kada bude jasnije." : "Choose one when it becomes clear.")}</p></div>
        <Field label={hr ? "Bilješka: gdje sam stala i što želim zapamtiti" : "Note: where I stopped and what I want to remember"}><textarea value={goal.place} onChange={(e) => update((s) => ({ ...s, projects: s.projects.map((p) => p.id === goal.id ? { ...p, place: e.target.value } : p) }))} /></Field>
        <div className="goalActions"><button onClick={() => update((s) => ({ ...s, projects: s.projects.map((p) => p.id === goal.id ? pauseProject(p) : p) }))}>{goal.status === "paused" ? <><Play /> {hr ? "Nastavi" : "Resume"}</> : <><Pause /> {hr ? "Pauziraj" : "Pause"}</>}</button>{example && <button onClick={() => update((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== goal.id) }))}>{hr ? "Makni primjer" : "Remove example"}</button>}</div>
      </article>;
    })}</div>
    <section className="card weeklyCheckin"><div className="sectionLabel">{hr ? "TJEDNI OSVRT · TJEDAN OD" : "WEEKLY CHECK-IN · WEEK OF"} {week}</div><h2>{hr ? "Zastani i primijeti pomak." : "Pause and notice the movement."}</h2><p>{hr ? "Ovdje samo pogledaj što se promijenilo." : "Use this space to notice what changed."}</p><div className="checkinGrid"><Field label={hr ? "Što se pomaknulo naprijed?" : "What moved forward?"}><textarea value={checkin.win} onChange={(e) => setCheckin("win", e.target.value)} /></Field><Field label={hr ? "Što si naučila o svom ritmu?" : "What did you learn about your rhythm?"}><textarea value={checkin.learned} onChange={(e) => setCheckin("learned", e.target.value)} /></Field><Field label={hr ? "Što je važno sljedeći tjedan?" : "What matters next week?"}><textarea value={checkin.next} onChange={(e) => setCheckin("next", e.target.value)} /></Field><Field label={hr ? "Kako ti je bilo s energijom?" : "How was your energy?"}><select value={checkin.energy} onChange={(e) => setCheckin("energy", e.target.value)}><option value="">{hr ? "Ostavi otvoreno" : "Leave open"}</option><option>{hr ? "Tjedan za oporavak" : "Restorative week"}</option><option>{hr ? "Uravnotežen tjedan" : "Balanced week"}</option><option>{hr ? "Zahtjevan tjedan" : "Stretch week"}</option></select></Field></div><span className="quiet">{hr ? "Sprema se automatski u ovom pregledniku." : "Saved automatically in this browser."}</span></section>
    <section className="twelveWeekMethod"><div><span className="sectionLabel">{hr ? "OPCIONALNA METODA" : "OPTIONAL METHOD"}</span><h2>{hr ? "Želiš jedan cilj pratiti kroz 12 tjedana?" : "Want to follow one goal for 12 weeks?"}</h2><p>{hr ? "Ovo nije dio kalendara. Otvori samo ako ti takav način praćenja pomaže." : "This is not part of the calendar. Open it only if this way of tracking helps you."}</p></div><button onClick={() => setShowTwelveWeek((open) => !open)}>{showTwelveWeek ? (hr ? "Zatvori metodu" : "Close method") : (hr ? "Otvori 12 tjedana" : "Open 12 weeks")}</button></section>
    {showTwelveWeek && <TwelveWeekView state={state} update={update} />}
    <ReportsPanel state={state} />
  </>;
}
