import { newId } from "@/lib/id";
import { localDate, type LibraryCategory, type LibraryItem, type State } from "@/lib/model";
import { Bag, Basket, ForkKnife, Heart, MapTrifold, PersonSimpleRun, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import { Empty, Field } from "./Primitives";

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
  const [category, setCategory] = useState<LibraryCategory>("shopping");
  const [editing, setEditing] = useState<LibraryItem | null>(null);
  const [open, setOpen] = useState(false);
  const items = state.library.filter((x) => x.category === category);
  const Icon = icons[category];
  const addToday = (item: LibraryItem) => update((s) => ({ ...s, tasks: [...s.tasks, { id: newId(), title: item.title, date: localDate(), time: "", deadline: "", kind: "optional", duration: 30, repeat: "none", area: category === "shopping" || category === "places" ? "outside" : "anywhere", effort: "light", completedAt: null }] }));
  return <>
    <div className="libraryTabs">{categories.map((c) => { const C = icons[c.id]; return <button key={c.id} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}><C size={22} /><span>{c.label}</span></button>; })}</div>
    <div className="sectionHead"><div><div className="sectionLabel"><Icon /> MY LIBRARY</div><h2>{categories.find((c) => c.id === category)?.label}</h2><p className="quiet">{categories.find((c) => c.id === category)?.note}</p></div><button className="primary" onClick={() => { setEditing(null); setOpen(!open); }}><Plus /> Add item</button></div>
    {open && <form className="card libraryForm" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const item = { id: editing?.id || newId(), category, title: String(f.get("title")).trim(), group: String(f.get("group")).trim(), details: String(f.get("details")).trim() }; update((s) => ({ ...s, library: editing ? s.library.map((x) => x.id === editing.id ? item : x) : [...s.library, item] })); setEditing(null); setOpen(false); }}>
      <Field label="Name"><input name="title" required defaultValue={editing?.title} autoFocus /></Field>
      <Field label={category === "shopping" ? "Store" : "Group or context"}><input name="group" required defaultValue={editing?.group} placeholder={category === "shopping" ? "dm, Lidl, market…" : "Home, quick, weekend…"} /></Field>
      <Field label="Details or checklist"><textarea name="details" rows={3} defaultValue={editing?.details} /></Field>
      <div className="actions"><button className="primary">Save item</button><button type="button" onClick={() => setOpen(false)}>Cancel</button></div>
    </form>}
    {!items.length && <Empty>This list is yours to build. Add the first option you would genuinely use.</Empty>}
    <div className="libraryGrid">{items.map((item) => <article className="card libraryItem" key={item.id}><span className="libraryGroup">{item.group}</span><h3>{item.title}</h3><p>{item.details || "No extra notes."}</p><div className="actions"><button className="primary" onClick={() => addToday(item)}><Plus /> Add to today</button><button onClick={() => { setEditing(item); setOpen(true); window.scrollTo({ top: 0 }); }}>Edit</button><button aria-label={"Delete " + item.title} onClick={() => update((s) => ({ ...s, library: s.library.filter((x) => x.id !== item.id) }))}><Trash /></button></div></article>)}</div>
    {category === "shopping" && <p className="integrationNote">Price comparison is not connected yet. Store names and shopping lists are fully editable; no prices are invented.</p>}
    {category === "places" && <p className="integrationNote">Live Samobor events are not connected yet. Save places, restaurants and trip ideas here for now.</p>}
  </>;
}
