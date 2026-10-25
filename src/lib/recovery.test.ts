import { describe, expect, it } from "vitest";
import { compareRecovery, recommendRecovery } from "./recovery";

describe("energy and recovery guidance", () => {
  it("uses active recovery for a 3/5 mental-work check-in", () => {
    expect(recommendRecovery({ energy: 3, focus: 3, cause: "mental", need: "study-recovery" }).id).toBe("active-recovery-10");
  });

  it("treats stable scores plus feeling rested as useful", () => {
    expect(compareRecovery({ energy: 3, focus: 3 }, { energy: 3, focus: 3, rested: "yes" })).toMatchObject({ outcome: "maintained", helped: true });
  });

  it("does not push activation when lack of sleep is the cause", () => {
    expect(recommendRecovery({ energy: 2, focus: 2, cause: "sleep" }).need).toBe("complete-rest");
  });

  it("does not prescribe more movement for low physical energy", () => {
    expect(recommendRecovery({ energy: 2, focus: 3, cause: "low-physical-energy", need: "energy" }).id).toBe("low-battery-20");
  });

  it("responds to cabin fever with a change of scene indoors", () => {
    expect(recommendRecovery({ energy: 3, focus: 3, cause: "indoors", need: "energy" }).id).toBe("room-change-12");
  });
});
