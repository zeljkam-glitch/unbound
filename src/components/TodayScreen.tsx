import { newId } from "@/lib/id";
import PlanOverview from "./PlanOverview";
import { Check, Plus, X, ArrowUpRight } from "@phosphor-icons/react";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { deadlineState, toggleTask, type State, type Task } from "@/lib/model";
import { Field, Empty } from "./Primitives";
import type { Tab, Update } from "@/lib/ui-types";

export default function TodayScreen({
  state,
  today,
  open,
  suggestion,
  taskTitle,
  setTaskTitle,
  deadline,
  setDeadline,
  effort,
  setEffort,
  showTask,
  setShowTask,
  update,
  setTab,
}: {
  state: State;
  today: string;
  open: Task[];
  suggestion: Task | null;
  taskTitle: string;
  setTaskTitle: Dispatch<SetStateAction<string>>;
  deadline: string;
  setDeadline: Dispatch<SetStateAction<string>>;
  effort: "light" | "deep";
  setEffort: Dispatch<SetStateAction<"light" | "deep">>;
  showTask: boolean;
  setShowTask: Dispatch<SetStateAction<boolean>>;
  update: Update;
  setTab: Dispatch<SetStateAction<Tab>>;
}) {
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const visibleTasks = state.tasks.filter(
    (t) =>
      filter === "all" ||
      (filter === "done" ? !!t.completedAt : !t.completedAt),
  );
  return (
    <>
      <PlanOverview state={state} />
      <section className="tasksSection">
        <div className="sectionHead">
          <div>
            <div className="sectionLabel">02 / A FLEXIBLE PLAN</div>
            <h2>Your flexible plan.</h2>
          </div>
          <button
            onClick={() => setShowTask(!showTask)}
            aria-expanded={showTask}
          >
            <Plus size={18} aria-hidden="true" /> Add a task
          </button>
        </div>
        {showTask && (
          <form
            className="card formGrid"
            onSubmit={(e) => {
              e.preventDefault();
              if (!taskTitle.trim()) return;
              update((s) => ({
                ...s,
                tasks: [
                  ...s.tasks,
                  {
                    id: newId(),
                    title: taskTitle.trim(),
                    deadline,
                    effort,
                    completedAt: null,
                  },
                ],
              }));
              setTaskTitle("");
              setDeadline("");
              setShowTask(false);
            }}
          >
            <Field label="What needs doing?">
              <input
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                autoFocus
              />
            </Field>
            <Field label="Real deadline (optional)">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </Field>
            <Field label="Effort">
              <select
                value={effort}
                onChange={(e) => setEffort(e.target.value as "light" | "deep")}
              >
                <option value="light">Light</option>
                <option value="deep">Deep focus</option>
              </select>
            </Field>
            <button className="primary">Add task</button>
          </form>
        )}
        <div className="segmented" aria-label="Filter tasks">
          {(
            [
              ["all", "All"],
              ["open", "Open"],
              ["done", "Done"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
              <span>
                {value === "all"
                  ? state.tasks.length
                  : value === "open"
                    ? open.length
                    : state.tasks.length - open.length}
              </span>
            </button>
          ))}
        </div>
        <div className="taskList">
          {!state.tasks.length && (
            <Empty>No commitments yet. Add only what you want to carry.</Empty>
          )}
          {!!state.tasks.length && !visibleTasks.length && (
            <Empty>
              {filter === "done"
                ? "No completed tasks yet. There’s no rush."
                : "Nothing open here. Leave a little space."}
            </Empty>
          )}
          {visibleTasks.map((t) => (
            <div className={`task ${t.completedAt ? "done" : ""}`} key={t.id}>
              <button
                className="check"
                aria-label={`${t.completedAt ? "Reopen" : "Complete"} ${t.title}`}
                aria-pressed={!!t.completedAt}
                onClick={() =>
                  update((s) => ({
                    ...s,
                    tasks: s.tasks.map((x) =>
                      x.id === t.id ? toggleTask(x) : x,
                    ),
                  }))
                }
              >
                {t.completedAt ? <Check size={22} /> : null}
              </button>
              <div className="taskText">
                <strong>{t.title}</strong>
                <span>
                  {t.effort === "light" ? "Light lift" : "Deep focus"}
                </span>
              </div>
              {t.deadline && (
                <span
                  className={`deadline ${deadlineState(t.deadline) === "Overdue" ? "overdue" : ""}`}
                >
                  {deadlineState(t.deadline)} · {t.deadline}
                </span>
              )}
              <button
                className="delete"
                aria-label={`Delete task ${t.title}`}
                onClick={() =>
                  update((s) => ({
                    ...s,
                    tasks: s.tasks.filter((x) => x.id !== t.id),
                  }))
                }
              >
                <X size={19} />
              </button>
            </div>
          ))}
        </div>
        <p className="quiet">
          {open.length} open {open.length === 1 ? "commitment" : "commitments"}{" "}
          · No need to fill the day.
        </p>
      </section>
      <div className="todayGrid">
        <section className="anchor card">
          <div className="sectionLabel">
            01 / YOUR DAILY ANCHOR <span>OPTIONAL</span>
          </div>
          <h2>What deserves your attention?</h2>
          <p>One thing that would make today feel meaningful.</p>
          <Field label="Today's anchor">
            <input
              placeholder="Today, I want to make space for…"
              value={state.anchors[today] || ""}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  anchors: { ...s.anchors, [today]: e.target.value },
                }))
              }
            />
          </Field>
          <span className="quiet">
            An intention, not another obligation. Saved as you type.
          </span>
        </section>
        <section className="energy card">
          <div className="sectionLabel">
            YOUR RHYTHM <span>OPTIONAL</span>
          </div>
          <h2>How’s your energy?</h2>
          <div className="energyOptions">
            {[
              ["low", "Low", "Keep it light"],
              ["steady", "Steady", "A little momentum"],
              ["high", "High", "Room to go deeper"],
            ].map(([v, label, sub]) => (
              <button
                key={v}
                aria-pressed={state.energies[today] === v}
                onClick={() =>
                  update((s) => ({
                    ...s,
                    energies: {
                      ...s.energies,
                      [today]: s.energies[today] === v ? "" : v,
                    },
                  }))
                }
              >
                <strong>{label}</strong>
                <span>{sub}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
      <section className="suggestion">
        <span className="suggestSymbol" aria-hidden="true">
          <ArrowUpRight size={24} />
        </span>
        <div>
          <div className="sectionLabel">A POSSIBLE NEXT STEP</div>
          <h3>{suggestion ? suggestion.title : "Leave a little space."}</h3>
          <p>
            {suggestion
              ? suggestion.deadline && suggestion.deadline <= today
                ? "A real deadline is approaching. This gets first attention."
                : state.energies[today] === "low"
                  ? "A lighter step, matched to your energy."
                  : "The earliest deadline first, with flexible work after. You choose."
              : "Your commitments are clear. Rest, explore, or capture a thought."}
          </p>
        </div>
        <button
          onClick={() => {
            window.location.hash = "mindspace";
            setTab("Mindspace");
          }}
        >
          Open Mindspace <ArrowUpRight size={18} />
        </button>
      </section>
    </>
  );
}
