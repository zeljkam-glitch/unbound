import Image from "next/image";
import type { State } from "@/lib/model";
import type { Update } from "@/lib/ui-types";
import { useLanguage } from "./LanguageContext";

const moods = [
  { id: "rain-window", src: "/mood/rain-window.jpg", hr: "Poslije kiše", en: "After the rain" },
  { id: "cafe-focus", src: "/mood/cafe-focus.jpg", hr: "Miran fokus", en: "Quiet focus" },
  { id: "dusk-in-motion", src: "/mood/dusk-in-motion.jpg", hr: "U pokretu", en: "In motion" },
  { id: "rainy-street", src: "/mood/rainy-street.jpg", hr: "Večer za sebe", en: "An evening inward" },
  { id: "quiet-cafe", src: "/mood/quiet-cafe.jpg", hr: "Toplo mjesto", en: "A warm place" },
];

export default function MoodWindow({ state, today, update }: { state: State; today: string; update: Update }) {
  const { locale } = useLanguage();
  const selected = state.moods?.[today] || moods[0].id;
  const mood = moods.find((item) => item.id === selected) || moods[0];
  const choose = (id: string) => update((s) => ({ ...s, moods: { ...(s.moods || {}), [today]: id } }));

  return <section className="moodWindow">
    <div className="moodImage"><Image src={mood.src} alt="" fill sizes="(max-width: 760px) 100vw, 70vw" priority /></div>
    <div className="moodCopy">
      <div className="sectionLabel">{locale === "hr" ? "RASPOLOŽENJE DANA" : "MOOD FOR THE DAY"}</div>
      <h2>{locale === "hr" ? mood.hr : mood.en}</h2>
      <p>{locale === "hr" ? "Odaberi kadar koji ti danas daje malo više prostora." : "Choose the frame that gives you a little more room today."}</p>
      <div className="moodChoices" aria-label={locale === "hr" ? "Odaberi raspoloženje" : "Choose a mood"}>
        {moods.map((item) => <button key={item.id} aria-pressed={selected === item.id} onClick={() => choose(item.id)}>
          <Image src={item.src} alt="" width={64} height={44} />
          <span>{locale === "hr" ? item.hr : item.en}</span>
        </button>)}
      </div>
    </div>
  </section>;
}
