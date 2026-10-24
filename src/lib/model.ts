export type TaskKind = "fixed" | "deadline" | "flexible" | "optional";
export type Task = {
  id: string; title: string; date: string; time: string; deadline: string;
  kind: TaskKind; duration: number; repeat: "none" | "daily" | "weekly";
  area: "home" | "outside" | "anywhere"; effort: "light" | "deep";
  completedAt: string | null; notes?: string; tags?: string[]; projectId?: string;
};
export type Thought = { id: string; text: string; createdAt: string };
export type Goal = { id: string; name: string; outcome: string; deadline: string; nextAction: string; status: "active" | "paused" | "completed"; place: string; progress: number };
export type Project = Goal;
export type LibraryCategory = "shopping" | "feel-good" | "places" | "meals" | "workouts" | "bags";
export type LibraryItem = { id: string; category: LibraryCategory; title: string; group: string; details: string };
export type InboxItem = { id: string; text: string; createdAt: string };
export type Routine = { id: string; title: string; period: "morning" | "evening" };
export type WeeklyCheckin = { win: string; learned: string; next: string; energy: string };
export type State = {
  version: 2; tasks: Task[]; thoughts: Thought[]; projects: Goal[]; library: LibraryItem[];
  inbox: InboxItem[]; routines: Routine[]; routineDone: Record<string, string[]>;
  anchors: Record<string, string>; energies: Record<string, string>; focus: Record<string, string>;
  reflections: Record<string, { autonomy: string; satisfaction: string; pressure: string }>;
  weeklyCheckins: Record<string, WeeklyCheckin>;
};

