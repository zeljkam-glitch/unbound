"use client";
import { newId } from "@/lib/id";
import {
  Clock,
  Sparkle,
  Stack,
  ChartDonut,
  GearSix,
  Sun,
  Moon,
  X,
} from "@phosphor-icons/react";
import ReflectScreen from "./ReflectScreen";
import ProjectsScreen from "./ProjectsScreen";
import MindspaceScreen from "./MindspaceScreen";
import TodayScreen from "./TodayScreen";
import type { Tab } from "@/lib/ui-types";
import { useEffect, useRef, useState } from "react";
import {
  captureThought,
  demo,
  isState,
  localDate,
  suggest,
  weekStart,
  type Project,
  type State,
} from "@/lib/model";
const KEY = "unbound.v1";
const tabs = ["Today", "Mindspace", "Projects", "Reflect"] as const;

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: {
        results: { [key: number]: { [key: number]: { transcript: string } } };
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
export default function Unbound() {
  const [state, setState] = useState<State | null>(null),
    [tab, setTab] = useState<Tab>("Today"),
    [theme, setTheme] = useState("dark"),
    [message, setMessage] = useState(""),
    [settings, setSettings] = useState(false),
    [confirmReset, setConfirmReset] = useState(false);
  const [thought, setThought] = useState(""),
    [editing, setEditing] = useState<string | null>(null),
    [taskTitle, setTaskTitle] = useState(""),
    [deadline, setDeadline] = useState(""),
    [effort, setEffort] = useState<"light" | "deep">("light"),
    [showTask, setShowTask] = useState(false),
    [showProject, setShowProject] = useState(false),
    [editProject, setEditProject] = useState<Project | null>(null),
    [listening, setListening] = useState(false);
  const storageBlocked = useRef(false);
  const recognition = useRef<Recognition | null>(null);
  const today = localDate();
  const week = localDate(weekStart());
  useEffect(() => {
    let initial = demo();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isState(parsed)) initial = parsed;
        else {
          storageBlocked.current = true;
          setMessage(
            "Saved data could not be read. Demo data is loaded in memory. Reset explicitly to start saving again.",
          );
        }
      }
      const savedTheme = localStorage.getItem("unbound.theme");
      if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    } catch {
      storageBlocked.current = true;
      setMessage(
        "Local storage is unavailable or damaged. Changes work in this session; export to keep a copy.",
      );
    }
    setState(initial);
    return () => recognition.current?.stop();
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    if (!state || storageBlocked.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      setMessage(
        "Your changes could not be saved on this device. Export a copy before leaving.",
      );
    }
  }, [state]);
  useEffect(() => {
    const sync = () => {
      const match = tabs.find(
        (t) => `#${t.toLowerCase()}` === window.location.hash,
      );
      setTab(match || "Today");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  function navigate(next: Tab) {
    setTab(next);
    window.scrollTo({top: 0, behavior: "auto"});
  }
  function update(fn: (s: State) => State) {
    setState((s) => (s ? fn(s) : s));
  }
  function changeTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem("unbound.theme", next);
    } catch {
      setMessage("Theme changed for this session only.");
    }
  }
  function exportData() {
    if (!state) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `unbound-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Your data has been exported.");
  }
  function saveThought(e: React.FormEvent) {
    e.preventDefault();
    const item = captureThought(thought, newId());
    if (!item) return;
    update((s) => ({
      ...s,
      thoughts: editing
        ? s.thoughts.map((t) =>
            t.id === editing ? { ...t, text: item.text } : t,
          )
        : [item, ...s.thoughts],
    }));
    setThought("");
    setEditing(null);
    setMessage(
      editing ? "Thought updated." : "Thought saved. It stays a thought.",
    );
  }
  function dictate() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };
    const Constructor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Constructor) {
      setMessage(
        "Voice capture is not supported in this browser. You can type your thought below.",
      );
      return;
    }
    try {
      const r = new Constructor();
      recognition.current = r;
      r.lang = navigator.language;
      r.continuous = false;
      r.interimResults = false;
      r.onresult = (e) => {
        setThought((t) =>
          [t, e.results[0][0].transcript].filter(Boolean).join(" "),
        );
      };
      r.onerror = (e) => {
        setListening(false);
        setMessage(
          `Voice capture unavailable (${e.error}). Please use the text field.`,
        );
      };
      r.onend = () => setListening(false);
      r.start();
      setListening(true);
    } catch {
      setMessage("Unable to start the microphone. Please type instead.");
    }
  }
  if (!state) return <main className="loading">Opening your space…</main>;
  const open = state.tasks.filter((t) => !t.completedAt);
  const suggestion = suggest(state.tasks, state.energies[today] || "");
  const completed = state.tasks.filter(
    (t) => t.completedAt && new Date(t.completedAt) >= weekStart(),
  );
  const active = state.projects.filter((p) => p.status === "active");
  const intros: Record<Tab, [string, string]> = {
    Today: [
      "Make room for what matters.",
      "A little direction. Plenty of breathing room.",
    ],
    Mindspace: [
      "Let your mind wander.",
      "Catch a thought. Decide what it means later.",
    ],
    Projects: [
      "Move at your own pace.",
      "Meaningful work, with a place to return to.",
    ],
    Reflect: [
      "Look back. Choose forward.",
      "A week is more than what you got done.",
    ],
  };
  return (
    <div className="shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <a href="#today" className="brand" onClick={() => navigate("Today")}>
          UNBOUND<span>PERSONAL FREEDOM OS</span>
        </a>
        <nav aria-label="Main navigation">
          {tabs.map((t, i) => (
            <a
              href={`#${t.toLowerCase()}`}
              key={t}
              aria-current={tab === t ? "page" : undefined}
              onClick={() => navigate(t)}
            >
              <span aria-hidden="true" className="navIcon">
                {
                  [
                    <Clock key="today" size={25} />,
                    <Sparkle key="mind" size={25} />,
                    <Stack key="projects" size={25} />,
                    <ChartDonut key="reflect" size={25} />,
                  ][i]
                }
              </span>
              {t}
              <span className="navIndex">0{i + 1}</span>
            </a>
          ))}
        </nav>
        <div className="sidebarBottom">
          <p>
            Less noise.
            <br />
            More life.
          </p>
          <button
            onClick={() => setSettings(!settings)}
            aria-expanded={settings}
          >
            <GearSix size={20} aria-hidden="true" /> Your space & data
          </button>
          <button onClick={changeTheme}>
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}{" "}
            {theme === "light" ? "Dark theme" : "Light theme"}
          </button>
          <span className="localNote">LOCAL BY DESIGN · YOURS TO KEEP</span>
        </div>
      </aside>
      <div className="content">
        <header className="topbar">
          <div className="mobileBrand">
            <Sparkle size={28} weight="duotone" aria-hidden="true" />
            <span>
              UNBOUND<small>Your space. Your pace.</small>
            </span>
          </div>
          <div className="actions">
            <button
              className="mobileData"
              aria-label="Your data"
              onClick={() => setSettings(!settings)}
              aria-expanded={settings}
            >
              <GearSix size={22} aria-hidden="true" />
            </button>
            <button
              onClick={changeTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            >
              {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
            </button>
          </div>
        </header>
        <main id="main">
          <div className="eyebrow">
            {tab === "Reflect"
              ? `WEEK OF ${week}`
              : new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
            <span> / {tab.toUpperCase()}</span>
          </div>
          <h1>{intros[tab][0]}</h1>
          <p className="intro">{intros[tab][1]}</p>
          {settings && (
            <section className="card settings">
              <h2>Your space & data</h2>
              <p>
                Saved only in this browser. Clearing browser data removes your
                space. Export regularly to keep a copy.
              </p>
              <div className="actions">
                <button onClick={exportData} className="primary">
                  Export JSON
                </button>
                <button onClick={() => setConfirmReset(true)}>
                  Reset all data
                </button>
                <button onClick={() => setSettings(false)}>Close</button>
              </div>
              {confirmReset && (
                <div role="alert">
                  <p>
                    Delete all tasks, thoughts, projects and check-ins? This
                    cannot be undone.
                  </p>
                  <button
                    className="danger"
                    onClick={() => {
                      storageBlocked.current = false;
                      setState({
                        version: 1,
                        tasks: [],
                        thoughts: [],
                        projects: [],
                        anchors: {},
                        energies: {},
                        reflections: {},
                      });
                      setConfirmReset(false);
                      setMessage("Your space has been cleared.");
                    }}
                  >
                    Delete everything
                  </button>
                  <button onClick={() => setConfirmReset(false)}>
                    Keep my data
                  </button>
                </div>
              )}
            </section>
          )}
          {message && (
            <div className="notice" role="status">
              {message}
              <button
                aria-label="Dismiss notification"
                onClick={() => setMessage("")}
              >
                <X size={20} />
              </button>
            </div>
          )}
          {tab === "Today" && (
            <TodayScreen
              state={state}
              today={today}
              open={open}
              suggestion={suggestion}
              taskTitle={taskTitle}
              setTaskTitle={setTaskTitle}
              deadline={deadline}
              setDeadline={setDeadline}
              effort={effort}
              setEffort={setEffort}
              showTask={showTask}
              setShowTask={setShowTask}
              update={update}
              setTab={setTab}
            />
          )}
          {tab === "Mindspace" && (
            <MindspaceScreen
              state={state}
              thought={thought}
              setThought={setThought}
              editing={editing}
              setEditing={setEditing}
              listening={listening}
              saveThought={saveThought}
              dictate={dictate}
              update={update}
            />
          )}
          {tab === "Projects" && (
            <ProjectsScreen
              state={state}
              active={active}
              showProject={showProject}
              setShowProject={setShowProject}
              editProject={editProject}
              setEditProject={setEditProject}
              update={update}
            />
          )}
          {tab === "Reflect" && (
            <ReflectScreen
              state={state}
              week={week}
              completed={completed}
              open={open}
              update={update}
            />
          )}
          <footer>
            Plan what matters. Follow your rhythm.{" "}
            <em>Protect your freedom.</em>
          </footer>
        </main>
      </div>
    </div>
  );
}
