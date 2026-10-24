import type { State } from "./model";
export type Tab = "Today" | "Planner" | "Library" | "Inbox" | "Goals";
export type Update = (fn: (state: State) => State) => void;
