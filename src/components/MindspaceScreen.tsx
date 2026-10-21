import type { Dispatch, SetStateAction } from "react";
import type { State } from "@/lib/model";
import { Field, Empty } from "./Primitives";
import type { Update } from "@/lib/ui-types";

export default function MindspaceScreen({
  state,
  thought,
  setThought,
  editing,
  setEditing,
  listening,
  saveThought,
  dictate,
  update,
}: {
  state: State;
  thought: string;
  setThought: Dispatch<SetStateAction<string>>;
  editing: string | null;
  setEditing: Dispatch<SetStateAction<string | null>>;
  listening: boolean;
  saveThought: (e: React.FormEvent) => void;
  dictate: () => void;
  update: Update;
}) {
  return (
    <>
      <section className="card">
        <div className="sectionLabel">CAPTURE FIRST. DECIDE LATER.</div>
        <form onSubmit={saveThought}>
          <Field
            label={
              editing
                ? "Edit your thought"
                : "What’s passing through your mind?"
            }
          >
            <textarea
              rows={5}
              placeholder="An idea, a question, a possibility…"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
            />
          </Field>
          <div className="actions">
            <button className="primary" disabled={!thought.trim()}>
              {editing ? "Save changes" : "Save thought"}
            </button>
            <button type="button" aria-pressed={listening} onClick={dictate}>
              {listening ? "Stop listening" : "Use voice"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setThought("");
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
          <p className="quiet">
            Thoughts stay here. They never automatically become tasks. Voice
            support depends on your browser; its speech service may process
            audio remotely.
          </p>
        </form>
      </section>
      <div className="sectionHead">
        <h2>A little room for everything.</h2>
        <span>{state.thoughts.length} thoughts</span>
      </div>
      {!state.thoughts.length && (
        <Empty>
          Your mindspace is open. Capture something without committing to it.
        </Empty>
      )}
      <div className="thoughtGrid">
        {state.thoughts.map((t) => (
          <article key={t.id} className="card thought">
            <time dateTime={t.createdAt}>
              {new Date(t.createdAt).toLocaleString()}
            </time>
            <p>{t.text}</p>
            <div className="actions">
              <button
                onClick={() => {
                  setEditing(t.id);
                  setThought(t.text);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  update((s) => ({
                    ...s,
                    thoughts: s.thoughts.filter((x) => x.id !== t.id),
                  }));
                  if (editing === t.id) {
                    setEditing(null);
                    setThought("");
                  }
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
