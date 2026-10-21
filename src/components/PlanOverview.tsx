import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import { Check, Lightning, Sparkle, Stack } from "@phosphor-icons/react";
import { localDate, weekStart, type State } from "@/lib/model";
export default function PlanOverview({ state }: { state: State }) {
  const done = state.tasks.filter((t) => t.completedAt).length;
  const total = state.tasks.length;
  const percentage = total ? Math.round((done / total) * 100) : 0;
  const start = weekStart();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  return (
    <section className="planOverview" aria-label="Your plan at a glance">
      <div className="weekStrip" aria-label="This week">
        {days.map((d) => {
          const date = localDate(d);
          const isToday = date === localDate();
          const count = state.tasks.filter(
            (t) => t.completedAt && localDate(new Date(t.completedAt)) === date,
          ).length;
          return (
            <div
              className={`weekDay ${isToday ? "isToday" : ""} ${count ? "hasActivity" : ""}`}
              key={date}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}, ${count} completed tasks`}
            >
              <span>{d.toLocaleDateString("en-GB", { weekday: "short" })}</span>
              <strong>{d.getDate()}</strong>
            </div>
          );
        })}
      </div>
      <div className="overviewBody">
        <div
          className="planRing"
          role="img"
          aria-label={`${done} of ${total} tasks completed, ${percentage} percent`}
        >
          <CircularProgressbarWithChildren
            value={percentage}
            strokeWidth={4}
            styles={buildStyles({
              pathColor: "var(--teal)",
              trailColor: "var(--track)",
              strokeLinecap: "round",
              pathTransitionDuration: 0.4,
            })}
          >
            <div className="ringBadges" aria-hidden="true">
              <Lightning weight="duotone" />
              <Stack weight="duotone" />
              <Sparkle weight="duotone" />
            </div>
            <strong>
              {done}
              <span> / {total}</span>
            </strong>
            <p>{total ? "tasks completed" : "An open day"}</p>
          </CircularProgressbarWithChildren>
        </div>
        <div className="overviewCopy">
          <span className="sectionLabel">YOUR PLAN, AT A GLANCE</span>
          <h2>
            A little progress.
            <br />A little more space.
          </h2>
          <p>
            {total
              ? `${total - done} open commitments. Take them one at a time.`
              : "Start with something that matters to you."}
          </p>
          <span className="softPill">
            <Check size={16} aria-hidden="true" />
            No streaks. Your own rhythm.
          </span>
        </div>
      </div>
    </section>
  );
}
