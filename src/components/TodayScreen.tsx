import { newId } from "@/lib/id";
import { libraryItemCopy, taskOccursOn, taskTitle, toggleTask, type State } from "@/lib/model";
import { ArrowRight, CaretDown, Check, NotePencil, Plus } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Update } from "@/lib/ui-types";
import WeatherCard from "./WeatherCard";
import { Empty } from "./Primitives";
import { useLanguage } from "./LanguageContext";
import SeasonalCompass from "./SeasonalCompass";
import BeautifulMomentsPanel from "./BeautifulMomentsPanel";
import EnergyRecoveryPanel from "./EnergyRecoveryPanel";

export default function TodayScreen({ state, today, update }: { state: State; today: string; update: Update }) {
  const [idea, setIdea] = useState("");
  const [libraryId, setLibraryId] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [weatherCode, setWeatherCode] = useState<number>();
  const libraryPickerRef = useRef<HTMLDivElement>(null);
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const todayTasks = state.tasks.filter((t) => taskOccursOn(t, today));
  const todayDate = new Date(`${today}T12:00:00`);
  const quotes = state.library.filter((item) => item.category === "quotes");
  const quoteSeed = [...today].reduce((total, character) => total + character.charCodeAt(0), 0);
  const dailyQuote = quotes.length ? quotes[quoteSeed % quotes.length] : { title: hr ? "Primijeti ono zbog čega se vraćaš sebi." : "Notice what brings you back to yourself.", group: "UNBOUND" };
  const done = state.routineDone[today] || [];
  const toggleRoutine = (id: string) => update((s) => ({ ...s, routineDone: { ...s.routineDone, [today]: done.includes(id) ? done.filter((x) => x !== id) : [...done, id] } }));
  const displayLibraryItem = (item: State["library"][number]) => {
    const localized = libraryItemCopy(item, locale);
    if (item.translations?.[locale]) return localized;
    if (!hr) return item;
    const builtIn: Record<string, { title: string; group: string }> = {
      l1: { title: "Zobeno mlijeko", group: "dm" },
      l2: { title: "Svježe povrće", group: "Plac" },
      l3: { title: "Šetnja uz rijeku", group: "10–30 min" },
      l4: { title: "Šetnja starim Zagrebom", group: "Mali bijeg" },
      l5: { title: "Rižoto s povrćem", group: "Večera" },
      l6: { title: "Joga za početnike · 20 min", group: "Doma" },
      l7: { title: "Torba za teretanu", group: "Popis" },
    };
    return builtIn[item.id] ? { ...item, ...builtIn[item.id] } : localized;
  };
  const plannableLibrary = state.library.filter((item) => ["shopping", "feel-good", "places", "meals", "workouts"].includes(item.category));
  const selectedLibraryItem = plannableLibrary.find((item) => item.id === libraryId);
  const normalizedQuery = libraryQuery.trim().toLocaleLowerCase(hr ? "hr-HR" : "en-GB");
  const visibleLibrary = plannableLibrary.filter((item) => {
    const display = displayLibraryItem(item);
    return !normalizedQuery || `${display.title} ${display.group}`.toLocaleLowerCase(hr ? "hr-HR" : "en-GB").includes(normalizedQuery);
  });
  const libraryGroups = [
    { key: "everyday", label: hr ? "KUPNJA I OBAVEZE" : "SHOPPING & ERRANDS", categories: ["shopping"] },
    { key: "wellbeing", label: hr ? "KRETANJE I PREDAH" : "MOVEMENT & PAUSE", categories: ["feel-good", "workouts"] },
    { key: "food", label: hr ? "OBROCI" : "MEALS", categories: ["meals"] },
    { key: "places", label: hr ? "MJESTA" : "PLACES", categories: ["places"] },
  ].map((group) => ({ ...group, items: visibleLibrary.filter((item) => group.categories.includes(item.category)) })).filter((group) => group.items.length);
  useEffect(() => {
    const closePicker = (event: MouseEvent) => {
      if (!libraryPickerRef.current?.contains(event.target as Node)) setLibraryOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLibraryOpen(false);
    };
    document.addEventListener("mousedown", closePicker);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closePicker);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);
  const addLibrary = () => {
    const item = state.library.find((x) => x.id === libraryId);
    if (!item) return;
    const display = displayLibraryItem(item);
    update((s) => ({ ...s, tasks: [...s.tasks, { id: newId(), title: display.title, date: today, time: "", deadline: "", kind: "optional", duration: 30, repeat: "none", area: item.category === "shopping" || item.category === "places" ? "outside" : "anywhere", effort: "light", completedAt: null }] }));
    setLibraryId("");
  };
  return <>
    <section className="livingTodayStage">
      <div className="livingTodayVisual">
        <Image src="/living-frames/today-morning.jpg" alt="" fill sizes="(max-width: 760px) 100vw, 68vw" priority />
        <div className="livingVisualShade" />
        <div className="livingVisualMeta"><span>{todayDate.toLocaleDateString(hr ? "hr-HR" : "en-GB", { weekday: "long" })}</span><span>{todayDate.toLocaleDateString(hr ? "hr-HR" : "en-GB", { day: "numeric", month: "long" })}</span><span>{new Date().toLocaleTimeString(hr ? "hr-HR" : "en-GB", { hour: "2-digit", minute: "2-digit" })}</span></div>
        <div className="livingVisualCaption"><span>{hr ? "DANAS / TVOJ PROSTOR" : "TODAY / YOUR SPACE"}</span><h1>{hr ? <>Sačuvaj oblik<br />svoga dana.</> : <>Protect the shape<br />of the day.</>}</h1></div>
      </div>
      <aside className="livingAgenda">
        <div className="livingAgendaHead"><div><span className="sectionLabel">{hr ? `DANAS / ${todayTasks.length} TRENUTKA` : `TODAY / ${todayTasks.length} MOMENTS`}</span><h2>{hr ? "Tvoj dan, u jednom mirnom pogledu." : "Your day, in one quiet view."}</h2></div></div>
        <div className="livingAgendaList">{todayTasks.map((t) => { const title = taskTitle(t, locale); return <button className={t.completedAt ? "isDone" : ""} key={t.id} aria-label={(t.completedAt ? (hr ? "Ponovno otvori " : "Reopen ") : (hr ? "Dovrši " : "Complete ")) + title} aria-pressed={!!t.completedAt} onClick={() => update((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === t.id ? toggleTask(x) : x) }))}><time>{t.time || (hr ? "bez satnice" : "open")}</time><span><strong>{title}</strong><small>{t.duration} min · {hr ? ({ home: "doma", outside: "vani", anywhere: "bilo gdje" } as const)[t.area] : t.area}</small></span><i>{t.completedAt ? <Check weight="thin" /> : null}</i></button>; })}</div>
        {!todayTasks.length && <p className="livingEmpty">{hr ? "Dan je još otvoren." : "The day is still open."}</p>}
        <blockquote>{dailyQuote.title}<cite>{dailyQuote.group}</cite></blockquote>
      </aside>
    </section>
    <div className="livingDayDetails">
    <WeatherCard onWeatherChange={setWeatherCode} />
    <SeasonalCompass update={update} today={today} weatherCode={weatherCode} obligations={todayTasks.filter((task) => !task.completedAt).map((task) => taskTitle(task, locale))} />
    <EnergyRecoveryPanel state={state} today={today} update={update} />
    <BeautifulMomentsPanel state={state} today={today} weatherCode={weatherCode} update={update} />
    <div className={`todayGrid ${todayDate.getDay() === 0 ? "hasWeekly" : ""}`}>
      {(["morning", "evening", ...(todayDate.getDay() === 0 ? ["weekly" as const] : [])] as const).map((period) => <section className="card routineCard" key={period}>
        <div className="sectionLabel">{period === "morning" ? (hr ? "JUTARNJA RUTINA" : "MORNING ROUTINE") : period === "evening" ? (hr ? "VEČERNJA RUTINA" : "EVENING ROUTINE") : (hr ? "NEDJELJNA RUTINA" : "SUNDAY ROUTINE")}</div>
        <h2>{period === "morning" ? (hr ? "Počni svojim ritmom." : "Begin at your own pace.") : period === "evening" ? (hr ? "Zatvori dan." : "Close the day.") : (hr ? "Nedjeljni ritam." : "Sunday rhythm.")}</h2>
        {state.routines.filter((r) => r.period === period).map((r) => <label className="routineRow" key={r.id}><input type="checkbox" checked={done.includes(r.id)} onChange={() => toggleRoutine(r.id)} /><span>{r.title}</span></label>)}
      </section>)}
    </div>
    <section className="card ideaCapture">
      <NotePencil size={28} weight="thin" />
      <div><div className="sectionLabel">{hr ? "BRZA BILJEŠKA" : "QUICK IDEA"}</div><h2>{hr ? "Sačuvaj misao prije nego ode." : "Keep the thought before it moves on."}</h2></div>
      <input aria-label={hr ? "Brza bilješka" : "Quick idea"} placeholder={hr ? "Nešto čemu se želiš vratiti…" : "Something worth returning to…"} value={idea} onChange={(e) => setIdea(e.target.value)} />
      <button className="primary" disabled={!idea.trim()} onClick={() => { update((s) => ({ ...s, thoughts: [{ id: newId(), text: idea.trim(), createdAt: new Date().toISOString() }, ...s.thoughts] })); setIdea(""); }}>{hr ? "Spremi" : "Save"} <ArrowRight weight="thin" /></button>
    </section>
    <section className="tasksSection">
      <div className="sectionHead"><div><div className="sectionLabel">{hr ? "DANAŠNJI PLAN" : "TODAY’S PLAN"}</div><h2>{hr ? "Dodaj samo ono čemu danas želiš napraviti mjesta." : "Add only what you want to make room for today."}</h2></div><span className="quiet">{todayTasks.reduce((n, t) => n + t.duration, 0)} {hr ? "min u planu" : "min in the plan"}</span></div>
      <div className="libraryQuick">
        <div className="libraryPicker" ref={libraryPickerRef}>
          <button className="libraryPickerTrigger" type="button" aria-haspopup="listbox" aria-expanded={libraryOpen} aria-label={hr ? "Odaberi iz Moje zbirke" : "Choose from My Library"} onClick={() => setLibraryOpen((open) => !open)}>
            <span>{selectedLibraryItem ? `${displayLibraryItem(selectedLibraryItem).title} · ${displayLibraryItem(selectedLibraryItem).group}` : (hr ? "Odaberi iz Moje zbirke" : "Choose from My Library")}</span>
            <CaretDown weight="thin" />
          </button>
          {libraryOpen && <div className="libraryPickerPanel">
            <div className="libraryPickerIntro"><span>{hr ? "DODAJ U DANAŠNJI PLAN" : "ADD TO TODAY"}</span><p>{hr ? "Odaberi jednu konkretnu stvar." : "Choose one concrete thing."}</p></div>
            <input autoFocus aria-label={hr ? "Pretraži Moju zbirku" : "Search My Library"} placeholder={hr ? "Pretraži zbirku…" : "Search the library…"} value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} />
            <div className="libraryPickerList" role="listbox" aria-label={hr ? "Stvari iz Moje zbirke" : "Items from My Library"}>
              {libraryGroups.map((group) => <section key={group.key} className="libraryPickerGroup"><h3>{group.label}</h3>{group.items.map((item) => {
                const display = displayLibraryItem(item);
                return <button type="button" role="option" aria-selected={libraryId === item.id} key={item.id} onClick={() => { setLibraryId(item.id); setLibraryOpen(false); setLibraryQuery(""); }}><span>{display.title}</span><small>{display.group}</small></button>;
              })}</section>)}
              {!libraryGroups.length && <p className="libraryPickerEmpty">{hr ? "Nema rezultata za ovu pretragu." : "No matches for this search."}</p>}
            </div>
          </div>}
        </div>
        <button onClick={addLibrary} disabled={!libraryId}><Plus /> {hr ? "Dodaj danas" : "Add today"}</button>
      </div>
      {!todayTasks.length && <Empty>{hr ? "Dan ti je još otvoren. Dodaj nešto iz svoje zbirke ili ga oblikuj u Planeru." : "Your day is still open. Add something from your library or shape it in Planner."}</Empty>}
    </section>
    </div>
  </>;
}
