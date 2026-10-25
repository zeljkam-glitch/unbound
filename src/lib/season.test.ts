import { describe, expect, it } from "vitest";
import { seasonForMonth, seasonalContext } from "./season";

describe("seasonal context", () => {
  it("maps months to northern-hemisphere seasons", () => {
    expect(seasonForMonth(0)).toBe("winter");
    expect(seasonForMonth(3)).toBe("spring");
    expect(seasonForMonth(6)).toBe("summer");
    expect(seasonForMonth(9)).toBe("autumn");
  });
  it("offers a localized monthly theme and three ideas", () => {
    const october = seasonalContext(new Date(2026, 9, 24), "hr");
    expect(october).toMatchObject({ month: "Listopad", season: "autumn", seasonName: "jesen" });
    expect(october.ideas).toHaveLength(3);
  });
  it("changes ideas with the day and responds to weather and obligations", () => {
    const first = seasonalContext(new Date(2026, 9, 20), "hr");
    const next = seasonalContext(new Date(2026, 9, 21), "hr");
    expect(next.ideas).not.toEqual(first.ideas);
    const contextual = seasonalContext(new Date(2026, 9, 24), "hr", { weatherCode: 61, obligations: ["Predavanje"], hour: 18 });
    expect(contextual.ideas.join(" ")).toContain("Kiša");
    expect(contextual.ideas.join(" ")).toContain("Predavanje");
  });
  it("does not suggest daylight after dark and prioritizes explicit context", () => {
    const contextual = seasonalContext(new Date(2026, 9, 25), "hr", { weatherCode: 61, hour: 19, cabinFever: true, lowPhysicalEnergy: true });
    expect(contextual.ideas[0]).toContain("dosta stana");
    expect(contextual.ideas[1]).toContain("tijelo prazno");
    expect(contextual.ideas.join(" ")).not.toContain("dnevnog svjetla");
  });
});
