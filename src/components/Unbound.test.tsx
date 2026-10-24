// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Unbound from "./Unbound";

const preventNavigation = (event: MouseEvent) => { if ((event.target as Element).closest("a")) event.preventDefault(); };
beforeEach(() => {
  document.addEventListener("click", preventNavigation);
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  Object.defineProperty(window, "scrollTo", { writable: true, value: vi.fn() });
});
afterEach(() => { cleanup(); document.removeEventListener("click", preventNavigation); vi.restoreAllMocks(); });
async function open() { render(<Unbound />); await screen.findByRole("heading", { name: "Make room for what matters." }); }
const go = (name: RegExp) => fireEvent.click(screen.getAllByRole("link", { name })[0]);

describe("UNBOUND Life OS interactions", () => {
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
  it("adds a reusable library item to today", async () => {
    await open();
    fireEvent.change(screen.getByLabelText("Choose from My Library"), { target: { value: "l1" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to today" }));
    expect(screen.getByText("Oat milk")).toBeTruthy();
  });
  it("captures an inbox item and plans it for today", async () => {
    await open(); go(/Inbox/);
    fireEvent.change(screen.getByLabelText("Inbox item"), { target: { value: "Reply to faculty" } });
    fireEvent.click(screen.getByRole("button", { name: "Capture" }));
    fireEvent.click(screen.getAllByRole("button", { name: /Plan for today/ })[0]);
    go(/^Today/);
    expect(screen.getByText("Reply to faculty")).toBeTruthy();
  });
  it("stores routine and weekly check-in state", async () => {
    await open();
    fireEvent.click(screen.getByLabelText("Water + medication"));
    go(/Goals/);
    fireEvent.change(screen.getByLabelText("What moved forward?"), { target: { value: "Protected one morning" } });
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("unbound.v1")!);
      expect(Object.values(saved.routineDone).flat()).toContain("r1");
      expect(Object.values(saved.weeklyCheckins)[0]).toMatchObject({ win: "Protected one morning" });
    });
  });
});
