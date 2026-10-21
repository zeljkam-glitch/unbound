import type { Project } from "@/lib/model";
import { Field } from "./Primitives";
export default function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project: Project | null;
  onSave: (p: Project) => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="card formGrid"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSave({
          id: project?.id || crypto.randomUUID(),
          name: String(f.get("name")).trim(),
          outcome: String(f.get("outcome")).trim(),
          deadline: String(f.get("deadline")),
          nextAction: String(f.get("nextAction")).trim(),
          status: project?.status || "active",
          place: project?.place || "",
        });
      }}
    >
      <Field label="Project name">
        <input
          name="name"
          required
          pattern=".*\S.*"
          defaultValue={project?.name}
          autoFocus
        />
      </Field>
      <Field label="Desired outcome">
        <input
          name="outcome"
          required
          pattern=".*\S.*"
          defaultValue={project?.outcome}
        />
      </Field>
      <Field label="Real deadline (optional)">
        <input name="deadline" type="date" defaultValue={project?.deadline} />
      </Field>
      <Field label="Next action">
        <input name="nextAction" defaultValue={project?.nextAction} />
      </Field>
      <div className="actions">
        <button className="primary">Save project</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
