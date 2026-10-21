export type Task = {
  id: string;
  title: string;
  deadline: string;
  effort: "light" | "deep";
  completedAt: string | null;
};
export type Thought = { id: string; text: string; createdAt: string };
export type Project = {
  id: string;
  name: string;
  outcome: string;
  deadline: string;
  nextAction: string;
  status: "active" | "paused" | "completed";
  place: string;
};
export type State = {
  version: 1;
  tasks: Task[];
  thoughts: Thought[];
  projects: Project[];
  anchors: Record<string, string>;
  energies: Record<string, string>;
  reflections: Record<
    string,
    { autonomy: string; satisfaction: string; pressure: string }
  >;
};
export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function deadlineState(date: string, today = localDate()) {
  return !date
    ? "Flexible"
    : date < today
      ? "Overdue"
      : date === today
        ? "Today"
        : "Upcoming";
}
export function toggleTask(task: Task, now = new Date().toISOString()): Task {
  return { ...task, completedAt: task.completedAt ? null : now };
}
export function captureThought(
  text: string,
  id: string,
  now = new Date().toISOString(),
): Thought | null {
  return text.trim() ? { id, text: text.trim(), createdAt: now } : null;
}
export function pauseProject(project: Project): Project {
  return {
    ...project,
    status: project.status === "paused" ? "active" : "paused",
  };
}
export function weekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}
export function suggest(tasks: Task[], energy: string, today = localDate()) {
  const open = tasks.filter((t) => !t.completedAt);
  return (
    [...open].sort((a, b) => {
      const urgent = (t: Task) => (t.deadline && t.deadline <= today ? 0 : 1);
      return (
        urgent(a) - urgent(b) ||
        (energy === "low"
          ? Number(a.effort !== "light") - Number(b.effort !== "light")
          : 0) ||
        (a.deadline || "9999").localeCompare(b.deadline || "9999")
      );
    })[0] || null
  );
}
export function demo(): State {
  const today = localDate();
  return {
    version: 1,
    tasks: [
      {
        id: "t1",
        title: "Shape the first chapter of UNBOUND",
        deadline: "",
        effort: "deep",
        completedAt: null,
      },
      {
        id: "t2",
        title: "Send the proposal you believe in",
        deadline: today,
        effort: "light",
        completedAt: null,
      },
      {
        id: "t3",
        title: "Take a walk without your phone",
        deadline: "",
        effort: "light",
        completedAt: null,
      },
    ],
    thoughts: [
      {
        id: "m1",
        text: "What would my week look like if I protected my mornings?",
        createdAt: new Date().toISOString(),
      },
    ],
    projects: [
      {
        id: "p1",
        name: "A little more freedom",
        outcome: "Build a working rhythm that leaves room for life.",
        deadline: "",
        nextAction: "Choose one commitment to simplify this week.",
        status: "active",
        place: "Start with my mornings. Keep the first hour open.",
      },
    ],
    anchors: {},
    energies: {},
    reflections: {},
  };
}
export function isState(value: unknown): value is State {
  if (!value || typeof value !== "object") return false;
  const v = value as State;
  const string = (x: unknown) => typeof x === "string";
  const record = (x: unknown) =>
    !!x && typeof x === "object" && !Array.isArray(x);
  return (
    v.version === 1 &&
    Array.isArray(v.tasks) &&
    v.tasks.every(
      (t) =>
        record(t) &&
        string(t.id) &&
        string(t.title) &&
        string(t.deadline) &&
        ["light", "deep"].includes(t.effort) &&
        (t.completedAt === null || string(t.completedAt)),
    ) &&
    Array.isArray(v.thoughts) &&
    v.thoughts.every(
      (t) => record(t) && string(t.id) && string(t.text) && string(t.createdAt),
    ) &&
    Array.isArray(v.projects) &&
    v.projects.every(
      (p) =>
        record(p) &&
        ["id", "name", "outcome", "deadline", "nextAction", "place"].every(
          (k) => string(p[k as keyof Project]),
        ) &&
        ["active", "paused", "completed"].includes(p.status),
    ) &&
    record(v.anchors) &&
    Object.values(v.anchors).every(string) &&
    record(v.energies) &&
    Object.values(v.energies).every(string) &&
    record(v.reflections) &&
    Object.values(v.reflections).every(
      (r) =>
        record(r) &&
        string(r.autonomy) &&
        string(r.satisfaction) &&
        string(r.pressure),
    )
  );
}
