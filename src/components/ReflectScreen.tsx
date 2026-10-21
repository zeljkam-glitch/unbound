import type { State, Task } from "@/lib/model";
import { Field, Empty } from "./Primitives";
import type { Update } from "@/lib/ui-types";

export default function ReflectScreen({
  state,
  week,
  completed,
  open,
  update,
}: {
  state: State;
  week: string;
  completed: Task[];
  open: Task[];
  update: Update;
}) {
  return (
    <>
      <div className="reflectGrid">
        <section className="card">
          <div className="sectionLabel">THIS WEEK’S MOVEMENT</div>
          <div className="bigNumber">
            {completed.length}
            <span> completed {completed.length === 1 ? "task" : "tasks"}</span>
          </div>
          {completed.length ? (
            completed.map((t) => (
              <p key={t.id} className="reflectionRow">
                ✓ {t.title}
              </p>
            ))
          ) : (
            <Empty>
              Nothing completed yet this week. This is a record, not a score.
            </Empty>
          )}
        </section>
        <section className="card">
          <div className="sectionLabel">STILL ON YOUR PLATE</div>
          <h2>{open.length} open commitments</h2>
          {open.length ? (
            open.map((t) => (
              <p key={t.id} className="reflectionRow">
                {t.title}
                <span>{t.deadline || "Flexible"}</span>
              </p>
            ))
          ) : (
            <Empty>No outstanding tasks. Keep some room for yourself.</Empty>
          )}
          {state.projects
            .filter((p) => p.status !== "completed")
            .map((p) => (
              <p className="reflectionRow" key={p.id}>
                {p.name}
                <span>
                  Project · {p.status}
                  {p.deadline ? ` · ${p.deadline}` : ""}
                </span>
              </p>
            ))}
        </section>
      </div>
      <section className="card checkin">
        <div className="sectionLabel">
          THE PART NUMBERS DON’T TELL <span>OPTIONAL</span>
        </div>
        <h2>How did your week feel?</h2>
        <p>You can leave any of these unanswered.</p>
        <div className="formGrid">
          {(["autonomy", "satisfaction", "pressure"] as const).map((k) => (
            <Field
              key={k}
              label={
                {
                  autonomy: "How much choice did you feel?",
                  satisfaction: "How satisfied do you feel?",
                  pressure: "How much pressure did you feel?",
                }[k]
              }
            >
              <select
                value={state.reflections[week]?.[k] || ""}
                onChange={(e) =>
                  update((s) => ({
                    ...s,
                    reflections: {
                      ...s.reflections,
                      [week]: {
                        ...(s.reflections[week] || {
                          autonomy: "",
                          satisfaction: "",
                          pressure: "",
                        }),
                        [k]: e.target.value,
                      },
                    },
                  }))
                }
              >
                <option value="">Skip for now</option>
                <option>Low</option>
                <option>Some</option>
                <option>A lot</option>
              </select>
            </Field>
          ))}
        </div>
        <p className="quiet">Saved for this week. No streaks. No judgement.</p>
      </section>
    </>
  );
}
