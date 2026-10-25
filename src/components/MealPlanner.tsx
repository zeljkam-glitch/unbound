import { addDays, localDate, type LibraryItem, type MealProfile, type State } from "@/lib/model";
import { newId } from "@/lib/id";
import type { Update } from "@/lib/ui-types";
import { BowlFood, Check, Clock, ShoppingBagOpen, Users } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useLanguage } from "./LanguageContext";
import { seasonalContext } from "@/lib/season";

const splitIngredients = (value: string) => value.split(/[,;\n•]+/).map((part) => part.trim()).filter(Boolean);
const fallbackProfile = (item: LibraryItem): MealProfile => {
  const minutes = Number(item.details.match(/(\d+)\s*min/i)?.[1] || 30);
  const parts = splitIngredients(item.details);
  const ingredients = parts.length > 1 && !parts.some((part) => /^\d+\s*min/i.test(part)) ? parts : [];
  return { minutes, servings: 2, energy: "steady", ingredients, leftoverFriendly: false, season: "all" };
};
const normalized = (value: string) => value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function MealPlanner({ meals, state, update }: { meals: LibraryItem[]; state: State; update: Update }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const seasonal = seasonalContext(new Date(), locale);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [date, setDate] = useState(localDate());
  const [people, setPeople] = useState(2);
  const [minutes, setMinutes] = useState(30);
  const [energy, setEnergy] = useState<MealProfile["energy"]>("steady");
  const [leftovers, setLeftovers] = useState(true);
  const [pantry, setPantry] = useState("");
  const [plannedId, setPlannedId] = useState("");

  const suggestions = useMemo(() => {
    const energyRank = { low: 0, steady: 1, high: 2 };
    return [...meals].sort((a, b) => {
      const score = (item: LibraryItem) => {
        const profile = item.meal || fallbackProfile(item);
        return Number(profile.minutes <= minutes) * 4
          + Number(energyRank[profile.energy] <= energyRank[energy]) * 3
          + Number(profile.season === "all" || profile.season === seasonal.season) * 2
          + Number(leftovers && profile.leftoverFriendly) * 2;
      };
      return score(b) - score(a);
    }).slice(0, 3);
  }, [energy, leftovers, meals, minutes, seasonal.season]);

  const plan = (item: LibraryItem) => {
    const profile = item.meal || fallbackProfile(item);
    const pantryItems = splitIngredients(pantry).map(normalized);
    const missing = profile.ingredients.filter((ingredient) => !pantryItems.some((saved) => normalized(ingredient).includes(saved) || saved.includes(normalized(ingredient))));
    update((current) => {
      const tasks = [...current.tasks, {
        id: newId(), title: item.title, date, time: "", deadline: "", kind: "flexible" as const,
        duration: profile.minutes, repeat: "none" as const, area: "home" as const,
        effort: profile.energy === "high" ? "deep" as const : "light" as const, completedAt: null,
        notes: hr ? `Obrok za ${people}.` : `Meal for ${people}.`, tags: ["meal"],
      }];
      if (leftovers && profile.leftoverFriendly) tasks.push({
        id: newId(), title: `${hr ? "Ostaci" : "Leftovers"} · ${item.title}`, date: addDays(date, 1), time: "", deadline: "", kind: "optional", duration: 10, repeat: "none", area: "home", effort: "light", completedAt: null, notes: hr ? "Planirano od prethodnog obroka." : "Planned from the previous meal.", tags: ["meal", "leftovers"],
      });
      let library = current.library;
      if (missing.length) {
        const title = hr ? "Kupnja za planirana jela" : "Shopping for planned meals";
        const existing = library.find((entry) => entry.category === "shopping" && entry.title === title);
        if (existing) {
          const combined = Array.from(new Set([...splitIngredients(existing.details), ...missing]));
          library = library.map((entry) => entry.id === existing.id ? { ...entry, details: combined.join(", ") } : entry);
        } else {
          library = [...library, { id: newId(), category: "shopping", title, group: hr ? "Trgovina po izboru" : "Store of choice", details: missing.join(", ") }];
        }
      }
      return { ...current, tasks, library };
    });
    setPlannedId(item.id);
  };

  return <section className="mealPlanner" aria-label={hr ? "Planiranje obroka" : "Meal planning"}>
    <div className="mealPlannerIntro">
      <div><span className="sectionLabel">{hr ? "OD JELA DO STVARNOG PLANA" : "FROM MEALS TO A REAL PLAN"}</span><h3>{hr ? "Što bi danas stvarno mogla kuhati?" : "What could you realistically cook today?"}</h3><p>{hr ? `${seasonal.month} · ${seasonal.seasonName}. Plan uzima u obzir tvoj kapacitet, vrijeme i ono što već imaš.` : `${seasonal.month} · ${seasonal.seasonName}. The plan considers your capacity, time, and what you already have.`}</p></div>
      <button className="primary" onClick={() => { setOpen(!open); setReady(false); }}>{open ? (hr ? "Zatvori" : "Close") : (hr ? "Složi plan obroka" : "Plan a meal")}</button>
    </div>
    {open && <div className="mealWizard">
      <div className="mealWizardFields">
        <div className="mealWizardChoice"><span><Users size={18} weight="thin" />{hr ? "Za koliko osoba?" : "How many people?"}</span><div className="mealInlineChoices" aria-label={hr ? "Broj osoba" : "Number of people"}>{[1,2,3,4,5,6].map((value) => <button type="button" key={value} aria-pressed={people === value} onClick={() => setPeople(value)}>{value}</button>)}</div></div>
        <div className="mealWizardChoice"><span><Clock size={18} weight="thin" />{hr ? "Koliko vremena imaš?" : "How much time do you have?"}</span><div className="mealInlineChoices" aria-label={hr ? "Vrijeme za kuhanje" : "Cooking time"}>{[15,30,45,60].map((value) => <button type="button" key={value} aria-pressed={minutes === value} onClick={() => setMinutes(value)}>{value === 60 ? "60+" : value} min</button>)}</div></div>
        <label><span><BowlFood size={18} weight="thin" />{hr ? "Kada kuhaš?" : "When are you cooking?"}</span><input aria-label={hr ? "Datum obroka" : "Meal date"} type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      </div>
      <fieldset><legend>{hr ? "Koliko energije imaš za pripremu?" : "How much energy do you have for prep?"}</legend><div className="mealChoices">{(["low","steady","high"] as const).map((value) => <button type="button" key={value} aria-pressed={energy === value} onClick={() => setEnergy(value)}>{hr ? ({ low: "Malo", steady: "Dovoljno", high: "Imam volje" }[value]) : ({ low: "Low", steady: "Enough", high: "I have energy" }[value])}</button>)}</div></fieldset>
      <label className="pantryField"><span>{hr ? "Što već imaš kod kuće?" : "What do you already have?"}</span><input aria-label={hr ? "Namirnice kod kuće" : "Ingredients at home"} value={pantry} onChange={(event) => setPantry(event.target.value)} placeholder={hr ? "npr. riža, luk, mrkva" : "e.g. rice, onion, carrot"} /><small>{hr ? "Odvoji zarezom. Te namirnice neće ući na popis za kupnju." : "Separate with commas. These will stay off the shopping list."}</small></label>
      <label className="mealToggle"><input type="checkbox" checked={leftovers} onChange={(event) => setLeftovers(event.target.checked)} /><span>{hr ? "Ako može, neka ostane i za sutra" : "When possible, make enough for tomorrow"}</span></label>
      <button className="primary mealSuggest" onClick={() => setReady(true)} disabled={!meals.length}>{hr ? "Pokaži što odgovara" : "Show what fits"}</button>
      {!meals.length && <p className="mealHint">{hr ? "Prvo spremi barem jedno svoje jelo. UNBOUND neće izmišljati što voliš jesti." : "Save at least one of your own meals first. UNBOUND will not invent what you like to eat."}</p>}
      {ready && meals.length > 0 && <div className="mealSuggestions"><div className="mealSuggestionsHead"><span>{hr ? "NAJBOLJE IZ TVOJE ZBIRKE" : "BEST FROM YOUR LIBRARY"}</span><small>{hr ? "Ti biraš; ovo su samo najbliže opcije." : "You choose; these are simply the closest fits."}</small></div>{suggestions.map((item) => { const profile = item.meal || fallbackProfile(item); return <article key={item.id}><div><span>{item.group} · {profile.minutes} min</span><h4>{item.title}</h4><p>{profile.ingredients.length ? profile.ingredients.join(" · ") : item.details}</p></div><button className={plannedId === item.id ? "plannedMeal" : "primary"} onClick={() => plan(item)}>{plannedId === item.id ? <><Check />{hr ? "U planu" : "Planned"}</> : <><ShoppingBagOpen />{hr ? "Planiraj i dodaj kupnju" : "Plan and add shopping"}</>}</button></article>; })}</div>}
    </div>}
  </section>;
}
