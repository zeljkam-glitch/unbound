"use client";

import { Check, Leaf, Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { newId } from "@/lib/id";
import { seasonalContext } from "@/lib/season";
import type { DayContext, State } from "@/lib/model";
import type { Update } from "@/lib/ui-types";
import { useLanguage } from "./LanguageContext";

const emptyDayContext = (): DayContext => ({ indoorsAllDay: false, smallSpace: false, cabinFever: false, lowPhysicalEnergy: false });

export default function SeasonalCompass({ state, update, today, obligations, weatherCode }: { state: State; update: Update; today: string; obligations: string[]; weatherCode?: number }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const dayContext = state.dayContexts?.[today] || emptyDayContext();
  const seasonal = seasonalContext(new Date(`${today}T12:00:00`), locale, { obligations, weatherCode, hour: new Date().getHours(), ...dayContext });
  const [saved, setSaved] = useState<string[]>([]);
  const save = (idea: string) => {
    update((state) => ({ ...state, thoughts: [{ id: newId(), text: idea, createdAt: new Date().toISOString() }, ...state.thoughts] }));
    setSaved((current) => current.includes(idea) ? current : [...current, idea]);
  };
  return <section className={`seasonalCompass season-${seasonal.season}`} aria-labelledby="seasonal-heading">
    <div className="seasonalIntro">
      <Leaf />
      <div className="sectionLabel">{seasonal.month.toUpperCase()} · {seasonal.seasonName.toUpperCase()}</div>
      <h2 id="seasonal-heading">{hr ? "I sezona je dio plana." : "The season belongs in the plan."}</h2>
      <p>{seasonal.theme}</p>
    </div>
    <div className="seasonalIdeas">
      {seasonal.ideas.map((idea, index) => <article key={idea}><span>0{index + 1}</span><p>{idea}</p><button aria-label={`${hr ? "Spremi ideju" : "Save idea"}: ${idea}`} onClick={() => save(idea)} disabled={saved.includes(idea)}>{saved.includes(idea) ? <Check /> : <Plus />} {saved.includes(idea) ? (hr ? "Spremljeno" : "Saved") : (hr ? "Sačuvaj kao ideju" : "Keep as an idea")}</button></article>)}
    </div>
    <details className="seasonalContextChoices">
      <summary><span>{hr ? "Je li danas nešto od ovoga važno?" : "Does any of this matter today?"}</span><small>{hr ? "Odabir vrijedi samo za ovaj datum" : "Your choice applies only to this date"}</small></summary>
      <div aria-label={hr ? "Prilagodi samo današnjoj situaciji" : "Fit this date only"}>
      {([
        ["indoorsAllDay", hr ? "Cijeli dan sam unutra" : "I have been indoors all day"],
        ["smallSpace", hr ? "Mali prostor" : "Small space"],
        ["cabinFever", hr ? "Dosta mi je stana" : "I am tired of the flat"],
        ["lowPhysicalEnergy", hr ? "Malo fizičke energije" : "Low physical energy"],
      ] as const).map(([key, label]) => <button type="button" key={key} aria-pressed={dayContext[key]} onClick={() => update((current) => ({ ...current, dayContexts: { ...(current.dayContexts || {}), [today]: { ...(current.dayContexts?.[today] || emptyDayContext()), [key]: !dayContext[key] } } }))}>{label}</button>)}
      {Object.values(dayContext).some(Boolean) && <button type="button" className="seasonalContextClear" onClick={() => update((current) => { const next = { ...(current.dayContexts || {}) }; delete next[today]; return { ...current, dayContexts: next }; })}>{hr ? "Očisti današnji odabir" : "Clear today’s choices"}</button>}
      </div>
    </details>
  </section>;
}
