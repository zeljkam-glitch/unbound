"use client";
import { Books, CalendarDots, Clock, GearSix, Target, Tray, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { Tab } from "@/lib/ui-types";
import { demo, localDate, migrateState, type State } from "@/lib/model";
import TodayScreen from "./TodayScreen";
import PlannerScreen from "./PlannerScreen";
import LibraryScreen from "./LibraryScreen";
import InboxScreen from "./InboxScreen";
import GoalsScreen from "./GoalsScreen";

const KEY = "unbound.v1";
const tabs: Tab[] = ["Today", "Planner", "Library", "Inbox", "Goals"];
const icons = { Today: Clock, Planner: CalendarDots, Library: Books, Inbox: Tray, Goals: Target };
const intros: Record<Tab, [string, string]> = {
  Today: ["Make room for what matters.", "Your weather, capacity, routines and plan — in one gentle start."],
  Planner: ["Give the week a shape.", "Fixed when it must be. Flexible wherever life needs room."],
  Library: ["Keep your good options close.", "Reusable lists for the days when deciding is the hardest part."],
  Inbox: ["Catch it now. Decide later.", "A calm landing place for things that need your attention."],
  Goals: ["Move without losing yourself.", "See progress, protect recovery and return to what matters."],
};

export default function Unbound() {
  const [state, setState] = useState<State | null>(null);
  const [tab, setTab] = useState<Tab>("Today");
  const [settings, setSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState("");
  const storageBlocked = useRef(false);
  const today = localDate();

  useEffect(() => {
    let initial = demo();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const migrated = migrateState(JSON.parse(raw));
        if (migrated) initial = migrated;
        else { storageBlocked.current = true; setMessage("Saved data could not be read. Your existing copy was preserved."); }
      }
    } catch { storageBlocked.current = true; setMessage("Local storage is unavailable. Changes work only in this session."); }
    setState(initial);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = "quiet"; }, []);
  useEffect(() => {
    if (!state || storageBlocked.current) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { setMessage("Changes could not be saved on this device. Export a copy before leaving."); }
  }, [state]);
  useEffect(() => {
    const sync = () => { const hash = window.location.hash.slice(1).toLowerCase(); setTab(tabs.find((t) => t.toLowerCase() === hash) || "Today"); };
    sync(); window.addEventListener("hashchange", sync); return () => window.removeEventListener("hashchange", sync);
  }, []);
  const navigate = (next: Tab) => { setTab(next); window.location.hash = next.toLowerCase(); window.scrollTo({ top: 0, behavior: "auto" }); };
  const update = (fn: (s: State) => State) => setState((s) => s ? fn(s) : s);
  const exportData = () => {
    if (!state) return; const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = "unbound-" + today + ".json"; a.click(); URL.revokeObjectURL(url); setMessage("Your data has been exported.");
  };
  if (!state) return <main className="loading">Opening your space…</main>;
  const Icon = icons[tab];
  return <div className="shell quietShell">
    <a className="skip" href="#main">Skip to content</a>
    <header className="quietHeader"><a href="#today" className="brand" onClick={() => navigate("Today")}>UNBOUND<span>.</span></a><nav aria-label="Main navigation">{tabs.map((name) => <a href={"#" + name.toLowerCase()} key={name} aria-current={tab === name ? "page" : undefined} onClick={() => navigate(name)}>{name === "Library" ? "Library" : name}</a>)}</nav><button aria-label="Your space & data" onClick={() => setSettings(!settings)}><GearSix /> <span>Your space</span></button></header>
    <div className="content">
      <main id="main">
        <div className="pageIntro"><div className="eyebrow">{String(tabs.indexOf(tab) + 1).padStart(2, "0")} / {tab.toUpperCase()}</div><h1>{intros[tab][0]}</h1><p className="intro">{intros[tab][1]}</p></div>
        {message && <div className="notice" role="status">{message}<button aria-label="Dismiss" onClick={() => setMessage("")}><X /></button></div>}
        {settings && <section className="card settings"><h2>Your space & data</h2><p>Everything is stored only in this browser. Export a copy whenever you want a backup.</p><div className="actions"><button className="primary" onClick={exportData}>Export JSON</button><button onClick={() => setConfirmReset(true)}>Reset all data</button><button onClick={() => setSettings(false)}>Close</button></div>{confirmReset && <div role="alert"><p>Delete all plans, library items, goals and check-ins? This cannot be undone.</p><button className="danger" onClick={() => { storageBlocked.current = false; setState({ ...demo(), tasks: [], thoughts: [], projects: [], library: [], inbox: [], routineDone: {}, anchors: {}, energies: {}, focus: {}, reflections: {}, weeklyCheckins: {} }); setConfirmReset(false); setMessage("Your space has been cleared."); }}>Delete everything</button><button onClick={() => setConfirmReset(false)}>Keep my data</button></div>}</section>}
        {tab === "Today" && <TodayScreen state={state} today={today} update={update} />}
        {tab === "Planner" && <PlannerScreen state={state} update={update} />}
        {tab === "Library" && <LibraryScreen state={state} update={update} />}
        {tab === "Inbox" && <InboxScreen state={state} update={update} />}
        {tab === "Goals" && <GoalsScreen state={state} update={update} />}
        <footer><Icon size={17} /> UNBOUND <em>· your pace is part of the plan.</em></footer>
      </main>
      <nav className="bottomNav" aria-label="Mobile navigation">{tabs.map((name) => { const NavIcon = icons[name]; return <a key={name} href={"#" + name.toLowerCase()} aria-current={tab === name ? "page" : undefined} onClick={() => navigate(name)}><NavIcon size={20} /><span>{name}</span></a>; })}</nav>
    </div>
  </div>;
}
