import { newId } from "@/lib/id";
import { localDate, type LibraryCategory, type LibraryItem, type State } from "@/lib/model";
import { Bag, Basket, ForkKnife, Heart, MapTrifold, PersonSimpleRun, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import { Empty, Field } from "./Primitives";
import { useLanguage } from "./LanguageContext";
import Image from "next/image";

const categories: Array<{ id: LibraryCategory; label: string; note: string }> = [
  { id: "shopping", label: "Shopping by store", note: "What to buy, grouped by where you go" },
  { id: "feel-good", label: "Feel-good atlas", note: "Small things that lift or restore you" },
  { id: "places", label: "Places & escapes", note: "Restaurants, events and day trips" },
  { id: "meals", label: "Meals", note: "Things you actually like to cook" },
  { id: "workouts", label: "Workouts", note: "Gym, home, running and stretching" },
  { id: "bags", label: "Bag checklists", note: "Gym, faculty, travel and repeat trips" },
];
const icons = { shopping: Basket, "feel-good": Heart, places: MapTrifold, meals: ForkKnife, workouts: PersonSimpleRun, bags: Bag };

export default function LibraryScreen({ state, update }: { state: State; update: Update }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const translated = hr ? [
    { id: "shopping" as const, label: "Kupnja po trgovinama", note: "Što trebaš kupiti, složeno prema mjestu na koje ideš" },
    { id: "feel-good" as const, label: "Atlas dobrog osjećaja", note: "Male stvari koje ti vraćaju snagu ili mir" },
    { id: "places" as const, label: "Mjesta i mali bijegovi", note: "Restorani, događanja i jednodnevni izleti" },
    { id: "meals" as const, label: "Jela", note: "Ono što doista voliš kuhati" },
    { id: "workouts" as const, label: "Vježbanje", note: "Teretana, dom, trčanje i istezanje" },
    { id: "bags" as const, label: "Popisi za torbe", note: "Faks, teretana i putovanja koja se ponavljaju" },
  ] : categories;
  const [category, setCategory] = useState<LibraryCategory>("shopping");
  const [editing, setEditing] = useState<LibraryItem | null>(null);
  const [open, setOpen] = useState(false);
  const items = state.library.filter((x) => x.category === category);
  const Icon = icons[category];
  const addToday = (item: LibraryItem) => update((s) => ({ ...s, tasks: [...s.tasks, { id: newId(), title: item.title, date: localDate(), time: "", deadline: "", kind: "optional", duration: 30, repeat: "none", area: category === "shopping" || category === "places" ? "outside" : "anywhere", effort: "light", completedAt: null }] }));
  return <>
    <div className="libraryTabs">{translated.map((c) => { const C = icons[c.id]; return <button key={c.id} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}><C size={22} /><span>{c.label}</span></button>; })}</div>
    <div className="sectionHead"><div><div className="sectionLabel"><Icon /> {hr ? "MOJA ZBIRKA" : "MY LIBRARY"}</div><h2>{translated.find((c) => c.id === category)?.label}</h2><p className="quiet">{translated.find((c) => c.id === category)?.note}</p></div><button className="primary" onClick={() => { setEditing(null); setOpen(!open); }}><Plus /> {hr ? "Dodaj" : "Add item"}</button></div>
    {category === "feel-good" && <div className="libraryMood"><Image src="/mood/studio-light.jpg" alt="" fill sizes="100vw" /><div><span>{hr ? "MALI PODSJETNIK" : "A SMALL REMINDER"}</span><strong>{hr ? "Neke stvari jednostavno ti čine dobro." : "Some things simply make you feel better."}</strong></div></div>}
    {open && <form className="card libraryForm" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const item = { id: editing?.id || newId(), category, title: String(f.get("title")).trim(), group: String(f.get("group")).trim(), details: String(f.get("details")).trim() }; update((s) => ({ ...s, library: editing ? s.library.map((x) => x.id === editing.id ? item : x) : [...s.library, item] })); setEditing(null); setOpen(false); }}>
      <Field label={hr ? "Naziv" : "Name"}><input name="title" required defaultValue={editing?.title} autoFocus /></Field>
      <Field label={category === "shopping" ? (hr ? "Trgovina" : "Store") : (hr ? "Skupina ili kontekst" : "Group or context")}><input name="group" required defaultValue={editing?.group} placeholder={category === "shopping" ? "dm, Lidl, plac…" : (hr ? "Doma, brzo, vikend…" : "Home, quick, weekend…")} /></Field>
      <Field label={hr ? "Detalji ili popis" : "Details or checklist"}><textarea name="details" rows={3} defaultValue={editing?.details} /></Field>
      <div className="actions"><button className="primary">{hr ? "Spremi" : "Save item"}</button><button type="button" onClick={() => setOpen(false)}>{hr ? "Odustani" : "Cancel"}</button></div>
    </form>}
    {!items.length && <Empty>{hr ? "Ova će lista postati tvoja s vremenom. Za početak dodaj jednu stvar koju bi stvarno odabrala." : "This list will become yours over time. Begin with one thing you would genuinely choose."}</Empty>}
    <div className="libraryGrid">{items.map((item) => <article className="card libraryItem" key={item.id}><span className="libraryGroup">{item.group}</span><h3>{item.title}</h3><p>{item.details || (hr ? "Nema dodatnih bilješki." : "No extra notes.")}</p><div className="actions"><button className="primary" onClick={() => addToday(item)}><Plus /> {hr ? "Dodaj danas" : "Add today"}</button><button onClick={() => { setEditing(item); setOpen(true); window.scrollTo({ top: 0 }); }}>{hr ? "Uredi" : "Edit"}</button><button aria-label={(hr ? "Obriši " : "Delete ") + item.title} onClick={() => update((s) => ({ ...s, library: s.library.filter((x) => x.id !== item.id) }))}><Trash /></button></div></article>)}</div>
    {category === "shopping" && <p className="integrationNote">{hr ? "Usporedba cijena još nije povezana. Trgovine i popise možeš slobodno uređivati; cijene ne izmišljamo." : "Price comparison is not connected yet. You can edit stores and lists freely; we never invent prices."}</p>}
    {category === "places" && <p className="integrationNote">{hr ? "Događanja u Samoboru još nisu povezana uživo. Zasad ovdje čuvaj mjesta, restorane i ideje za izlet." : "Live Samobor events are not connected yet. For now, keep places, restaurants and trip ideas here."}</p>}
  </>;
}
