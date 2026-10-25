import { beautifulMomentCatalog } from "./beautiful-moments";

export type TaskKind = "fixed" | "deadline" | "flexible" | "optional";
export type Task = {
  id: string; title: string; date: string; time: string; deadline: string;
  kind: TaskKind; duration: number; repeat: "none" | "daily" | "weekly" | "monthly";
  area: "home" | "outside" | "anywhere"; effort: "light" | "deep";
  completedAt: string | null; notes?: string; tags?: string[]; projectId?: string;
  translations?: Partial<Record<"hr" | "en", { title: string }>>;
};
export type Thought = { id: string; text: string; createdAt: string };
export type Goal = { id: string; name: string; outcome: string; deadline: string; nextAction: string; status: "active" | "paused" | "completed"; place: string; progress: number };
export type Project = Goal;
export type LibraryCategory = "shopping" | "feel-good" | "beauty" | "places" | "meals" | "workouts" | "bags" | "lists" | "quotes";
export type MealProfile = {
  minutes: number;
  servings: number;
  energy: "low" | "steady" | "high";
  ingredients: string[];
  leftoverFriendly: boolean;
  season: "all" | "spring" | "summer" | "autumn" | "winter";
};
export type LibraryItem = { id: string; category: LibraryCategory; title: string; group: string; details: string; url?: string; meal?: MealProfile; translations?: Partial<Record<"hr" | "en", { title: string; group: string; details: string }>> };
export type InboxItem = { id: string; text: string; createdAt: string };
export type Routine = { id: string; title: string; period: "morning" | "evening" | "weekly" };
export type BeautifulMoment = { id: string; title: string; description: string; url?: string; duration: number; budget: number; energy: "low" | "steady" | "high"; feelings: string[]; category: string; setting: "inside" | "outside" | "either"; badWeather: boolean; solo: boolean; social: boolean; favorite: boolean; completedDates: string[] };
export type MomentPreferences = { feelings: string[]; maxMinutes: number; maxBudget: number; energy: "" | "low" | "steady" | "high"; setting: "" | "inside" | "outside"; badWeatherOnly: boolean; condition: "" | "gentle" | "rest" };
export type DayContext = { indoorsAllDay: boolean; smallSpace: boolean; cabinFever: boolean; lowPhysicalEnergy: boolean };
export type WeeklyCheckin = { win: string; learned: string; next: string; energy: string };
export type TwelveWeekPlan = { startDate: string; outcome: string; why: string; leadAction: string; weeklyTarget: number; weeks: Record<string, { focus: string; reviewed: boolean }> };
export type RecoveryNeed = "focus" | "energy" | "less-stimulation" | "study-recovery" | "body-recovery" | "complete-rest";
export type RecoveryCause = "mental" | "physical" | "low-physical-energy" | "stress" | "sleep" | "hunger" | "pain" | "emotional" | "indoors" | "other";
export type RecoveryCheckin = {
  id: string; date: string; createdAt: string; phase: "before" | "after";
  energy: number; focus: number; cause: RecoveryCause; need: RecoveryNeed;
  protocolId?: string; sessionId?: string; rested?: "yes" | "same" | "no";
};
export type State = {
  version: 6; tasks: Task[]; thoughts: Thought[]; projects: Goal[]; library: LibraryItem[];
  inbox: InboxItem[]; routines: Routine[]; routineDone: Record<string, string[]>;
  anchors: Record<string, string>; energies: Record<string, string>; focus: Record<string, string>;
  reflections: Record<string, { autonomy: string; satisfaction: string; pressure: string }>;
  weeklyCheckins: Record<string, WeeklyCheckin>;
  libraryChecked?: Record<string, string[]>;
  beautifulMoments: BeautifulMoment[];
  plannedMoments: Record<string, string[]>;
  momentPreferences: Record<string, MomentPreferences>;
  recoveryCheckins?: RecoveryCheckin[];
  twelveWeek?: TwelveWeekPlan;
  dayContexts?: Record<string, DayContext>;
  momentCatalogRevision?: number;
};