export const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function addDays(date: string, amount: number) { const [y, m, day] = date.split("-").map(Number); const d = new Date(y, m - 1, day); d.setDate(d.getDate() + amount); return localDate(d); }
export function deadlineState(date: string, today = localDate()) { return !date ? "Flexible" : date < today ? "Overdue" : date === today ? "Today" : "Upcoming"; }
export function deadlineAwareness(deadline: string, today = localDate()) {
  if (!deadline) return null;
  const from = new Date(`${today}T12:00:00`), to = new Date(`${deadline}T12:00:00`);
  const days = Math.round((to.getTime() - from.getTime()) / 86400000);
  if (days < 0) return { tone: "overdue" as const, label: `Overdue by ${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"}` };
  if (days === 0) return { tone: "today" as const, label: "Due today" };
  return { tone: days <= 3 ? "soon" as const : "future" as const, label: `Due in ${days} ${days === 1 ? "day" : "days"}` };
}
export function toggleTask(task: Task, now = new Date().toISOString()): Task { return { ...task, completedAt: task.completedAt ? null : now }; }
export function captureThought(text: string, id: string, now = new Date().toISOString()): Thought | null { return text.trim() ? { id, text: text.trim(), createdAt: now } : null; }
export function parseTaskInput(value: string, fallbackDuration = 30) {
  const time = value.match(/(?:^|\s)@(\d{1,2}):([0-5]\d)(?=\s|$)/);
  const duration = value.match(/(?:^|\s)t(\d+)(m|h)(?=\s|$)/i);
  const tags = Array.from(value.matchAll(/(?:^|\s)#([\p{L}\p{N}_-]+)/gu), (match) => match[1]);
  const minutes = duration ? Number(duration[1]) * (duration[2].toLowerCase() === "h" ? 60 : 1) : fallbackDuration;
  const title = value
    .replace(/(?:^|\s)@\d{1,2}:[0-5]\d(?=\s|$)/g, " ")
    .replace(/(?:^|\s)t\d+(?:m|h)(?=\s|$)/gi, " ")
    .replace(/(?:^|\s)#[\p{L}\p{N}_-]+/gu, " ")
    .replace(/\s+/g, " ").trim();
  return { title, time: time ? `${time[1].padStart(2, "0")}:${time[2]}` : "", duration: minutes, tags };
}
export function pauseProject(project: Goal): Goal { return { ...project, status: project.status === "paused" ? "active" : "paused" }; }
export function weekStart(date = new Date()) { const d = new Date(date); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; }
export function taskOccursOn(task: Task, date: string) {
  if (task.date === date || (!task.date && task.deadline === date)) return true;
  if (!task.date || task.date > date || task.repeat === "none") return false;
  if (task.repeat === "daily") return true;
  const a = new Date(`${task.date}T12:00:00`), b = new Date(`${date}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86400000) % 7 === 0;
}
export function suggest(tasks: Task[], energy: string, today = localDate()) {
  const open = tasks.filter((t) => !t.completedAt && (taskOccursOn(t, today) || !t.date));
  return [...open].sort((a, b) => {
    const urgent = (t: Task) => t.deadline && t.deadline <= today ? 0 : t.kind === "fixed" ? 1 : 2;
    return urgent(a) - urgent(b) || (energy === "low" ? Number(a.effort !== "light") - Number(b.effort !== "light") : 0) || (a.time || "99:99").localeCompare(b.time || "99:99") || (a.deadline || "9999").localeCompare(b.deadline || "9999");
  })[0] || null;
}
const task = (id: string, title: string, patch: Partial<Task> = {}): Task => ({ id, title, date: localDate(), time: "", deadline: "", kind: "flexible", duration: 30, repeat: "none", area: "anywhere", effort: "light", completedAt: null, notes: "", tags: [], projectId: "", ...patch });
export function demo(): State {
  const today = localDate();
  return {
    version: 2,
    tasks: [
      task("t1", "Shape the first chapter of UNBOUND", { effort: "deep", duration: 60, area: "home" }),
      task("t2", "Send the proposal you believe in", { deadline: today, kind: "deadline", duration: 20 }),
      task("t3", "Take a walk without your phone", { kind: "optional", duration: 30, area: "outside" }),
    ],
    thoughts: [{ id: "m1", text: "What would my week look like if I protected my mornings?", createdAt: new Date().toISOString() }],
    projects: [{ id: "p1", name: "A little more freedom", outcome: "Build a working rhythm that leaves room for life.", deadline: "", nextAction: "Choose one commitment to simplify this week.", status: "active", place: "Start with my mornings. Keep the first hour open.", progress: 35 }],
    library: [
      { id: "l1", category: "shopping", title: "Oat milk", group: "dm", details: "Usual weekly buy" },
      { id: "l2", category: "shopping", title: "Fresh vegetables", group: "Market", details: "Choose what looks best" },
      { id: "l3", category: "feel-good", title: "Walk by the river", group: "10–30 min", details: "No phone needed" },
      { id: "l4", category: "places", title: "Samobor old town", group: "Local escape", details: "Coffee and a slow walk" },
      { id: "l5", category: "meals", title: "Vegetable risotto", group: "Dinner", details: "35 min" },
      { id: "l6", category: "workouts", title: "Gentle full body", group: "Home", details: "Warm-up, 3 rounds, stretch" },
      { id: "l7", category: "bags", title: "Gym bag", group: "Checklist", details: "Shoes, towel, water, headphones" },
    ],
    inbox: [{ id: "i1", text: "Check the faculty schedule for next week", createdAt: new Date().toISOString() }],
    routines: [
      { id: "r1", title: "Water + medication", period: "morning" },
      { id: "r2", title: "Look at today before messages", period: "morning" },
      { id: "r3", title: "Pack tomorrow’s bag", period: "evening" },
      { id: "r4", title: "Choose tomorrow’s first gentle step", period: "evening" },
    ],
    routineDone: {}, anchors: {}, energies: {}, focus: {}, reflections: {}, weeklyCheckins: {},
  };
}
function migrateTask(t: Record<string, unknown>): Task { return task(String(t.id || "migrated"), String(t.title || "Untitled"), { deadline: typeof t.deadline === "string" ? t.deadline : "", effort: t.effort === "deep" ? "deep" : "light", completedAt: typeof t.completedAt === "string" ? t.completedAt : null, date: "" }); }
export function migrateState(value: unknown): State | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (v.version === 2 && isState(v)) return v;
  if (v.version !== 1 || !Array.isArray(v.tasks) || !Array.isArray(v.projects)) return null;
  const fresh = demo();
  return { ...fresh,
    tasks: v.tasks.map((t) => migrateTask(t as Record<string, unknown>)),
    thoughts: Array.isArray(v.thoughts) ? v.thoughts as Thought[] : [],
    projects: (v.projects as Array<Record<string, unknown>>).map((p) => ({ id: String(p.id), name: String(p.name), outcome: String(p.outcome), deadline: String(p.deadline || ""), nextAction: String(p.nextAction || ""), status: p.status as Goal["status"] || "active", place: String(p.place || ""), progress: 0 })),
    anchors: v.anchors as Record<string, string> || {}, energies: v.energies as Record<string, string> || {}, reflections: v.reflections as State["reflections"] || {},
  };
}
export function isState(value: unknown): value is State {
  if (!value || typeof value !== "object") return false;
  const v = value as State;
  return v.version === 2 && Array.isArray(v.tasks) && v.tasks.every((t) => typeof t.id === "string" && typeof t.title === "string" && ["fixed", "deadline", "flexible", "optional"].includes(t.kind)) && Array.isArray(v.thoughts) && Array.isArray(v.projects) && Array.isArray(v.library) && Array.isArray(v.inbox) && Array.isArray(v.routines) && !!v.routineDone && !!v.anchors && !!v.energies && !!v.focus && !!v.reflections && !!v.weeklyCheckins;
}
