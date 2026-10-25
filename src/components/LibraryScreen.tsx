import { newId } from "@/lib/id";
import { localDate, type LibraryCategory, type LibraryItem, type State } from "@/lib/model";
import { ArrowSquareOut, Barbell, BowlFood, Check, FlowerLotus, Handbag, Lightbulb, ListHeart, MapPinArea, Plus, Quotes, ShoppingBagOpen, SunHorizon, Trash, X } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import { Empty, Field } from "./Primitives";
import { useLanguage } from "./LanguageContext";
import { seasonalContext } from "@/lib/season";
import MealPlanner from "./MealPlanner";

const categories: Array<{ id: LibraryCategory; label: string; note: string }> = [
  { id: "shopping", label: "Shopping by store", note: "What to buy, grouped by where you go" },
  { id: "feel-good", label: "Beautiful moments", note: "Small experiences that make an ordinary day feel more alive" },
  { id: "beauty", label: "Beauty atlas", note: "Care, rituals, references and wishes that feel like you" },
  { id: "places", label: "Places & escapes", note: "Restaurants, events and day trips" },
  { id: "meals", label: "Meals", note: "Things you actually like to cook" },
  { id: "workouts", label: "Workouts", note: "Gym, home, running and stretching" },
  { id: "bags", label: "Bag checklists", note: "Gym, faculty, travel and repeat trips" },
  { id: "lists", label: "Lists", note: "Wishes, home, money and things to return to" },
  { id: "quotes", label: "Daily thoughts", note: "A changing collection of words worth returning to" },
];
const icons = { shopping: ShoppingBagOpen, "feel-good": SunHorizon, beauty: FlowerLotus, places: MapPinArea, meals: BowlFood, workouts: Barbell, bags: Handbag, lists: ListHeart, quotes: Quotes };
const workoutLinks = [
  { title: "Yoga with Adriene · 20 min", noteHr: "Početnička joga bez opreme", noteEn: "Beginner yoga with no equipment", url: "https://www.youtube.com/watch?v=v7AYKMP6rOE" },
  { title: "Move With Nicole", noteHr: "Pilates i lagani treninzi kod kuće", noteEn: "Pilates and gentle home workouts", url: "https://www.youtube.com/@MoveWithNicole/playlists" },
  { title: "MadFit", noteHr: "Kratki treninzi bez opreme", noteEn: "Short no-equipment workouts", url: "https://www.youtube.com/@MadFit/playlists" },
];
const checklistParts = (value: string) => value.split(/[,;\n•]+/).map((part) => part.trim()).filter(Boolean);

const listGuide = [
  { category: "bags" as const, hr: { title: "Ne želim svaki put pamtiti što ponijeti", note: "Napravi popis za torbu, put ili situaciju koja se ponavlja." }, en: { title: "I do not want to remember what to pack every time", note: "Make a checklist for a bag, trip, or recurring situation." } },
  { category: "meals" as const, hr: { title: "Želim lakše odlučiti što kuhati ili kupiti", note: "Počni jednim jelom koje stvarno voliš; sastojci mogu postati popis za kupnju." }, en: { title: "I want choosing meals or groceries to feel easier", note: "Begin with one meal you genuinely like; its ingredients can become a shopping list." } },
  { category: "places" as const, hr: { title: "Želim sačuvati mjesto, ideju ili mali bijeg", note: "Zapiši nešto čemu se želiš vratiti, bez obveze da odmah napraviš plan." }, en: { title: "I want to keep a place, idea, or small escape", note: "Save something you want to return to, without having to plan it now." } },
  { category: "feel-good" as const, hr: { title: "Želim otkriti što mi zapravo čini dobro", note: "Počni stvarnim trenutkom u kojem si osjetila malo više mira, radosti ili sebe." }, en: { title: "I want to discover what genuinely feels good", note: "Begin with a real moment when you felt a little more calm, joy, or yourself." } },
  { category: "lists" as const, hr: { title: "Nešto mi se stalno vraća u glavu", note: "Daj mu vlastiti popis i naziv koji tebi ima smisla, bez zadane kategorije." }, en: { title: "Something keeps returning to my mind", note: "Give it its own list and a name that makes sense to you, without a prescribed category." } },
];