export const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const taskTitle = (task: Task, locale: "hr" | "en") => task.translations?.[locale]?.title || task.title;
export const libraryItemCopy = (item: LibraryItem, locale: "hr" | "en") => ({ ...item, ...(item.translations?.[locale] || {}) });
export function addDays(date: string, amount: number) { const [y, m, day] = date.split("-").map(Number); const d = new Date(y, m - 1, day); d.setDate(d.getDate() + amount); return localDate(d); }
export function mergePrivateLists(state: State, value: unknown): State | null {
  if (!value || typeof value !== "object") return null;
  const bundle = value as { routines?: unknown; library?: unknown; tasks?: unknown; beautifulMoments?: unknown; recoveryCheckins?: unknown };
  if (!Array.isArray(bundle.routines) || !Array.isArray(bundle.library)) return null;
  const routines = bundle.routines.filter((item): item is Routine => !!item && typeof item === "object" && typeof item.id === "string" && typeof item.title === "string" && ["morning", "evening", "weekly"].includes(item.period));
  const library = bundle.library.filter((item): item is LibraryItem => !!item && typeof item === "object" && typeof item.id === "string" && typeof item.title === "string" && typeof item.group === "string" && typeof item.details === "string" && ["shopping", "feel-good", "beauty", "places", "meals", "workouts", "bags", "lists", "quotes"].includes(item.category));
  const incomingTasks = Array.isArray(bundle.tasks) ? bundle.tasks : [];
  const tasks = incomingTasks.filter((item): item is Task => !!item && typeof item === "object" && typeof item.id === "string" && typeof item.title === "string" && typeof item.date === "string" && typeof item.time === "string" && typeof item.deadline === "string" && ["fixed", "deadline", "flexible", "optional"].includes(item.kind) && typeof item.duration === "number" && ["none", "daily", "weekly", "monthly"].includes(item.repeat) && ["home", "outside", "anywhere"].includes(item.area) && ["light", "deep"].includes(item.effort));
  const incomingMoments = Array.isArray(bundle.beautifulMoments) ? bundle.beautifulMoments : [];
  const beautifulMoments = incomingMoments.filter((item): item is BeautifulMoment => !!item && typeof item === "object" && typeof item.id === "string" && typeof item.title === "string" && typeof item.description === "string" && (item.url === undefined || typeof item.url === "string") && typeof item.duration === "number" && typeof item.budget === "number" && ["low", "steady", "high"].includes(item.energy) && Array.isArray(item.feelings) && ["inside", "outside", "either"].includes(item.setting) && typeof item.badWeather === "boolean");
  const incomingCheckins = Array.isArray(bundle.recoveryCheckins) ? bundle.recoveryCheckins : [];
  const recoveryCheckins = incomingCheckins.filter((item): item is RecoveryCheckin => !!item && typeof item === "object" && typeof item.id === "string" && typeof item.date === "string" && typeof item.createdAt === "string" && ["before", "after"].includes(item.phase) && typeof item.energy === "number" && typeof item.focus === "number" && ["mental", "physical", "low-physical-energy", "stress", "sleep", "hunger", "pain", "emotional", "indoors", "other"].includes(item.cause) && ["focus", "energy", "less-stimulation", "study-recovery", "body-recovery", "complete-rest"].includes(item.need));
  if (routines.length !== bundle.routines.length || library.length !== bundle.library.length || tasks.length !== incomingTasks.length || beautifulMoments.length !== incomingMoments.length || recoveryCheckins.length !== incomingCheckins.length) return null;
  const privateRoutinePeriods = new Set(routines.map((item) => item.period));
  return {
    ...state,
    routines: [...state.routines.filter((item) => !privateRoutinePeriods.has(item.period)), ...routines],
    library: [...state.library.filter((item) => !library.some((incoming) => incoming.id === item.id)), ...library],
    tasks: [...state.tasks.filter((item) => !tasks.some((incoming) => incoming.id === item.id)), ...tasks.map((item) => ({ ...item, completedAt: item.completedAt || null }))],
    beautifulMoments: [...state.beautifulMoments.filter((item) => !beautifulMoments.some((incoming) => incoming.id === item.id)), ...beautifulMoments.map((item) => ({ ...item, favorite: !!item.favorite, completedDates: Array.isArray(item.completedDates) ? item.completedDates : [] }))],
    recoveryCheckins: [...(state.recoveryCheckins || []).filter((item) => !recoveryCheckins.some((incoming) => incoming.id === item.id)), ...recoveryCheckins],
  };
}
export function deadlineState(date: string, today = localDate()) { return !date ? "Flexible" : date < today ? "Overdue" : date === today ? "Today" : "Upcoming"; }
export function deadlineAwareness(deadline: string, today = localDate(), locale: "hr" | "en" = "en") {
  if (!deadline) return null;
  const from = new Date(`${today}T12:00:00`), to = new Date(`${deadline}T12:00:00`);
  const days = Math.round((to.getTime() - from.getTime()) / 86400000);
  if (days < 0) return { tone: "overdue" as const, label: locale === "hr" ? `Rok je prošao prije ${Math.abs(days)} ${Math.abs(days) === 1 ? "dan" : "dana"}` : `Overdue by ${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"}` };
  if (days === 0) return { tone: "today" as const, label: locale === "hr" ? "Rok je danas" : "Due today" };
  return { tone: days <= 3 ? "soon" as const : "future" as const, label: locale === "hr" ? `Još ${days} ${days === 1 ? "dan" : "dana"} do roka` : `Due in ${days} ${days === 1 ? "day" : "days"}` };
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
  if (task.repeat === "monthly") {
    const [, startMonth, startDay] = task.date.split("-").map(Number);
    const [year, month, day] = date.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const startLastDay = new Date(Number(task.date.slice(0, 4)), startMonth, 0).getDate();
    return day === startDay || (startDay === startLastDay && day === lastDay);
  }
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
const quoteLibrary = (locale: "hr" | "en"): LibraryItem[] => locale === "hr" ? [
  { id: "quote-notice", category: "quotes", title: "Primijeti ono zbog čega se vraćaš sebi.", group: "UNBOUND", details: "Za dane u kojima želiš ponovno čuti vlastiti ritam." },
  { id: "quote-questions", category: "quotes", title: "Živi pitanja.", group: "Rainer Maria Rilke", details: "Ne mora svaki odgovor stići danas." },
  { id: "quote-room", category: "quotes", title: "Ostavi malo mjesta za ono što još ne znaš.", group: "UNBOUND", details: "Podsjetnik da plan ne mora zatvoriti cijeli dan." },
  { id: "quote-rhythm", category: "quotes", title: "Tvoj ritam nije prepreka planu. On je dio plana.", group: "UNBOUND", details: "Za dane kada kapacitet traži drukčiji oblik." },
  { id: "quote-enough", category: "quotes", title: "Dovoljno je ono što te danas ne udaljava od sebe.", group: "UNBOUND", details: "Nježan kriterij za biranje prioriteta." },
] : [
  { id: "quote-notice", category: "quotes", title: "Notice what brings you back to yourself.", group: "UNBOUND", details: "For days when you want to hear your own rhythm again." },
  { id: "quote-questions", category: "quotes", title: "Live the questions.", group: "Rainer Maria Rilke", details: "Not every answer needs to arrive today." },
  { id: "quote-room", category: "quotes", title: "Leave a little room for what you do not know yet.", group: "UNBOUND", details: "A reminder that the plan does not need to close the whole day." },
  { id: "quote-rhythm", category: "quotes", title: "Your pace is not an obstacle to the plan. It belongs in it.", group: "UNBOUND", details: "For days when capacity asks for a different shape." },
  { id: "quote-enough", category: "quotes", title: "Enough is what does not take you further away from yourself today.", group: "UNBOUND", details: "A gentle measure for choosing priorities." },
];
const retireFormerDemoThought = (library: LibraryItem[]) => {
  const alreadyReplaced = library.some((item) => item.id === "quote-notice");
  return library.flatMap((item) => item.id !== "quote-attention" ? [item] : alreadyReplaced ? [] : [{ id: "quote-notice", category: "quotes" as const, title: item.title.startsWith("Pažnja") ? "Primijeti ono zbog čega se vraćaš sebi." : "Notice what brings you back to yourself.", group: "UNBOUND", details: item.title.startsWith("Pažnja") ? "Za dane u kojima želiš ponovno čuti vlastiti ritam." : "For days when you want to hear your own rhythm again." }]);
};
const cleanPersonalLibrary = (library: LibraryItem[]) => library
  .filter((item) => item.id !== "l1")
  .map((item) => item.id === "private-wishlist-appearance" ? { ...item, category: "lists" as const } : item);
export function demo(locale: "hr" | "en" = "en"): State {
  const today = localDate();
  const hr = locale === "hr";
  return {
    version: 6,
    tasks: [
      task("t1", hr ? "Oblikuj prvo poglavlje UNBOUND-a" : "Shape the first chapter of UNBOUND", { effort: "deep", duration: 60, area: "home" }),
      task("t2", hr ? "Pošalji prijedlog u koji vjeruješ" : "Send the proposal you believe in", { deadline: today, kind: "deadline", duration: 20 }),
      task("t3", hr ? "Prošetaj bez mobitela" : "Take a walk without your phone", { kind: "optional", duration: 30, area: "outside" }),
    ],
    thoughts: [{ id: "m1", text: hr ? "Kako bi izgledao moj tjedan kada bih sačuvala svoja jutra?" : "What would my week look like if I protected my mornings?", createdAt: new Date().toISOString() }],
    projects: [{ id: "p1", name: hr ? "Malo više slobode" : "A little more freedom", outcome: hr ? "Pronaći ritam rada u kojem ostaje mjesta za život." : "Build a working rhythm that leaves room for life.", deadline: "", nextAction: hr ? "Ovaj tjedan pojednostavni jednu obavezu." : "Choose one commitment to simplify this week.", status: "active", place: hr ? "Počni s jutrima. Sačuvaj prvi sat." : "Start with my mornings. Keep the first hour open.", progress: 35 }],
    library: [
      { id: "l2", category: "shopping", title: hr ? "Svježe povrće" : "Fresh vegetables", group: hr ? "Plac" : "Market", details: hr ? "Odaberi ono što izgleda najbolje" : "Choose what looks best" },
      { id: "l3", category: "feel-good", title: hr ? "Šetnja uz rijeku" : "Walk by the river", group: "10–30 min", details: hr ? "Mobitel može ostati u torbi" : "The phone can stay in your bag" },
      { id: "l4", category: "places", title: hr ? "Stari grad Samobor" : "Samobor old town", group: hr ? "Mali bijeg" : "Local escape", details: hr ? "Kava i polagana šetnja" : "Coffee and a slow walk" },
      { id: "l5", category: "meals", title: hr ? "Rižoto s povrćem" : "Vegetable risotto", group: hr ? "Večera" : "Dinner", details: hr ? "Toplo, jednostavno jelo koje može ostati i za sutra." : "A warm, simple meal that can cover tomorrow too.", meal: { minutes: 35, servings: 2, energy: "steady", ingredients: hr ? ["riža", "tikvica", "mrkva", "luk", "parmezan"] : ["rice", "zucchini", "carrot", "onion", "parmesan"], leftoverFriendly: true, season: "all" } },
      { id: "l6", category: "workouts", title: hr ? "Joga za početnike · 20 min" : "Beginner yoga · 20 min", group: hr ? "Doma · YouTube" : "Home · YouTube", details: hr ? "Miran početak bez opreme" : "A gentle start with no equipment", url: "https://www.youtube.com/watch?v=v7AYKMP6rOE" },
      { id: "l7", category: "bags", title: hr ? "Torba za teretanu" : "Gym bag", group: hr ? "Popis" : "Checklist", details: hr ? "Tenisice, ručnik, voda, slušalice" : "Shoes, towel, water, headphones" },
      ...quoteLibrary(locale),
    ],
    inbox: [{ id: "i1", text: hr ? "Provjeri raspored na faksu za sljedeći tjedan" : "Check the faculty schedule for next week", createdAt: new Date().toISOString() }],
    routines: [
      { id: "r1", title: hr ? "Voda i lijekovi" : "Water and medication", period: "morning" },
      { id: "r2", title: hr ? "Pogledaj svoj dan prije poruka" : "Look at your day before messages", period: "morning" },
      { id: "r3", title: hr ? "Spremi torbu za sutra" : "Pack tomorrow’s bag", period: "evening" },
      { id: "r4", title: hr ? "Odaberi prvi mali korak za sutra" : "Choose tomorrow’s first small step", period: "evening" },
    ],
    routineDone: {}, anchors: {}, energies: {}, focus: {}, reflections: {}, weeklyCheckins: {}, libraryChecked: {},
    beautifulMoments: beautifulMomentCatalog(locale), plannedMoments: {}, momentPreferences: {}, recoveryCheckins: [], dayContexts: {}, momentCatalogRevision: 2,
    twelveWeek: { startDate: today, outcome: "", why: "", leadAction: "", weeklyTarget: 3, weeks: {} },
  };
}
function migrateTask(t: Record<string, unknown>): Task { return task(String(t.id || "migrated"), String(t.title || "Untitled"), { deadline: typeof t.deadline === "string" ? t.deadline : "", effort: t.effort === "deep" ? "deep" : "light", completedAt: typeof t.completedAt === "string" ? t.completedAt : null, date: "" }); }
export function migrateState(value: unknown): State | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (v.version === 6 && isState(v)) {
    const current = v as unknown as State;
    const locale = current.beautifulMoments.some((moment) => /[čćžšđ]/i.test(`${moment.title} ${moment.description}`)) ? "hr" : "en";
    const catalog = beautifulMomentCatalog(locale);
    const beautifulMoments = (current.momentCatalogRevision || 0) < 2
      ? [...current.beautifulMoments.filter((moment) => moment.id !== "moment-tea-window" && !catalog.some((seed) => seed.id === moment.id)), ...catalog.map((seed) => { const saved = current.beautifulMoments.find((moment) => moment.id === seed.id); return saved ? { ...seed, favorite: saved.favorite, completedDates: saved.completedDates, url: saved.url || seed.url } : seed; })]
      : current.beautifulMoments;
    return { ...current, library: cleanPersonalLibrary(retireFormerDemoThought(current.library)), recoveryCheckins: Array.isArray(current.recoveryCheckins) ? current.recoveryCheckins : [], dayContexts: current.dayContexts || {}, beautifulMoments, momentCatalogRevision: 2 };
  }
  if (v.version === 5 && isState({ ...v, version: 6 })) {
    const previous = v as unknown as State;
    const hr = previous.beautifulMoments.some((moment) => moment.id === "moment-one-song" && moment.title.startsWith("Jedna pjesma"));
    const addition = beautifulMomentCatalog(hr ? "hr" : "en").find((moment) => moment.id === "moment-one-song-move");
    return { ...previous, version: 6, library: cleanPersonalLibrary(retireFormerDemoThought(previous.library)), beautifulMoments: addition && !previous.beautifulMoments.some((moment) => moment.id === addition.id) ? [addition, ...previous.beautifulMoments] : previous.beautifulMoments, recoveryCheckins: Array.isArray(previous.recoveryCheckins) ? previous.recoveryCheckins : [], dayContexts: {}, momentCatalogRevision: 0 };
  }
  if (v.version === 4 && Array.isArray(v.library)) return { ...(v as unknown as State), version: 6, library: [...(v.library as LibraryItem[]), ...quoteLibrary("hr").filter((quote) => !(v.library as LibraryItem[]).some((item) => item.id === quote.id))] };
  if ((v.version === 2 || v.version === 3) && Array.isArray(v.tasks) && Array.isArray(v.projects) && Array.isArray(v.library) && Array.isArray(v.routines)) return { ...(v as unknown as State), version: 6, library: [...(v.library as LibraryItem[]), ...quoteLibrary("hr")], beautifulMoments: beautifulMomentCatalog("hr"), plannedMoments: {}, momentPreferences: {} };
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
  return v.version === 6 && Array.isArray(v.tasks) && v.tasks.every((t) => typeof t.id === "string" && typeof t.title === "string" && ["fixed", "deadline", "flexible", "optional"].includes(t.kind)) && Array.isArray(v.thoughts) && Array.isArray(v.projects) && Array.isArray(v.library) && Array.isArray(v.inbox) && Array.isArray(v.routines) && Array.isArray(v.beautifulMoments) && !!v.plannedMoments && !!v.momentPreferences && !!v.routineDone && !!v.anchors && !!v.energies && !!v.focus && !!v.reflections && !!v.weeklyCheckins;
}
