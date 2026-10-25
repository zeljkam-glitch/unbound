// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Unbound from "./Unbound";

const preventNavigation = (event: MouseEvent) => { if ((event.target as Element).closest("a")) event.preventDefault(); };
beforeEach(() => {
  document.addEventListener("click", preventNavigation);
  localStorage.clear();
  localStorage.setItem("unbound.locale", "en");
  window.history.replaceState(null, "", "/");
  Object.defineProperty(window, "scrollTo", { writable: true, value: vi.fn() });
});
afterEach(() => { cleanup(); document.removeEventListener("click", preventNavigation); vi.restoreAllMocks(); });
async function open() { render(<Unbound />); await screen.findByRole("heading", { name: "Make room for what matters." }); }
const go = (name: RegExp) => fireEvent.click(screen.getAllByRole("link", { name })[0]);

describe("UNBOUND Life OS interactions", () => {
  it("switches between English and Croatian without losing the current view", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "HR" }));
    expect(await screen.findByRole("heading", { name: "Napravi mjesta za ono što ti je važno." })).toBeTruthy();
    expect(localStorage.getItem("unbound.locale")).toBe("hr");
  });
  it("adds a typed, timed task in Planner and persists it", async () => {
    await open(); go(/Planner/);
    fireEvent.click(screen.getByRole("button", { name: "New task" }));
    fireEvent.change(screen.getByLabelText(/Task title for/), { target: { value: "Doctor appointment #health @10:30 t45m" } });
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "fixed" } });
    fireEvent.change(screen.getByLabelText("Notes"), { target: { value: "Bring results" } });
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(screen.getByText("Doctor appointment")).toBeTruthy();
    await waitFor(() => expect(JSON.parse(localStorage.getItem("unbound.v1")!).tasks.find((t: { title: string }) => t.title === "Doctor appointment")).toMatchObject({ time: "10:30", duration: 45, tags: ["health"], notes: "Bring results" }));
    const originalDate = JSON.parse(localStorage.getItem("unbound.v1")!).tasks.find((t: { title: string }) => t.title === "Doctor appointment").date;
    fireEvent.click(screen.getByRole("button", { name: "Move Doctor appointment" }));
    fireEvent.click(screen.getByRole("button", { name: "Move one day later" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("unbound.v1")!).tasks.find((t: { title: string }) => t.title === "Doctor appointment").date).not.toBe(originalDate));
    fireEvent.click(screen.getByRole("button", { name: "Move Doctor appointment" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove time" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("unbound.v1")!).tasks.find((t: { title: string }) => t.title === "Doctor appointment")).toMatchObject({ time: "" }));
  });
  it("captures a quick idea without turning it into a task", async () => {
    await open();
    fireEvent.change(screen.getByLabelText("Quick idea"), { target: { value: "A bright new direction" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("unbound.v1")!);
      expect(saved.thoughts[0].text).toBe("A bright new direction");
      expect(saved.tasks.some((t: { title: string }) => t.title === "A bright new direction")).toBe(false);
    });
  });
  it("adapts inspiration to the current month and saves it as an idea", async () => {
    await open();
    expect(screen.getByRole("heading", { name: "The season belongs in the plan." })).toBeTruthy();
    const save = screen.getAllByRole("button", { name: /Save idea:/ })[0];
    fireEvent.click(save);
    expect(save.textContent).toContain("Saved");
    await waitFor(() => expect(JSON.parse(localStorage.getItem("unbound.v1")!).thoughts.length).toBe(2));
  });
  it("plans a beautiful moment without turning it into a productivity task", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "motivated" }));
    fireEvent.change(screen.getByLabelText("Budget for a beautiful moment"), { target: { value: "0" } });
    const add = screen.getAllByRole("button", { name: "Add as a beautiful moment" })[0];
    fireEvent.click(add);
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("unbound.v1")!);
      expect(saved.plannedMoments[Object.keys(saved.plannedMoments)[0]].length).toBe(1);
      expect(saved.tasks).toHaveLength(3);
    });
    expect(screen.getByText("Chosen for today")).toBeTruthy();
  });
  it("helps a person discover and privately save their own beautiful moment", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Help me find mine" }));
    fireEvent.click(screen.getByRole("button", { name: /Replay a moment/ }));
    fireEvent.change(screen.getByLabelText("My trace"), { target: { value: "I felt calm when the room became quiet." } });
    fireEvent.change(screen.getByLabelText("Name my beautiful moment"), { target: { value: "A quiet room" } });
    fireEvent.click(screen.getByRole("button", { name: "Save as my trace" }));
    expect(await screen.findByRole("heading", { name: "A quiet room" })).toBeTruthy();
    await waitFor(() => expect(JSON.parse(localStorage.getItem("unbound.v1")!).beautifulMoments[0]).toMatchObject({ title: "A quiet room", category: "personal", favorite: true }));
  });
  it("stores an optional twelve-week direction and weekly review", async () => {
    await open(); go(/Goals/);
    fireEvent.click(screen.getByRole("button", { name: "Open 12 weeks" }));
    fireEvent.change(screen.getByLabelText("My direction"), { target: { value: "Finish the semester calmly" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.change(screen.getByLabelText("I will know it has moved when…"), { target: { value: "I can study without carrying it all day" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.change(screen.getByLabelText("My weekly action"), { target: { value: "Choose three study blocks" } });
    fireEvent.click(screen.getByRole("button", { name: "Build my 12 weeks" }));
    fireEvent.click(screen.getByRole("button", { name: "Complete week 1 review" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("unbound.v1")!).twelveWeek).toMatchObject({ outcome: "Finish the semester calmly", weeks: { 1: { reviewed: true } } }));
  });
  it("offers useful monthly and yearly planner views", async () => {
    await open(); go(/Planner/);
    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    expect(screen.getByRole("heading", { name: new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" }) })).toBeTruthy();
    expect(screen.getByText("Choose a day to open its detailed week.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Year" }));
    expect(screen.getByRole("heading", { name: String(new Date().getFullYear()) })).toBeTruthy();
    expect(screen.getByText("The year as a rhythm, not a list to fill.")).toBeTruthy();
  });
  it("adds a reusable library item to today", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Choose from My Library" }));
    fireEvent.click(screen.getByRole("option", { name: /Fresh vegetables/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add today" }));
    expect(screen.getByText("Fresh vegetables")).toBeTruthy();
  });
  it("confirms when a Library item is added to Today", async () => {
    await open(); go(/My Library/);
    fireEvent.click(screen.getAllByRole("button", { name: "Add shopping today" })[0]);
    expect(screen.getByRole("button", { name: "Added for today" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open Today" })).toBeTruthy();
  });
  it("guides a person toward a useful list without prescribing its contents", async () => {
    await open(); go(/My Library/);
    fireEvent.click(screen.getByRole("button", { name: "I do not know which list I need" }));
    fireEvent.click(screen.getByRole("button", { name: /Something keeps returning to my mind/ }));
    expect(screen.getByRole("heading", { name: "Lists" })).toBeTruthy();
    expect(screen.getByLabelText("Name")).toBeTruthy();
  });
  it("turns a saved meal into a plan and a deduplicated shopping list", async () => {
    await open(); go(/My Library/);
    fireEvent.click(screen.getByRole("button", { name: "Meals" }));
    fireEvent.click(screen.getByRole("button", { name: "Plan a meal" }));
    fireEvent.change(screen.getByLabelText("Ingredients at home"), { target: { value: "rice, onion" } });
    fireEvent.click(screen.getByRole("button", { name: "Show what fits" }));
    fireEvent.click(screen.getByRole("button", { name: "Plan and add shopping" }));
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("unbound.v1")!);
      expect(saved.tasks.some((task: { title: string; tags?: string[] }) => task.title === "Vegetable risotto" && task.tags?.includes("meal"))).toBe(true);
      const shopping = saved.library.find((item: { title: string }) => item.title === "Shopping for planned meals");
      expect(shopping.details).toContain("zucchini");
      expect(shopping.details).not.toContain("rice");
    });
  }, 15000);
  it("lets a person save a meal with only its name", async () => {
    await open(); go(/My Library/);
    fireEvent.click(screen.getByRole("button", { name: "Meals" }));
    fireEvent.click(screen.getByRole("button", { name: "Add item" }));
    fireEvent.change(screen.getByLabelText("What do you call this meal?"), { target: { value: "Sunday soup" } });
    fireEvent.click(screen.getByRole("button", { name: "Save item" }));
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("unbound.v1")!);
      expect(saved.library.find((item: { title: string }) => item.title === "Sunday soup")).toMatchObject({ group: "My meals", details: "", meal: { minutes: 30, servings: 2, energy: "steady", ingredients: [], season: "all" } });
    });
  });
  it("offers a city fallback when browser location is unavailable", async () => {
    await open();
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: undefined });
    fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
    expect(screen.getByRole("heading", { name: "Location unavailable? Enter a city." })).toBeTruthy();
    expect(screen.getByLabelText("City for weather")).toBeTruthy();
  });
  it("captures an inbox item and plans it for today", async () => {
    await open(); go(/Inbox/);
    fireEvent.change(screen.getByLabelText("Inbox item"), { target: { value: "Reply to faculty" } });
    fireEvent.click(screen.getByRole("button", { name: "Capture" }));
    fireEvent.click(screen.getAllByRole("button", { name: /Plan for today/ })[0]);
    go(/^Today/);
    expect(screen.getByText("Reply to faculty")).toBeTruthy();
  });
  it("offers one-way Google and Apple calendar handoff from Inbox", async () => {
    await open(); go(/Inbox/);
    expect(screen.getByRole("link", { name: /Google/ }).getAttribute("href")).toContain("calendar.google.com");
    expect(screen.getByRole("button", { name: /Apple/ })).toBeTruthy();
  });
  it("stores routine and weekly check-in state", async () => {
    await open();
    fireEvent.click(screen.getByLabelText("Water and medication"));
    go(/Goals/);
    fireEvent.change(screen.getByLabelText("What moved forward?"), { target: { value: "Protected one morning" } });
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("unbound.v1")!);
      expect(Object.values(saved.routineDone).flat()).toContain("r1");
      expect(Object.values(saved.weeklyCheckins)[0]).toMatchObject({ win: "Protected one morning" });
    });
  });
  it("recommends study recovery, adds it to today, and records the after check-in", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Energy 3 / 5" }));
    fireEvent.click(screen.getByRole("button", { name: "Focus 3 / 5" }));
    fireEvent.click(screen.getByRole("button", { name: "Mental work or study" }));
    fireEvent.click(screen.getByRole("button", { name: /Recovery after study/ }));
    fireEvent.click(screen.getByRole("button", { name: "Suggest my next step" }));
    expect(screen.getByRole("heading", { name: "Active recovery" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add to today" }));
    fireEvent.click(screen.getByRole("button", { name: /Check in afterward/ }));
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    fireEvent.click(screen.getByRole("button", { name: "Save comparison" }));
    expect(await screen.findByText("The numbers are the same, but you feel more rested.")).toBeTruthy();
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("unbound.v1")!);
      expect(saved.recoveryCheckins).toHaveLength(2);
      expect(saved.tasks.some((task: { tags?: string[] }) => task.tags?.includes("recovery"))).toBe(true);
    });
  });
  it("offers optional weekly, monthly, quarterly, and yearly reports", async () => {
    await open(); go(/Goals/);
    expect(screen.getByRole("heading", { name: "A look back. Without judgment." })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download report" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Quarter" }));
    expect(screen.getByRole("heading", { name: "The wider view of your quarter." })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Year" })).toBeTruthy();
  });
  it("imports private routines, bag checklists, and grouped lists", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Your space and data" }));
    const file = new File([JSON.stringify({ routines: [{ id: "private-morning", title: "Private morning step", period: "morning" }], library: [{ id: "private-bag", category: "bags", title: "My private bag", group: "Travel", details: "One, Two" }, { id: "private-list", category: "lists", title: "My private list", group: "Later", details: "Three, Four" }] })], "private-lists.json", { type: "application/json" });
    fireEvent.change(screen.getByLabelText("Private lists file"), { target: { files: [file] } });
    expect(await screen.findByText("Private routines, lists, and tasks were imported. They stay in this browser only.")).toBeTruthy();
    expect(screen.getByLabelText("Private morning step")).toBeTruthy();
    go(/My Library/);
    fireEvent.click(screen.getByRole("button", { name: "Bag checklists" }));
    expect(screen.getByRole("heading", { name: "My private bag" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Lists" }));
    expect(screen.getByRole("heading", { name: "My private list" })).toBeTruthy();
  });
  it("keeps a private beauty atlas as its own library category", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Your space and data" }));
    const file = new File([JSON.stringify({ routines: [], library: [{ id: "private-beauty", category: "beauty", title: "Evening care", group: "Ritual", details: "Cleanse, Face cream" }] })], "private-beauty.json", { type: "application/json" });
    fireEvent.change(screen.getByLabelText("Private lists file"), { target: { files: [file] } });
    await screen.findByText("Private routines, lists, and tasks were imported. They stay in this browser only.");
    go(/My Library/);
    fireEvent.click(screen.getByRole("button", { name: "Care & appearance" }));
    expect(screen.getByRole("heading", { name: "Evening care" })).toBeTruthy();
    expect(screen.getByLabelText("Cleanse")).toBeTruthy();
  });
});
