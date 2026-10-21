import type { State } from "./model";
export type Tab = "Today" | "Mindspace" | "Projects" | "Reflect";
export type Update = (fn: (state: State) => State) => void;
