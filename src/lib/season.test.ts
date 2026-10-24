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
});
