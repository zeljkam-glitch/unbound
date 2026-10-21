// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Unbound from "./Unbound";
import { demo } from "@/lib/model";
const preventNavigation = (event: MouseEvent) => {
  if ((event.target as Element).closest("a")) event.preventDefault();
};
beforeEach(() => {
  document.addEventListener("click", preventNavigation);
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => ({ matches: false })),
  });
  Object.defineProperty(window, "scrollTo", { writable: true, value: vi.fn() });
});
afterEach(() => {
  cleanup();
  document.removeEventListener("click", preventNavigation);
  vi.restoreAllMocks();
});
async function open() {
  render(<Unbound />);
  await screen.findByRole("heading", { name: "Make room for what matters." });
}
describe("UNBOUND working interactions", () => {
  it("adds and completes a task, then reflects it this week", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "＋ Add a task" }));
    fireEvent.change(screen.getByLabelText("What needs doing?"), {
      target: { value: "A concrete step" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Add task", }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Complete A concrete step",
      }),
    );
    expect(
      screen.getByRole("button", {
        name: "Reopen A concrete step",
      }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: /Reflect/ }));
    expect(screen.getByText("✓ A concrete step")).toBeTruthy();
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem("unbound.v1")!).tasks.find(
          (t: { title: string }) => t.title === "A concrete step",
        ).completedAt,
      ).toBeTruthy(),
    );
  });
  it("captures, edits and deletes a thought without adding tasks", async () => {
    await open();
    fireEvent.click(screen.getByRole("link", { name: /Mindspace/ }));
    fireEvent.change(
      screen.getByLabelText("What’s passing through your mind?"),
      { target: { value: "A passing thought" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Save thought", }),
    );
    expect(screen.getByText("A passing thought")).toBeTruthy();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Edit", })[0],
    );
    fireEvent.change(screen.getByLabelText("Edit your thought"), {
      target: { value: "An edited thought" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByText("An edited thought")).toBeTruthy();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Delete", })[0],
    );
    expect(screen.queryByText("An edited thought")).toBeNull();
    expect(JSON.parse(localStorage.getItem("unbound.v1")!).tasks).toHaveLength(
      3,
    );
  });
  it("preserves Save My Place when pausing and reloading", async () => {
    await open();
    fireEvent.click(screen.getByRole("link", { name: /Projects/ }));
    fireEvent.change(screen.getByLabelText("Save My Place"), {
      target: { value: "Return to the outline" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Pause", }));
    expect(
      screen.getByRole("button", { name: "Resume", }),
    ).toBeTruthy();
    cleanup();
    window.history.replaceState(null, "", "/#projects");
    render(<Unbound />);
    await screen.findByRole("button", { name: "Resume", });
    expect(
      (screen.getByLabelText("Save My Place") as HTMLTextAreaElement).value,
    ).toBe("Return to the outline");
  });
  it("preserves malformed storage and offers an explicit reset", async () => {
    localStorage.setItem("unbound.v1", "broken JSON");
    await open();
    expect(localStorage.getItem("unbound.v1")).toBe("broken JSON");
    fireEvent.click(
      screen.getAllByRole("button", { name: /Your space & data/ })[0],
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset all data" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete everything" }));
    expect(
      screen.getByText("No commitments yet. Add only what you want to carry."),
    ).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("unbound.v1")!).tasks).toHaveLength(
      0,
    );
  });
  it("handles unavailable storage without crashing", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota", "QuotaExceededError");
    });
    await open();
    expect(screen.getByText(/Your changes could not be saved/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Today's anchor"), {
      target: { value: "Still works" },
    });
    expect(
      (screen.getByLabelText("Today's anchor") as HTMLInputElement).value,
    ).toBe("Still works");
  });
  it("provides text fallback when speech is unavailable", async () => {
    await open();
    fireEvent.click(screen.getByRole("link", { name: /Mindspace/ }));
    fireEvent.click(screen.getByRole("button", { name: "Use voice" }));
    expect(screen.getByText(/Voice capture is not supported/)).toBeTruthy();
    expect(
      screen.getByLabelText("What’s passing through your mind?"),
    ).toBeTruthy();
  });
  it("loads valid previously saved state", async () => {
    const s = demo();
    s.anchors[
      new Date().getFullYear() +
        "-" +
        String(new Date().getMonth() + 1).padStart(2, "0") +
        "-" +
        String(new Date().getDate()).padStart(2, "0")
    ] = "My saved anchor";
    localStorage.setItem("unbound.v1", JSON.stringify(s));
    await open();
    expect(
      (screen.getByLabelText("Today's anchor") as HTMLInputElement).value,
    ).toBe("My saved anchor");
  });
});
