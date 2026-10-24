import { addDays, localDate, type State, type TwelveWeekPlan } from "@/lib/model";
import type { Update } from "@/lib/ui-types";
import { Check, Circle } from "@phosphor-icons/react";
import { Field } from "./Primitives";
import { useLanguage } from "./LanguageContext";

const fallback = (): TwelveWeekPlan => ({ startDate: localDate(), outcome: "", why: "", leadAction: "", weeklyTarget: 3, weeks: {} });

export default function TwelveWeekView({ state, update }: { state: State; update: Update }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const plan = state.twelveWeek || fallback();
  const setPlan = (patch: Partial<TwelveWeekPlan>) => update((s) => ({ ...s, twelveWeek: { ...(s.twelveWeek || fallback()), ...patch } }));
  const setWeek = (week: number, patch: Partial<{ focus: string; reviewed: boolean }>) => update((s) => {
    const current = s.twelveWeek || fallback();
    const previous = current.weeks[week] || { focus: "", reviewed: false };
    return { ...s, twelveWeek: { ...current, weeks: { ...current.weeks, [week]: { ...previous, ...patch } } } };
  });
  const complete = Object.values(plan.weeks).filter((week) => week.reviewed).length;
  return <div className="twelveLayout">
    <aside className="cycleIntro"><div className="sectionLabel">{hr ? "12 TJEDANA" : "12 WEEK VIEW"}</div><h2>{hr ? <>Dvanaest tjedana.<br />Jedan jasan smjer.</> : <>Twelve weeks.<br />One clear direction.</>}</h2><p>{hr ? "Dovoljno dugo za stvaran pomak. Dovoljno kratko da ostane blizu." : "Long enough for real movement. Short enough to stay close."}</p><div className="cycleScore"><strong>{complete}<span>/12</span></strong><small>{hr ? "tjednih osvrta završeno" : "weekly reviews complete"}</small></div></aside>
    <section className="cycleMain">
      <div className="cycleFields"><Field label={hr ? "Ishod koji ti je važan" : "The outcome that matters"}><input value={plan.outcome} onChange={(e) => setPlan({ outcome: e.target.value })} placeholder={hr ? "Što želiš da zaista bude drukčije?" : "What do you want to be genuinely different?"} /></Field><Field label={hr ? "Zašto baš sada" : "Why this matters now"}><textarea value={plan.why} onChange={(e) => setPlan({ why: e.target.value })} placeholder={hr ? "Razlog kojem se želiš vraćati" : "The reason you want to return to"} /></Field><Field label={hr ? "Radnja koja te vodi" : "Leading action"}><input value={plan.leadAction} onChange={(e) => setPlan({ leadAction: e.target.value })} placeholder={hr ? "Nešto ponovljivo što je u tvojoj moći" : "A repeatable action within your control"} /></Field><div className="cyclePair"><Field label={hr ? "Početak ciklusa" : "Cycle starts"}><input type="date" value={plan.startDate} onChange={(e) => setPlan({ startDate: e.target.value })} /></Field><Field label={hr ? "Puta tjedno" : "Times per week"}><input type="number" min="1" max="14" value={plan.weeklyTarget} onChange={(e) => setPlan({ weeklyTarget: Number(e.target.value) || 1 })} /></Field></div></div>
      <div className="cycleWeeks">{Array.from({ length: 12 }, (_, index) => {
        const number = index + 1, week = plan.weeks[number] || { focus: "", reviewed: false }, start = addDays(plan.startDate, index * 7), end = addDays(start, 6);
        return <article className={week.reviewed ? "cycleWeek reviewed" : "cycleWeek"} key={number}><button aria-label={hr ? `${week.reviewed ? "Ponovno otvori" : "Dovrši"} osvrt za ${number}. tjedan` : `${week.reviewed ? "Reopen" : "Complete"} week ${number} review`} onClick={() => setWeek(number, { reviewed: !week.reviewed })}>{week.reviewed ? <Check /> : <Circle />}</button><div><span>{hr ? "TJEDAN" : "WEEK"} {String(number).padStart(2, "0")} · {new Date(start + "T12:00:00").toLocaleDateString(hr ? "hr-HR" : "en-GB", { day: "numeric", month: "short" })}–{new Date(end + "T12:00:00").toLocaleDateString(hr ? "hr-HR" : "en-GB", { day: "numeric", month: "short" })}</span><input aria-label={`${hr ? "Fokus za tjedan" : "Focus for week"} ${number}`} value={week.focus} onChange={(e) => setWeek(number, { focus: e.target.value })} placeholder={number === 1 ? (hr ? "Fokus ovoga tjedna" : "This week’s focus") : (hr ? "Ostavi otvoreno dok se ne razjasni" : "Leave open until it becomes clear")} /></div></article>;
      })}</div>
    </section>
  </div>;
}
