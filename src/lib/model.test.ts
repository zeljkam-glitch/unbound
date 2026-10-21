import { describe, it, expect } from "vitest";
import {
  demo,
  toggleTask,
  deadlineState,
  captureThought,
  pauseProject,
  suggest,
  isState,
  weekStart,
} from "./model";
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
  it("captures timestamped thoughts and rejects whitespace", () => {
    expect(captureThought("  an idea  ", "id", "now")).toEqual({
      id: "id",
      text: "an idea",
      createdAt: "now",
    });
    expect(captureThought("  ", "id")).toBeNull();
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
});
