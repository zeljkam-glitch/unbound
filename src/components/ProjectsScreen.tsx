import { Plus } from "@phosphor-icons/react";
import type { Dispatch, SetStateAction } from "react";
import {
  deadlineState,
  pauseProject,
  type State,
  type Project,
} from "@/lib/model";
import { Field, Empty } from "./Primitives";
import ProjectForm from "./ProjectForm";
import type { Update } from "@/lib/ui-types";

export default function ProjectsScreen({
  state,
  active,
  showProject,
  setShowProject,
  editProject,
  setEditProject,
  update,
}: {
  state: State;
  active: Project[];
  showProject: boolean;
  setShowProject: Dispatch<SetStateAction<boolean>>;
  editProject: Project | null;
  setEditProject: Dispatch<SetStateAction<Project | null>>;
  update: Update;
}) {
  return (
    <>
      <div className="sectionHead">
        <p>{active.length} active · Pausing is a valid choice.</p>
        <button
          className="primary"
          onClick={() => {
            setEditProject(null);
            setShowProject(!showProject);
          }}
        >
          <Plus size={18} aria-hidden="true" /> New project
        </button>
      </div>
      {showProject && (
        <ProjectForm
          key={editProject?.id || "new"}
          project={editProject}
          onCancel={() => setShowProject(false)}
          onSave={(p) => {
            update((s) => ({
              ...s,
              projects: editProject
                ? s.projects.map((x) => (x.id === p.id ? p : x))
                : [...s.projects, p],
            }));
            setShowProject(false);
          }}
        />
      )}
      {!state.projects.length && (
        <Empty>No projects yet. Start with an outcome you care about.</Empty>
      )}
      <div className="projectGrid">
        {state.projects.map((p) => (
          <article className="card project" key={p.id}>
            <div className="sectionLabel">
              <span className={`status ${p.status}`}>{p.status}</span>
              <span>
                {p.deadline
                  ? `${deadlineState(p.deadline)} · ${p.deadline}`
                  : "NO FIXED DEADLINE"}
              </span>
            </div>
            <h2>{p.name}</h2>
            <p>{p.outcome}</p>
            <div className="next">
              <div className="sectionLabel">NEXT ACTION</div>
              <p>
                {p.nextAction || "Choose a small next step when you’re ready."}
              </p>
            </div>
            <Field label="Save My Place">
              <textarea
                rows={3}
                placeholder="Where did you stop? What will help you return?"
                value={p.place}
                onChange={(e) =>
                  update((s) => ({
                    ...s,
                    projects: s.projects.map((x) =>
                      x.id === p.id ? { ...x, place: e.target.value } : x,
                    ),
                  }))
                }
              />
            </Field>
            <span className="quiet">
              Saved as you type. Your place stays here when paused.
            </span>
            <div className="actions">
              <button
                onClick={() => {
                  setEditProject(p);
                  setShowProject(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Edit
              </button>
              {p.status !== "completed" && (
                <button
                  onClick={() =>
                    update((s) => ({
                      ...s,
                      projects: s.projects.map((x) =>
                        x.id === p.id ? pauseProject(x) : x,
                      ),
                    }))
                  }
                >
                  {p.status === "paused" ? "Resume" : "Pause"}
                </button>
              )}
              <button
                onClick={() =>
                  update((s) => ({
                    ...s,
                    projects: s.projects.map((x) =>
                      x.id === p.id
                        ? {
                            ...x,
                            status:
                              p.status === "completed" ? "active" : "completed",
                          }
                        : x,
                    ),
                  }))
                }
              >
                {p.status === "completed" ? "Reopen" : "Complete"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
