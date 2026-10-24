import { newId } from "@/lib/id";
import { localDate, type LibraryCategory, type LibraryItem, type State } from "@/lib/model";
import { ArrowSquareOut, Barbell, BowlFood, Check, FlowerLotus, Handbag, ListHeart, MapPinArea, Plus, Quotes, ShoppingBagOpen, SunHorizon, Trash } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import { Empty, Field } from "./Primitives";
import { useLanguage } from "./LanguageContext";
import { seasonalContext } from "@/lib/season";

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
    <div className="sectionHead"><div><div className="sectionLabel"><Icon /> {hr ? "MOJA ZBIRKA" : "MY LIBRARY"}</div><h2>{translated.find((item) => item.id === category)?.label}</h2><p className="quiet">{translated.find((item) => item.id === category)?.note}</p></div><button className="primary" onClick={() => { setEditing(null); setOpen(!open); }}><Plus /> {hr ? "Dodaj" : "Add item"}</button></div>
    {category === "feel-good" && <div className="libraryMood"><Image src="/living-frames/library-rain-window.jpg" alt="" fill sizes="100vw" /><div><span>{seasonal.month.toUpperCase()} · {seasonal.seasonName.toUpperCase()}</span><strong>{seasonal.theme}</strong></div></div>}
    {open && <form className="card libraryForm" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const title = String(form.get("title")).trim();
      const details = String(form.get("details")).trim();
      const item: LibraryItem = { id: editing?.id || newId(), category, title, group: String(form.get("group")).trim(), details, url: String(form.get("url") || "").trim() || undefined };
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
