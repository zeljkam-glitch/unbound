"use client";
import { Books, CalendarDots, Clock, GearSix, Target, Tray, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { Tab } from "@/lib/ui-types";
import { demo, localDate, mergePrivateLists, migrateState, type State } from "@/lib/model";
import TodayScreen from "./TodayScreen";
import PlannerScreen from "./PlannerScreen";
import LibraryScreen from "./LibraryScreen";
import InboxScreen from "./InboxScreen";
import GoalsScreen from "./GoalsScreen";
import { LanguageProvider, type Locale } from "./LanguageContext";

const KEY = "unbound.v1";
const tabs: Tab[] = ["Today", "Planner", "Library", "Inbox", "Goals"];
const icons = { Today: Clock, Planner: CalendarDots, Library: Books, Inbox: Tray, Goals: Target };
const labels: Record<Locale, Record<Tab, string>> = {
  hr: { Today: "Danas", Planner: "Planer", Library: "Moja zbirka", Inbox: "Bilješke", Goals: "Ciljevi" },
  en: { Today: "Today", Planner: "Planner", Library: "My Library", Inbox: "Inbox", Goals: "Goals" },
};
const intros: Record<Locale, Record<Tab, [string, string]>> = {
  hr: {
    Today: ["Napravi mjesta za ono što ti je važno.", "Vrijeme, energija i današnji plan. Sve na jednom mirnom mjestu."],
    Planner: ["Daj tjednu oblik.", "Čvrsto ondje gdje mora biti. Fleksibilno ondje gdje život traži prostora."],
    Library: ["Dobre opcije, nadohvat ruke.", "Tvoje liste za dane kada ti se ne da ponovno odlučivati."],
    Inbox: ["Zapiši sada. Odluči poslije.", "Mjesto za misli koje još ne trebaju postati obaveze."],
    Goals: ["Cilj vrijedi samo ako stane u tvoj stvarni život.", "Odredi smjer, prati ono što se doista mijenja i prilagodi plan svom kapacitetu."],
  },
  en: {
    Today: ["Make room for what matters.", "Weather, energy and today’s plan. One quiet place to begin."],
    Planner: ["Give the week a shape.", "Fixed where it needs to be. Flexible where life needs room."],
    Library: ["Keep good options close.", "Your own lists for the days when choosing feels like work."],
    Inbox: ["Write it down. Decide later.", "A place for thoughts that do not need to become tasks yet."],
    Goals: ["A goal only works if it fits your real life.", "Set a direction, notice what is genuinely changing, and fit the plan to your capacity."],
  },
};

export default function Unbound() {
  const [state, setState] = useState<State | null>(null);
  const [tab, setTab] = useState<Tab>("Today");
  const [settings, setSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState("");
  const [locale, setLocale] = useState<Locale>("hr");
  const storageBlocked = useRef(false);
  const today = localDate();

  useEffect(() => {
    const savedLocale = localStorage.getItem("unbound.locale");
    const activeLocale: Locale = savedLocale === "en" ? "en" : "hr";
    setLocale(activeLocale);
    let initial = demo(activeLocale);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const migrated = migrateState(JSON.parse(raw));
        if (migrated) initial = migrated;
        else { storageBlocked.current = true; setMessage(activeLocale === "hr" ? "Spremljeni podaci nisu se mogli pročitati. Postojeća kopija ostala je sačuvana." : "Saved data could not be read. Your existing copy was preserved."); }
      }
    } catch { storageBlocked.current = true; setMessage(activeLocale === "hr" ? "Lokalna pohrana nije dostupna. Promjene vrijede samo dok je ova kartica otvorena." : "Local storage is unavailable. Changes will last only for this session."); }
    setState(initial);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = "quiet"; }, []);
  useEffect(() => { document.documentElement.lang = locale; localStorage.setItem("unbound.locale", locale); }, [locale]);
  useEffect(() => {
    if (!state || storageBlocked.current) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { setMessage(locale === "hr" ? "Promjene se ne mogu spremiti na ovom uređaju. Preuzmi kopiju prije izlaska." : "Changes could not be saved on this device. Download a copy before leaving."); }
  }, [state, locale]);
  useEffect(() => {
    const sync = () => { const hash = window.location.hash.slice(1).toLowerCase(); setTab(tabs.find((t) => t.toLowerCase() === hash) || "Today"); };
    sync(); window.addEventListener("hashchange", sync); return () => window.removeEventListener("hashchange", sync);
  }, []);
  const navigate = (next: Tab) => { setTab(next); window.location.hash = next.toLowerCase(); window.scrollTo({ top: 0, behavior: "auto" }); };
  const update = (fn: (s: State) => State) => setState((s) => s ? fn(s) : s);
  const exportData = () => {
    if (!state) return; const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = "unbound-" + today + ".json"; a.click(); URL.revokeObjectURL(url); setMessage(locale === "hr" ? "Tvoja je kopija preuzeta." : "Your copy has been downloaded.");
  };
  const importPrivateLists = async (file?: File) => {
    if (!file || !state) return;
    try {
      const merged = mergePrivateLists(state, JSON.parse(await file.text()));
      if (!merged) throw new Error("Invalid private list file");
      setState(merged);
      setMessage(locale === "hr" ? "Privatne rutine, popisi i zadaci su uvezeni. Ostaju samo u ovom pregledniku." : "Private routines, lists, and tasks were imported. They stay in this browser only.");
      setSettings(false);
    } catch {
      setMessage(locale === "hr" ? "Ovu datoteku nismo mogli uvesti." : "We could not import this file.");
    }
  };
  if (!state) return <main className="loading">Otvaram tvoj prostor…</main>;
  const Icon = icons[tab];
  const hr = locale === "hr";
  return <LanguageProvider locale={locale}><div className={`shell quietShell livingShell tab-${tab.toLowerCase()}`}>
    <a className="skip" href="#main">{hr ? "Preskoči na sadržaj" : "Skip to content"}</a>
    <header className="quietHeader"><a href="#today" className="brand" onClick={() => navigate("Today")}>UNBOUND<span>®</span></a><p className="productThesis">{hr ? <>Jedno privatno mjesto<br />za tvoj dan, ideje<br />i planove.</> : <>One private place<br />for your day, ideas<br />and plans.</>}</p><nav aria-label={hr ? "Glavna navigacija" : "Main navigation"}>{tabs.map((name, index) => <a href={"#" + name.toLowerCase()} key={name} aria-current={tab === name ? "page" : undefined} onClick={() => navigate(name)}><small>{String(index + 1).padStart(2, "0")}</small><span>{labels[locale][name]}</span></a>)}</nav><div className="headerTools"><div className="languageSwitch" aria-label={hr ? "Odabir jezika" : "Language selection"}><button aria-pressed={locale === "hr"} onClick={() => setLocale("hr")}>HR</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div><button aria-label={hr ? "Tvoj prostor i podaci" : "Your space and data"} onClick={() => setSettings(!settings)}><GearSix /> <span>{hr ? "Privatni prostor" : "Private space"}</span></button></div></header>
    <div className="content">
      <main id="main">
        <div className="pageIntro"><div className="eyebrow">{String(tabs.indexOf(tab) + 1).padStart(2, "0")} / {labels[locale][tab].toUpperCase()}</div><h1>{tab === "Inbox" ? (hr ? <>Zapiši sada.<br />Odluči poslije.</> : <>Write it down.<br />Decide later.</>) : intros[locale][tab][0]}</h1><p className="intro">{intros[locale][tab][1]}</p></div>
        {message && <div className="notice" role="status">{message}<button aria-label={hr ? "Zatvori poruku" : "Dismiss"} onClick={() => setMessage("")}><X /></button></div>}
        {settings && <section className="card settings"><h2>{hr ? "Tvoj prostor i podaci" : "Your space and data"}</h2><p>{hr ? "Sve ostaje u ovom pregledniku. Kopiju možeš preuzeti kad god poželiš." : "Everything stays in this browser. You can download a copy whenever you like."}</p><div className="actions"><button className="primary" onClick={exportData}>{hr ? "Preuzmi kopiju" : "Download a copy"}</button><label className="buttonLink">{hr ? "Uvezi privatne popise" : "Import private lists"}<input className="srOnly" aria-label={hr ? "Datoteka privatnih popisa" : "Private lists file"} type="file" accept="application/json,.json" onChange={(event) => importPrivateLists(event.target.files?.[0])} /></label><button onClick={() => setConfirmReset(true)}>{hr ? "Obriši sve podatke" : "Reset all data"}</button><button onClick={() => setSettings(false)}>{hr ? "Zatvori" : "Close"}</button></div>{confirmReset && <div role="alert"><p>{hr ? "Obrisati sve planove, liste, ciljeve i osvrte? Ovo se ne može vratiti." : "Delete every plan, list, goal and check-in? This cannot be undone."}</p><button className="danger" onClick={() => { storageBlocked.current = false; setState({ ...demo(locale), tasks: [], thoughts: [], projects: [], library: [], inbox: [], routines: [], routineDone: {}, anchors: {}, energies: {}, focus: {}, reflections: {}, weeklyCheckins: {}, recoveryCheckins: [] }); setConfirmReset(false); setMessage(hr ? "Tvoj je prostor očišćen." : "Your space has been cleared."); }}>{hr ? "Da, obriši sve" : "Delete everything"}</button><button onClick={() => setConfirmReset(false)}>{hr ? "Zadrži moje podatke" : "Keep my data"}</button></div>}</section>}
        {tab === "Today" && <TodayScreen state={state} today={today} update={update} />}
        {tab === "Planner" && <PlannerScreen state={state} update={update} />}
        {tab === "Library" && <LibraryScreen state={state} update={update} />}
        {tab === "Inbox" && <InboxScreen state={state} update={update} />}
        {tab === "Goals" && <GoalsScreen state={state} update={update} />}
        <footer><span className="footerBrand"><Icon size={15} /> UNBOUND®</span><span className="footerLine">{hr ? "Tvoj ritam je dio plana." : "Your pace belongs in the plan."}</span></footer>
      </main>
      <nav className="bottomNav" aria-label={hr ? "Mobilna navigacija" : "Mobile navigation"}>{tabs.map((name) => { const NavIcon = icons[name]; return <a key={name} href={"#" + name.toLowerCase()} aria-current={tab === name ? "page" : undefined} onClick={() => navigate(name)}><NavIcon size={20} /><span>{labels[locale][name]}</span></a>; })}</nav>
    </div>
  </div></LanguageProvider>;
}