export default function LibraryScreen({ state, update }: { state: State; update: Update }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const seasonal = seasonalContext(new Date(), locale);
  const translated = hr ? [
    { id: "shopping" as const, label: "Kupnja po trgovinama", note: "Što trebaš kupiti, složeno prema mjestu na koje ideš" },
    { id: "feel-good" as const, label: "Lijepi trenuci", note: "Mala iskustva zbog kojih običan dan postane življi" },
    { id: "beauty" as const, label: "Atlas ljepote", note: "Njega, rituali, reference i želje u kojima se prepoznaješ" },
    { id: "places" as const, label: "Mjesta i mali bijegovi", note: "Restorani, događanja i jednodnevni izleti" },
    { id: "meals" as const, label: "Jela", note: "Ono što doista voliš kuhati" },
    { id: "workouts" as const, label: "Vježbanje", note: "Teretana, dom, trčanje i istezanje" },
    { id: "bags" as const, label: "Popisi za torbe", note: "Faks, teretana i putovanja koja se ponavljaju" },
    { id: "lists" as const, label: "Popisi", note: "Želje, dom, novac i stvari kojima se želiš vratiti" },
    { id: "quotes" as const, label: "Dnevne misli", note: "Zajednička zbirka riječi kojima se vrijedi vraćati" },
  ] : categories;
  const [category, setCategory] = useState<LibraryCategory>("shopping");
  const [editing, setEditing] = useState<LibraryItem | null>(null);
  const [open, setOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [addedId, setAddedId] = useState("");
  const items = state.library.filter((item) => item.category === category);
  const Icon = icons[category];

  const addToday = (item: LibraryItem) => {
    update((current) => ({ ...current, tasks: [...current.tasks, { id: newId(), title: item.title, date: localDate(), time: "", deadline: "", kind: "optional", duration: 30, repeat: "none", area: category === "shopping" || category === "places" ? "outside" : "anywhere", effort: "light", completedAt: null }] }));
    setAddedId(item.id);
  };
  const toggleChecklist = (itemId: string, entry: string) => update((current) => {
    const checked = current.libraryChecked?.[itemId] || [];
    return { ...current, libraryChecked: { ...current.libraryChecked, [itemId]: checked.includes(entry) ? checked.filter((value) => value !== entry) : [...checked, entry] } };
  });

  return <>
    <div className="libraryTabs">{translated.map((item) => { const CategoryIcon = icons[item.id]; return <button key={item.id} aria-pressed={category === item.id} onClick={() => { setCategory(item.id); setAddedId(""); }}><CategoryIcon size={28} weight="thin" /><span>{item.label}</span></button>; })}</div>
    <section className="libraryOwnership">
      <div><span className="sectionLabel">{hr ? "TVOJA ZBIRKA, TVOJA PRAVILA" : "YOUR LIBRARY, YOUR RULES"}</span><p>{hr ? "Ove kategorije su početne police, ne gotov odgovor. Dodaj svoje ideje, lokacije i vrste popisa; primjeri su samo pomoć dok ne pronađeš što tebi služi." : "These categories are starting shelves, not a finished answer. Add your own ideas, places, and kinds of lists; examples are only support while you discover what serves you."}</p></div>
      <button onClick={() => setGuideOpen(!guideOpen)}><Lightbulb /> {hr ? "Ne znam koji popis trebam" : "I do not know which list I need"}</button>
    </section>
    {guideOpen && <section className="listGuide" aria-label={hr ? "Vodič za odabir popisa" : "List discovery guide"}>
      <div className="listGuideHead"><div><span className="sectionLabel">{hr ? "POČNI OD ONOGA ŠTO ŽELIŠ OLAKŠATI" : "BEGIN WITH WHAT YOU WANT TO MAKE EASIER"}</span><h2>{hr ? "Što ti se sada ponavlja?" : "What keeps repeating right now?"}</h2></div><button className="iconButton" aria-label={hr ? "Zatvori vodič" : "Close guide"} onClick={() => setGuideOpen(false)}><X /></button></div>
      <div className="listGuideChoices">{listGuide.map((choice) => { const copy = choice[hr ? "hr" : "en"]; const GuideIcon = icons[choice.category]; return <button key={choice.category} onClick={() => { setCategory(choice.category); setEditing(null); setOpen(true); setGuideOpen(false); }}><GuideIcon size={26} weight="thin" /><span><strong>{copy.title}</strong><small>{copy.note}</small></span></button>; })}</div>
      <p>{hr ? "Ako se ništa ne uklapa, odaberi Popisi i nazovi ga svojim riječima. Ne mora nalikovati ničijoj tuđoj zbirci." : "If none of these fit, choose Lists and name it in your own words. It does not need to resemble anybody else's library."}</p>
    </section>}
    <div className="sectionHead"><div><div className="sectionLabel"><Icon /> {hr ? "MOJA ZBIRKA" : "MY LIBRARY"}</div><h2>{translated.find((item) => item.id === category)?.label}</h2><p className="quiet">{translated.find((item) => item.id === category)?.note}</p></div><button className="primary" onClick={() => { setEditing(null); setOpen(!open); }}><Plus /> {hr ? "Dodaj" : "Add item"}</button></div>
    {category === "feel-good" && <div className="libraryMood"><Image src="/living-frames/library-rain-window.jpg" alt="" fill sizes="100vw" /><div><span>{seasonal.month.toUpperCase()} · {seasonal.seasonName.toUpperCase()}</span><strong>{seasonal.theme}</strong></div></div>}
    {category === "meals" && <MealPlanner meals={items} state={state} update={update} />}
    {open && <form className="card libraryForm" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const title = String(form.get("title")).trim();
      const details = String(form.get("details")).trim();
      const item: LibraryItem = { id: editing?.id || newId(), category, title, group: String(form.get("group")).trim(), details, url: String(form.get("url") || "").trim() || undefined,
        meal: category === "meals" ? { minutes: Number(form.get("minutes") || 30), servings: Number(form.get("servings") || 2), energy: String(form.get("mealEnergy") || "steady") as "low" | "steady" | "high", ingredients: checklistParts(details), leftoverFriendly: form.get("leftoverFriendly") === "on", season: String(form.get("mealSeason") || "all") as "all" | "spring" | "summer" | "autumn" | "winter" } : undefined };
      update((current) => {
        let library = editing ? current.library.map((existing) => existing.id === editing.id ? item : existing) : [...current.library, item];
        if (!editing && category === "meals" && details) library = [...library, { id: newId(), category: "shopping", title: `${hr ? "Namirnice" : "Ingredients"} · ${title}`, group: hr ? "Planirano jelo" : "Planned meal", details }];
        return { ...current, library };
      });
      setEditing(null); setOpen(false);
    }}>
      <Field label={hr ? "Naziv" : "Name"}><input name="title" required defaultValue={editing?.title} autoFocus /></Field>
      <Field label={category === "shopping" ? (hr ? "Trgovina" : "Store") : category === "quotes" ? (hr ? "Autor ili izvor" : "Author or source") : (hr ? "Skupina ili kontekst" : "Group or context")}><input name="group" required defaultValue={editing?.group} placeholder={category === "shopping" ? "dm, Lidl, plac…" : category === "quotes" ? (hr ? "Autor, knjiga ili UNBOUND" : "Author, book or UNBOUND") : (hr ? "Doma, brzo, vikend…" : "Home, quick, weekend…")} /></Field>
      <Field label={category === "meals" ? (hr ? "Sastojci, odvojeni zarezom" : "Ingredients, separated by commas") : (category === "shopping" || category === "bags" || category === "lists" || category === "beauty" ? (hr ? "Stavke, odvojene zarezom" : "Items, separated by commas") : category === "quotes" ? (hr ? "Kada ti ova misao može koristiti?" : "When might this thought help?") : (hr ? "Detalji ili opis" : "Details or description"))}><textarea name="details" rows={3} defaultValue={editing?.details} /></Field>
      {category === "meals" && <div className="mealProfileFields">
        <Field label={hr ? "Vrijeme pripreme" : "Prep time"}><select name="minutes" defaultValue={editing?.meal?.minutes || 30}><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">60+ min</option></select></Field>
        <Field label={hr ? "Za koliko osoba" : "Servings"}><select name="servings" defaultValue={editing?.meal?.servings || 2}>{[1,2,3,4,5,6].map((value) => <option value={value} key={value}>{value}</option>)}</select></Field>
        <Field label={hr ? "Energija za pripremu" : "Prep energy"}><select name="mealEnergy" defaultValue={editing?.meal?.energy || "steady"}><option value="low">{hr ? "Malo" : "Low"}</option><option value="steady">{hr ? "Dovoljno" : "Steady"}</option><option value="high">{hr ? "Više" : "High"}</option></select></Field>
        <Field label={hr ? "Najbolje godišnje doba" : "Best season"}><select name="mealSeason" defaultValue={editing?.meal?.season || "all"}><option value="all">{hr ? "Cijele godine" : "All year"}</option><option value="spring">{hr ? "Proljeće" : "Spring"}</option><option value="summer">{hr ? "Ljeto" : "Summer"}</option><option value="autumn">{hr ? "Jesen" : "Autumn"}</option><option value="winter">{hr ? "Zima" : "Winter"}</option></select></Field>
        <label className="mealToggle"><input name="leftoverFriendly" type="checkbox" defaultChecked={editing?.meal?.leftoverFriendly} /><span>{hr ? "Dobro je i sutradan" : "Good the next day too"}</span></label>
      </div>}
      {category === "workouts" && <Field label={hr ? "YouTube poveznica" : "YouTube link"}><input type="url" name="url" defaultValue={editing?.url} placeholder="https://youtube.com/…" /></Field>}
      <div className="actions"><button className="primary">{hr ? "Spremi" : "Save item"}</button><button type="button" onClick={() => setOpen(false)}>{hr ? "Odustani" : "Cancel"}</button></div>
    </form>}
    {category === "workouts" && <section className="workoutLinks" aria-label={hr ? "YouTube treninzi" : "YouTube workouts"}><div className="sectionLabel">YOUTUBE</div>{workoutLinks.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer"><span><strong>{link.title}</strong><small>{hr ? link.noteHr : link.noteEn}</small></span><ArrowSquareOut /></a>)}</section>}
    {!items.length && <Empty>{hr ? "Ova će lista postati tvoja s vremenom. Za početak dodaj jednu stvar koju bi stvarno odabrala." : "This list will become yours over time. Begin with one thing you would genuinely choose."}</Empty>}
    <div className="libraryGrid">{items.map((item) => {
      const checklist = category === "shopping" || category === "bags" || category === "lists" || category === "beauty" ? checklistParts(item.details) : [];
      const checked = state.libraryChecked?.[item.id] || [];
      return <article className={`card libraryItem ${category === "quotes" ? "quoteItem" : ""}`} key={item.id}><span className="libraryGroup">{item.group}</span><h3>{item.title}</h3>{checklist.length ? <div className="libraryChecklist">{checklist.map((entry) => <label key={entry}><input type="checkbox" checked={checked.includes(entry)} onChange={() => toggleChecklist(item.id, entry)} /><span>{entry}</span></label>)}</div> : <p>{item.details || (hr ? "Nema dodatnih bilješki." : "No extra notes.")}</p>}{item.url && <a className="libraryUrl" href={item.url} target="_blank" rel="noreferrer">{hr ? "Otvori video" : "Open video"} <ArrowSquareOut /></a>}<div className="actions">{category !== "quotes" && <button className="primary" onClick={() => addToday(item)}>{addedId === item.id ? <Check /> : <Plus />} {addedId === item.id ? (hr ? "Dodano za danas" : "Added for today") : (hr ? "Dodaj danas" : "Add today")}</button>}{addedId === item.id && <a className="buttonLink" href="#today">{hr ? "Otvori Danas" : "Open Today"}</a>}<button onClick={() => { setEditing(item); setOpen(true); window.scrollTo({ top: 0 }); }}>{hr ? "Uredi" : "Edit"}</button><button aria-label={(hr ? "Obriši " : "Delete ") + item.title} onClick={() => update((current) => ({ ...current, library: current.library.filter((existing) => existing.id !== item.id) }))}><Trash /></button></div></article>;
    })}</div>
    {category === "shopping" && <p className="integrationNote">{hr ? "Svaki popis možeš označavati dok kupuješ. Kada dodaš novo jelo sa sastojcima, njegov se popis ovdje stvara automatski." : "You can check off every list as you shop. Add a meal with ingredients and its shopping list will appear here automatically."}</p>}
    {category === "places" && <p className="integrationNote">{hr ? "Događanja u Samoboru još nisu povezana uživo. Zasad ovdje čuvaj mjesta, restorane i ideje za izlet." : "Live Samobor events are not connected yet. For now, keep places, restaurants and trip ideas here."}</p>}
  </>;
}
