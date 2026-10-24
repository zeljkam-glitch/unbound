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
  it("stores an optional twelve-week direction and weekly review", async () => {
    await open(); go(/Planner/);
    fireEvent.click(screen.getByRole("button", { name: "12 weeks" }));
    fireEvent.change(screen.getByLabelText("The outcome that matters"), { target: { value: "Finish the semester calmly" } });
    fireEvent.click(screen.getByRole("button", { name: "Complete week 1 review" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("unbound.v1")!).twelveWeek).toMatchObject({ outcome: "Finish the semester calmly", weeks: { 1: { reviewed: true } } }));
  });
  it("adds a reusable library item to today", async () => {
    await open();
    fireEvent.change(screen.getByLabelText("Choose from My Library"), { target: { value: "l1" } });
    fireEvent.click(screen.getByRole("button", { name: "Add today" }));
    expect(screen.getByText("Oat milk")).toBeTruthy();
  });
  it("confirms when a Library item is added to Today", async () => {
    await open(); go(/My Library/);
    fireEvent.click(screen.getAllByRole("button", { name: "Add today" })[0]);
    expect(screen.getByRole("button", { name: "Added for today" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open Today" })).toBeTruthy();
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
  it("offers optional weekly, monthly, quarterly, and yearly reports", async () => {
    await open(); go(/Goals/);
    expect(screen.getByRole("heading", { name: "A look back. Without judgment." })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download report" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Quarter" }));
    expect(screen.getByRole("heading", { name: "The wider view of your quarter." })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Year" })).toBeTruthy();
  });
});
