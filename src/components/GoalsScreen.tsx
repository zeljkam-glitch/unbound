import { newId } from "@/lib/id";
import { localDate, pauseProject, weekStart, type State } from "@/lib/model";
import { Pause, Play, Plus, Target } from "@phosphor-icons/react";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import { Empty, Field } from "./Primitives";

export default function GoalsScreen({ state, update }: { state: State; update: Update }) {
  const [open, setOpen] = useState(false);
  const week = localDate(weekStart());
  const checkin = state.weeklyCheckins[week] || { win: "", learned: "", next: "", energy: "" };
  const setCheckin = (key: keyof typeof checkin, value: string) => update((s) => ({ ...s, weeklyCheckins: { ...s.weeklyCheckins, [week]: { ...(s.weeklyCheckins[week] || { win: "", learned: "", next: "", energy: "" }), [key]: value } } }));
  return <>
    <div className="sectionHead"><div><div className="sectionLabel">GOALS · WITHOUT THE GRIND</div><h2>See how far you’ve come — and what’s left.</h2></div><button className="primary" onClick={() => setOpen(!open)}><Plus /> New goal</button></div>
    {open && <form className="card goalForm" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); update((s) => ({ ...s, projects: [...s.projects, { id: newId(), name: String(f.get("name")).trim(), outcome: String(f.get("outcome")).trim(), deadline: String(f.get("deadline")), nextAction: String(f.get("nextAction")).trim(), status: "active", place: "", progress: 0 }] })); e.currentTarget.reset(); setOpen(false); }}>
      <Field label="Goal"><input name="name" required autoFocus /></Field><Field label="What would success feel like?"><input name="outcome" required /></Field><Field label="Target date (optional)"><input name="deadline" type="date" /></Field><Field label="Next gentle step"><input name="nextAction" /></Field><button className="primary">Save goal</button>
    </form>}
    {!state.projects.length && <Empty>No goals yet. Start with a direction that matters to you.</Empty>}
    <div className="goalGrid">{state.projects.map((goal) => <article className="card goalCard" key={goal.id}><div className="goalTop"><Target size={25} /><span className={"status " + goal.status}>{goal.status}</span></div><h2>{goal.name}</h2><p>{goal.outcome}</p><div className="progressMeta"><span>{goal.progress}% there</span><span>{100 - goal.progress}% remaining</span></div><input aria-label={"Progress for " + goal.name} className="progressRange" type="range" min="0" max="100" step="5" value={goal.progress} onChange={(e) => update((s) => ({ ...s, projects: s.projects.map((p) => p.id === goal.id ? { ...p, progress: Number(e.target.value), status: Number(e.target.value) === 100 ? "completed" : p.status === "completed" ? "active" : p.status } : p) }))} /><div className="next"><div className="sectionLabel">NEXT STEP</div><p>{goal.nextAction || "Choose one when the moment is right."}</p></div><Field label="Save my place"><textarea value={goal.place} onChange={(e) => update((s) => ({ ...s, projects: s.projects.map((p) => p.id === goal.id ? { ...p, place: e.target.value } : p) }))} /></Field><button onClick={() => update((s) => ({ ...s, projects: s.projects.map((p) => p.id === goal.id ? pauseProject(p) : p) }))}>{goal.status === "paused" ? <><Play /> Resume</> : <><Pause /> Pause</>}</button></article>)}</div>
    <section className="card weeklyCheckin"><div className="sectionLabel">WEEKLY CHECK-IN · WEEK OF {week}</div><h2>A pause to notice movement.</h2><p>Not a scorecard. Just a place to see what changed.</p><div className="checkinGrid"><Field label="What moved forward?"><textarea value={checkin.win} onChange={(e) => setCheckin("win", e.target.value)} /></Field><Field label="What did you learn about your rhythm?"><textarea value={checkin.learned} onChange={(e) => setCheckin("learned", e.target.value)} /></Field><Field label="What matters next week?"><textarea value={checkin.next} onChange={(e) => setCheckin("next", e.target.value)} /></Field><Field label="Overall capacity"><select value={checkin.energy} onChange={(e) => setCheckin("energy", e.target.value)}><option value="">Leave open</option><option>Restorative week</option><option>Balanced week</option><option>Stretch week</option></select></Field></div><span className="quiet">Saved automatically in this browser.</span></section>
  </>;
}
