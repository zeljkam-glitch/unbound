"use client";

import { Check, Leaf, Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { newId } from "@/lib/id";
import { seasonalContext } from "@/lib/season";
import type { Update } from "@/lib/ui-types";
import { useLanguage } from "./LanguageContext";

export default function SeasonalCompass({ update, today, obligations, weatherCode }: { update: Update; today: string; obligations: string[]; weatherCode?: number }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const [dayContext, setDayContext] = useState({ indoorsAllDay: false, smallSpace: false, cabinFever: false, lowPhysicalEnergy: false });
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
    <div className="seasonalContextChoices" aria-label={hr ? "Prilagodi današnjoj situaciji" : "Fit this to today"}>
      <span>{hr ? "UZMI U OBZIR" : "TAKE INTO ACCOUNT"}</span>
      {([
        ["indoorsAllDay", hr ? "Cijeli dan sam unutra" : "I have been indoors all day"],
        ["smallSpace", hr ? "Mali prostor" : "Small space"],
        ["cabinFever", hr ? "Dosta mi je stana" : "I am tired of the flat"],
        ["lowPhysicalEnergy", hr ? "Malo fizičke energije" : "Low physical energy"],
      ] as const).map(([key, label]) => <button key={key} aria-pressed={dayContext[key]} onClick={() => setDayContext((current) => ({ ...current, [key]: !current[key] }))}>{label}</button>)}
    </div>
  </section>;
}
