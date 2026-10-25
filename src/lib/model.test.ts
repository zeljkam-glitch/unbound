import { describe, it, expect } from "vitest";
import {
  demo,
  toggleTask,
  deadlineState,
  deadlineAwareness,
  captureThought,
  pauseProject,
  suggest,
  isState,
  parseTaskInput,
  weekStart,
  migrateState,
  mergePrivateLists,
  libraryItemCopy,
  taskOccursOn,
  taskTitle,
} from "./model";
import { feelingOptions, matchingBeautifulMoments } from "./beautiful-moments";
describe("personal freedom model", () => {
  it("completes and reopens a task", () => {
    const task = demo().tasks[0];
    const done = toggleTask(task, "2026-10-21T09:00:00Z");
    expect(done.completedAt).toBe("2026-10-21T09:00:00Z");
    expect(toggleTask(done).completedAt).toBeNull();
    expect(task.completedAt).toBeNull();
  });
  it("classifies real deadlines without timezone conversion", () => {
    expect(deadlineState("2026-10-20", "2026-10-21")).toBe("Overdue");
    expect(deadlineState("2026-10-21", "2026-10-21")).toBe("Today");
    expect(deadlineState("2026-10-22", "2026-10-21")).toBe("Upcoming");
    expect(deadlineState("")).toBe("Flexible");
  });
  it("makes an approaching or missed deadline understandable", () => {
    expect(deadlineAwareness("2026-10-24", "2026-10-24")).toEqual({ tone: "today", label: "Due today" });
    expect(deadlineAwareness("2026-10-26", "2026-10-24")).toEqual({ tone: "soon", label: "Due in 2 days" });
    expect(deadlineAwareness("2026-10-23", "2026-10-24")).toEqual({ tone: "overdue", label: "Overdue by 1 day" });
    expect(deadlineAwareness("", "2026-10-24")).toBeNull();
  });
  it("captures timestamped thoughts and rejects whitespace", () => {
    expect(captureThought("  an idea  ", "id", "now")).toEqual({
      id: "id",
      text: "an idea",
      createdAt: "now",
    });
    expect(captureThought("  ", "id")).toBeNull();
  });
  it("parses fast planner syntax without keeping control tokens in the title", () => {
    expect(parseTaskInput("Call faculty #study @16:00 t25m")).toEqual({
      title: "Call faculty", time: "16:00", duration: 25, tags: ["study"],
    });
    expect(parseTaskInput("Slow morning", 60)).toEqual({ title: "Slow morning", time: "", duration: 60, tags: [] });
  });
  it("pauses and resumes without losing my place", () => {
    const p = demo().projects[0];
    expect(pauseProject(p).status).toBe("paused");
    expect(pauseProject(pauseProject(p))).toEqual(p);
  });
  it("prioritizes deadlines, then light work with low energy", () => {
    const s = demo();
    expect(suggest(s.tasks, "low")?.id).toBe("t2");
    expect(
      suggest(
        s.tasks.filter((t) => !t.deadline),
        "low",
      )?.id,
    ).toBe("t3");
    expect(suggest([], "low")).toBeNull();
  });
  it("validates persisted data and rejects malformed records", () => {
    expect(isState(demo())).toBe(true);
    expect(isState({ ...demo(), tasks: [{}] })).toBe(false);
    expect(isState(null)).toBe(false);
  });
  it("starts the reflection week on Monday", () => {
    expect(weekStart(new Date(2026, 9, 25)).getDate()).toBe(19);
  });
  it("matches beautiful moments to real daily resources", () => {
    const moments = demo("en").beautifulMoments;
    const matches = matchingBeautifulMoments(moments, { feelings: ["inspired"], maxMinutes: 60, maxBudget: 0, energy: "low", setting: "inside", badWeatherOnly: true, condition: "gentle" });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((moment) => moment.duration <= 60 && moment.budget === 0 && moment.energy === "low" && moment.badWeather)).toBe(true);
  });
  it("offers at least one suggestion for every curated feeling", () => {
    const moments = demo("hr").beautifulMoments;
    for (const feeling of feelingOptions) {
      expect(matchingBeautifulMoments(moments, { feelings: [feeling], maxMinutes: 0, maxBudget: -1, energy: "", setting: "", badWeatherOnly: false, condition: "" }).length).toBeGreaterThan(0);
    }
  });
  it("does not let one calm feeling override playful and energetic choices", () => {
    const matches = matchingBeautifulMoments(demo("hr").beautifulMoments, { feelings: ["relaxed", "playful", "energetic"], maxMinutes: 0, maxBudget: -1, energy: "", setting: "inside", badWeatherOnly: true, condition: "" });
    expect(matches.some((moment) => moment.id === "moment-tea-window")).toBe(false);
    expect(matches.length).toBeGreaterThan(0);
  });
  it("migrates the curated daily-thought collection without losing existing data", () => {
    const previous = { ...demo("hr"), version: 4, library: demo("hr").library.filter((item) => item.category !== "quotes") };
    const migrated = migrateState(previous);
    expect(migrated?.version).toBe(5);
    expect(migrated?.library.some((item) => item.category === "quotes")).toBe(true);
    expect(migrated?.tasks).toHaveLength(previous.tasks.length);
  });
  it("lets private routine groups replace public examples and keeps external moment links", () => {
    const current = demo("hr");
    const privateMorning = { id: "private-morning", title: "Moja jutarnja stavka", period: "morning" as const };
    const linkedMoment = { ...current.beautifulMoments[0], id: "private-song", url: "https://open.spotify.com/track/example" };
    const merged = mergePrivateLists(current, { routines: [privateMorning], library: [], beautifulMoments: [linkedMoment] });

    expect(merged?.routines.filter((item) => item.period === "morning")).toEqual([privateMorning]);
    expect(merged?.routines.some((item) => item.period === "evening")).toBe(true);
    expect(merged?.beautifulMoments.find((item) => item.id === "private-song")?.url).toBe(linkedMoment.url);
  });
  it("imports private tasks idempotently", () => {
    const current = demo("hr");
    const privateTask = { ...current.tasks[0], id: "private-task", title: "Moj zadatak", repeat: "monthly" as const };
    const once = mergePrivateLists(current, { routines: [], library: [], tasks: [privateTask] });
    const twice = once && mergePrivateLists(once, { routines: [], library: [], tasks: [privateTask] });

    expect(twice?.tasks.filter((item) => item.id === privateTask.id)).toHaveLength(1);
  });
  it("shows monthly tasks on the matching day", () => {
    const monthly = { ...demo("hr").tasks[0], date: "2026-10-25", repeat: "monthly" as const };
    expect(taskOccursOn(monthly, "2026-11-25")).toBe(true);
    expect(taskOccursOn(monthly, "2026-11-24")).toBe(false);
  });
  it("shows private content in the selected language", () => {
    const task = { ...demo("hr").tasks[0], translations: { en: { title: "English task" } } };
    const item = { ...demo("hr").library[0], translations: { en: { title: "English item", group: "Store", details: "One, Two" } } };
    expect(taskTitle(task, "en")).toBe("English task");
    expect(taskTitle(task, "hr")).toBe(task.title);
    expect(libraryItemCopy(item, "en").details).toBe("One, Two");
  });
  it("retires a former demo thought from already saved browsers", () => {
    const current = demo("en");
    const saved = { ...current, library: [...current.library, { id: "quote-attention", category: "quotes" as const, title: "Former demo thought", group: "Former source", details: "Former note" }] };
    const migrated = migrateState(saved);
    expect(migrated?.library.some((item) => item.id === "quote-attention")).toBe(false);
    expect(migrated?.library.some((item) => item.id === "quote-notice")).toBe(true);
  });
});
