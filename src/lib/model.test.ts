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
} from "./model";
import { matchingBeautifulMoments } from "./beautiful-moments";
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
});
