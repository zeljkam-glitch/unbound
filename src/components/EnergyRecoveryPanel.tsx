import { ArrowRight, Check, Eye, FirstAid, Moon, Plus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { newId } from "@/lib/id";
import { compareRecovery, recommendRecovery, recoveryInsights, recoveryNeeds, recoveryProtocols } from "@/lib/recovery";
import type { RecoveryCause, RecoveryCheckin, RecoveryNeed, State } from "@/lib/model";
import type { Update } from "@/lib/ui-types";
import { useLanguage } from "./LanguageContext";

const causes: Array<{ id: RecoveryCause; hr: string; en: string }> = [
  { id: "mental", hr: "Mentalni rad ili učenje", en: "Mental work or study" },
  { id: "physical", hr: "Fizička aktivnost", en: "Physical activity" },
  { id: "stress", hr: "Stres ili previše podražaja", en: "Stress or too much input" },
  { id: "sleep", hr: "Manjak sna", en: "Lack of sleep" },
  { id: "other", hr: "Nešto drugo", en: "Something else" },
];

function Scale({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <fieldset className="recoveryScale"><legend>{label}</legend><div>{[1, 2, 3, 4, 5].map((number) => <button type="button" key={number} aria-label={`${label} ${number} / 5`} aria-pressed={value === number} onClick={() => onChange(number)}>{number}</button>)}</div><small><span>1</span><span>5</span></small></fieldset>;
}

export default function EnergyRecoveryPanel({ state, today, update }: { state: State; today: string; update: Update }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const [energy, setEnergy] = useState(3);
  const [focus, setFocus] = useState(3);
  const [cause, setCause] = useState<RecoveryCause>("mental");
  const [need, setNeed] = useState<RecoveryNeed>("study-recovery");
  const [protocolId, setProtocolId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [stage, setStage] = useState<"checkin" | "recommendation" | "after">("checkin");
  const [afterEnergy, setAfterEnergy] = useState(3);
  const [afterFocus, setAfterFocus] = useState(3);
  const [rested, setRested] = useState<"yes" | "same" | "no">("same");
  const [saved, setSaved] = useState(false);
  const [afterSaved, setAfterSaved] = useState(false);

  const protocol = useMemo(() => protocolId ? recoveryProtocols.find((item) => item.id === protocolId) : undefined, [protocolId]);
  const studyChoices = recoveryProtocols.filter((item) => item.need === "study-recovery");
  const before = (state.recoveryCheckins || []).find((item) => item.sessionId === sessionId && item.phase === "before");
  const comparison = before ? compareRecovery(before, { energy: afterEnergy, focus: afterFocus, rested }) : null;
  const insights = recoveryInsights(state.recoveryCheckins || []);
  const recordedSessions = Object.values(insights).reduce((sum, item) => sum + item.uses, 0);
  const bestProtocolId = Object.entries(insights).filter(([, item]) => item.uses >= 2).sort((a, b) => (b[1].helped / b[1].uses) - (a[1].helped / a[1].uses))[0]?.[0];
  const bestProtocol = recoveryProtocols.find((item) => item.id === bestProtocolId);

  const start = () => {
    const suggestion = recommendRecovery({ energy, focus, cause, need, evening: new Date().getHours() >= 20, history: state.recoveryCheckins || [] });
    const id = newId();
    const checkin: RecoveryCheckin = { id: newId(), sessionId: id, date: today, createdAt: new Date().toISOString(), phase: "before", energy, focus, cause, need, protocolId: suggestion.id };
    update((current) => ({ ...current, recoveryCheckins: [...(current.recoveryCheckins || []), checkin], energies: { ...current.energies, [today]: String(energy) }, focus: { ...current.focus, [today]: String(focus) } }));
    setSessionId(id);
    setProtocolId(suggestion.id);
    setAfterEnergy(energy);
    setAfterFocus(focus);
    setSaved(false);
    setAfterSaved(false);
    setStage("recommendation");
  };

  const addToToday = () => {
    if (!protocol) return;
    update((current) => ({ ...current, tasks: [...current.tasks, { id: newId(), title: protocol.title[locale], date: today, time: "", deadline: "", kind: "optional", duration: protocol.minutes, repeat: "none", area: protocol.need === "body-recovery" || protocol.need === "energy" ? "anywhere" : "home", effort: "light", completedAt: null, tags: ["recovery", protocol.need], notes: protocol.steps[locale].join(" · ") }] }));
    setSaved(true);
  };

  const saveAfter = () => {
    if (!protocol || !sessionId || afterSaved) return;
    const checkin: RecoveryCheckin = { id: newId(), sessionId, date: today, createdAt: new Date().toISOString(), phase: "after", energy: afterEnergy, focus: afterFocus, cause, need, protocolId: protocol.id, rested };
    update((current) => ({ ...current, recoveryCheckins: [...(current.recoveryCheckins || []), checkin], energies: { ...current.energies, [today]: String(afterEnergy) }, focus: { ...current.focus, [today]: String(afterFocus) } }));
    setAfterSaved(true);
  };

  return <section className="energyRecovery" aria-labelledby="energy-recovery-title">
    <header className="recoveryIntro">
      <div className="sectionLabel">{hr ? "ENERGIJA I OPORAVAK" : "ENERGY & RECOVERY"}</div>
      <div><h2 id="energy-recovery-title">{hr ? "Što ti sada zapravo treba?" : "What do you actually need now?"}</h2><p>{hr ? "Ne pokušavamo svaki umor pretvoriti u još energije. Prvo razlikujemo fokus, preopterećenost i stvarnu potrebu za odmorom." : "We do not try to turn every kind of fatigue into more energy. First we distinguish focus, overload, and a real need for rest."}</p></div>
      <span className="recoveryPrivacy">{hr ? "Privatno · ostaje na ovom uređaju" : "Private · stays on this device"}</span>
    </header>
    {recordedSessions > 0 && <div className="recoveryLearning"><span>{hr ? `${recordedSessions} spremljenih usporedbi` : `${recordedSessions} saved comparison${recordedSessions === 1 ? "" : "s"}`}</span><p>{bestProtocol ? (hr ? `Za sada ti najčešće pomaže: ${bestProtocol.title.hr}.` : `So far, this most often helps: ${bestProtocol.title.en}.`) : (hr ? "Još učimo što ti vraća fokus, što doista odmara i što čuva energiju za sutra." : "We are still learning what restores focus, what truly rests you, and what protects tomorrow’s energy.")}</p></div>}

    {stage === "checkin" && <div className="recoveryCheckin">
      <div className="recoveryMeasures"><Scale label={hr ? "Energija" : "Energy"} value={energy} onChange={setEnergy} /><Scale label={hr ? "Fokus" : "Focus"} value={focus} onChange={setFocus} /></div>
      <div className="recoveryQuestion"><span className="sectionLabel">{hr ? "ŠTO TE NAJVIŠE TROŠI?" : "WHAT IS DRAINING YOU?"}</span><div className="recoveryChoiceRow">{causes.map((item) => <button key={item.id} aria-pressed={cause === item.id} onClick={() => setCause(item.id)}>{item[locale]}</button>)}</div></div>
      <div className="recoveryQuestion"><span className="sectionLabel">{hr ? "ODABERI SMJER" : "CHOOSE A DIRECTION"}</span><div className="recoveryNeeds">{recoveryNeeds.map((item, index) => <button key={item.id} aria-pressed={need === item.id} onClick={() => setNeed(item.id)}><small>0{index + 1}</small><strong>{item[locale]}</strong><span>{hr ? item.noteHr : item.noteEn}</span></button>)}</div></div>
      <button className="recoveryContinue" onClick={start}>{hr ? "Predloži mi sljedeći korak" : "Suggest my next step"} <ArrowRight /></button>
    </div>}

    {stage === "recommendation" && protocol && <div className="recoveryRecommendation">
      <aside><span className="sectionLabel">{hr ? "PREPORUKA ZA OVO STANJE" : "RECOMMENDED FOR THIS STATE"}</span><strong>{energy}/5</strong><small>{hr ? "energija" : "energy"}</small><strong>{focus}/5</strong><small>{hr ? "fokus" : "focus"}</small></aside>
      <div className="recoveryProtocol">
        <div className="protocolHeading"><div><span>{protocol.minutes} {hr ? "MINUTA" : "MINUTES"}</span><h3>{protocol.title[locale]}</h3><p>{protocol.summary[locale]}</p></div><button onClick={addToToday} disabled={saved}>{saved ? <Check /> : <Plus />}{saved ? (hr ? "Dodano u današnji plan" : "Added to today") : (hr ? "Dodaj u današnji plan" : "Add to today")}</button></div>
        {need === "study-recovery" && <div className="protocolLengths" aria-label={hr ? "Trajanje oporavka" : "Recovery length"}>{studyChoices.map((item) => <button key={item.id} aria-pressed={protocol.id === item.id} onClick={() => setProtocolId(item.id)}><strong>{item.minutes}</strong><span>{hr ? "min" : "min"}</span></button>)}</div>}
        <p className="protocolWhen"><strong>{hr ? "Odaberi kada:" : "Choose this when:"}</strong> {protocol.when[locale]}</p>
        <ol>{protocol.steps[locale].map((step) => <li key={step}>{step}</li>)}</ol>
        {energy === 3 && focus === 3 && cause === "mental" && protocol.id === "active-recovery-10" && <div className="recoveryHour"><div><span>0–5</span><p>{hr ? "Zatvori otvorene petlje i zapiši gdje nastavljaš." : "Close open loops and write where you will resume."}</p></div><div><span>5–20</span><p>{hr ? "Hodaj bez ekrana i bez novog sadržaja." : "Walk without a screen or new input."}</p></div><div><span>20–30</span><p>{hr ? "Lagano razgibaj tijelo, popij vodu i pojedi nešto ako treba." : "Gently move your body, drink water, and eat if needed."}</p></div><div><span>30–45</span><p>{hr ? "Odaberi aktivnost s malo mentalnog napora." : "Choose a low-cognitive activity."}</p></div><div><span>45–60</span><p>{hr ? "Ponovno provjeri energiju, fokus i osjećaš li više odmora." : "Check energy, focus, and whether you feel more rested."}</p></div></div>}
        <div className="eyeRule"><Eye weight="thin" /><p><strong>{hr ? "20–20–20 za oči" : "20–20–20 for your eyes"}</strong>{hr ? " Svakih 20 minuta, 20 sekundi gledaj nešto udaljeno barem 6 metara." : " Every 20 minutes, look at something at least 6 metres away for 20 seconds."}</p></div>
        {protocol.need === "body-recovery" && <div className="recoverySafety"><FirstAid weight="thin" /><p><strong>{hr ? "Obična zategnutost nije isto što i ozljeda." : "Ordinary soreness is not the same as injury."}</strong> {hr ? "Oštra bol, oticanje ili bol koja se pogoršava traže procjenu. Izrazito jaka bol uz slabost ili tamnu mokraću zahtijeva hitnu medicinsku procjenu." : "Sharp pain, swelling, or worsening pain needs assessment. Unusually severe pain with weakness or dark urine needs urgent medical assessment."}</p></div>}
        <div className="recoveryActions"><button onClick={() => setStage("checkin")}>{hr ? "Promijeni odabir" : "Change selection"}</button><button className="primary" onClick={() => setStage("after")}>{hr ? "Provjeri stanje nakon toga" : "Check in afterward"} <ArrowRight /></button></div>
      </div>
    </div>}

    {stage === "after" && protocol && <div className="recoveryAfter">
      <div><span className="sectionLabel">{hr ? "NAKON OPORAVKA" : "AFTER RECOVERY"}</span><h3>{hr ? "Je li se nešto promijenilo?" : "Did anything change?"}</h3><p>{hr ? "Isto nije nužno neuspjeh. Ponekad je vrijednost u tome što se stanje nije dodatno pogoršalo." : "No change is not necessarily failure. Sometimes the value is preventing a further decline."}</p></div>
      <div className="recoveryMeasures"><Scale label={hr ? "Energija nakon" : "Energy after"} value={afterEnergy} onChange={setAfterEnergy} /><Scale label={hr ? "Fokus nakon" : "Focus after"} value={afterFocus} onChange={setAfterFocus} /></div>
      <fieldset className="restedQuestion"><legend>{hr ? "Osjećaš li se barem malo odmornije, čak i ako energija nije viša?" : "Do you feel at least a little more rested, even if energy is not higher?"}</legend><div>{(["yes", "same", "no"] as const).map((value) => <button key={value} aria-pressed={rested === value} onClick={() => setRested(value)}>{hr ? ({ yes: "Da", same: "Jednako", no: "Ne" } as const)[value] : ({ yes: "Yes", same: "About the same", no: "No" } as const)[value]}</button>)}</div></fieldset>
      <button className="primary" onClick={saveAfter} disabled={afterSaved}>{afterSaved ? <Check /> : null}{afterSaved ? (hr ? "Usporedba spremljena" : "Comparison saved") : (hr ? "Spremi usporedbu" : "Save comparison")}</button>
      {comparison && afterSaved && <div className={`recoveryResult ${comparison.outcome}`} role="status"><strong>{comparison.outcome === "improved" ? (hr ? "Stanje se popravilo." : "Your state improved.") : comparison.outcome === "declined" ? (hr ? "Ovaj put treba više odmora." : "This time you need more rest.") : comparison.helped ? (hr ? "Brojke su iste, ali osjećaš više odmora." : "The numbers are the same, but you feel more rested.") : (hr ? "Za sada nema promjene." : "No change for now.")}</strong><p>{comparison.outcome === "maintained" && !comparison.helped ? (hr ? "Nemoj odmah dodavati još produktivnosti. Promijeni okruženje pet minuta, napravi jedan jednostavan zadatak deset minuta i ponovno provjeri stanje pet minuta. Ako ni tada nema pomaka, završi s radom." : "Do not add more productivity immediately. Change your environment for five minutes, do one simple task for ten, and check again for five minutes. If nothing shifts, stop working.") : (hr ? "Zabilježeno je što je djelovalo, kako bi preporuke s vremenom postale osobnije." : "What helped has been recorded so recommendations can become more personal over time.")}</p></div>}
      <div className="recoverySafety subtle"><Moon weight="thin" /><p>{hr ? "Ponavljajuće ili sve jače glavobolje i naprezanje očiju nisu nešto što treba rješavati samo pauzama. Razgovaraj sa zdravstvenim stručnjakom." : "Repeated or worsening headaches and eye strain should not be managed with breaks alone. Speak with a healthcare professional."}</p></div>
    </div>}
  </section>;
}
