"use client";

import { CalendarBlank, CheckCircle, Clock, DownloadSimple, Path } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { addDays, localDate, weekStart, type State } from "@/lib/model";
import { useLanguage } from "./LanguageContext";
import { seasonalContext } from "@/lib/season";

type Period = "week" | "month" | "quarter" | "year";

function rangeFor(period: Period, now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  if (period === "week") {
    const start = localDate(weekStart(now));
    return { start, end: addDays(start, 6) };
  }
  if (period === "month") return { start: localDate(new Date(year, month, 1)), end: localDate(new Date(year, month + 1, 0)) };
  if (period === "quarter") {
    const firstMonth = Math.floor(month / 3) * 3;
    return { start: localDate(new Date(year, firstMonth, 1)), end: localDate(new Date(year, firstMonth + 3, 0)) };
  }
  return { start: localDate(new Date(year, 0, 1)), end: localDate(new Date(year, 11, 31)) };
}

const inRange = (date: string, start: string, end: string) => !!date && date >= start && date <= end;

export default function ReportsPanel({ state }: { state: State }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const seasonal = seasonalContext(new Date(), locale);
  const [period, setPeriod] = useState<Period>("week");
  const periods: Array<{ id: Period; hr: string; en: string }> = [
    { id: "week", hr: "Tjedan", en: "Week" },
    { id: "month", hr: "Mjesec", en: "Month" },
    { id: "quarter", hr: "Kvartal", en: "Quarter" },
    { id: "year", hr: "Godina", en: "Year" },
  ];
  const range = useMemo(() => rangeFor(period), [period]);
  const completed = state.tasks.filter((task) => inRange(task.completedAt?.slice(0, 10) || "", range.start, range.end));
  const planned = state.tasks.filter((task) => inRange(task.date || task.deadline, range.start, range.end));
  const minutes = completed.reduce((sum, task) => sum + task.duration, 0);
  const rituals = Object.entries(state.routineDone).filter(([date]) => inRange(date, range.start, range.end)).reduce((sum, [, ids]) => sum + ids.length, 0);
  const activeGoals = state.projects.filter((goal) => goal.status === "active");
  const averageProgress = state.projects.length ? Math.round(state.projects.reduce((sum, goal) => sum + goal.progress, 0) / state.projects.length) : 0;
  const reviews = Object.entries(state.weeklyCheckins).filter(([date, checkin]) => inRange(date, range.start, range.end) && Object.values(checkin).some(Boolean));
  const dateFormat = new Intl.DateTimeFormat(hr ? "hr-HR" : "en-GB", { day: "numeric", month: "short", year: range.start.slice(0, 4) !== range.end.slice(0, 4) ? "numeric" : undefined });
  const parseDate = (date: string) => new Date(`${date}T12:00:00`);
  const rangeLabel = `${dateFormat.format(parseDate(range.start))} – ${dateFormat.format(parseDate(range.end))}`;
  const periodName = periods.find((item) => item.id === period)!;
  const title = hr
    ? ({ week: "Tvoj tjedan, bez žurbe.", month: "Tvoj mjesec, sabran na jednom mjestu.", quarter: "Šira slika tvog kvartala.", year: "Godina kojoj se možeš vratiti." } as const)[period]
    : ({ week: "Your week, without the rush.", month: "Your month, gently gathered.", quarter: "The wider view of your quarter.", year: "A year you can return to." } as const)[period];
  const insight = completed.length
    ? hr
      ? `Završila si ${completed.length} ${completed.length === 1 ? "stvar" : "stvari"}. To nije mjera tvoje vrijednosti. To je samo trag vremena koje si svjesno usmjerila.`
      : `You completed ${completed.length} ${completed.length === 1 ? "thing" : "things"}. It is not a measure of your worth. It is only a trace of the time you chose to direct.`
    : hr
      ? "Ovo je mirnije razdoblje ili podaci tek počinju nastajati. I praznina nešto govori: možda je bilo vrijeme za odmor, prilagodbu ili nešto što se ne bilježi."
      : "This was a quieter period, or the story is only beginning to form. Empty space says something too: perhaps it held rest, adjustment, or work that was never recorded.";

  const download = () => {
    const lines = [
      `# UNBOUND · ${hr ? periodName.hr : periodName.en}`,
      rangeLabel,
      `${seasonal.month} · ${seasonal.seasonName}`,
      "",
      `## ${title}`,
      insight,
      "",
      `- ${hr ? "Planirano" : "Planned"}: ${planned.length}`,
      `- ${hr ? "Završeno" : "Completed"}: ${completed.length}`,
      `- ${hr ? "Vrijeme u završenim zadacima" : "Time in completed tasks"}: ${Math.floor(minutes / 60)}h ${minutes % 60}m`,
      `- ${hr ? "Trenuci rituala" : "Routine moments"}: ${rituals}`,
      `- ${hr ? "Aktivni ciljevi" : "Active goals"}: ${activeGoals.length}`,
      `- ${hr ? "Trenutačni prosječni pomak ciljeva" : "Current average goal movement"}: ${averageProgress}%`,
      `- ${hr ? "Zapisani tjedni osvrti" : "Weekly reflections written"}: ${reviews.length}`,
      "",
      hr ? "Ovo nije ocjena. To je samo pogled unatrag, kada ga želiš." : "This is not a score. It is simply a look back, when you want one.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `unbound-${period}-${range.end}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const metrics = [
    { icon: CheckCircle, value: completed.length, label: hr ? "završeno" : "completed" },
    { icon: Clock, value: minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`, label: hr ? "svjesno usmjereno" : "intentionally directed" },
    { icon: Path, value: rituals, label: hr ? "trenutaka rituala" : "routine moments" },
    { icon: CalendarBlank, value: `${averageProgress}%`, label: hr ? "trenutačni pomak ciljeva" : "current goal movement" },
  ];

  return <section className="reportsPanel" aria-labelledby="reports-heading">
    <div className="reportsHead">
      <div>
        <div className="sectionLabel">{hr ? "OSVRTI · KADA IH POŽELIŠ" : "REPORTS · WHEN YOU WANT THEM"}</div>
        <h2 id="reports-heading" aria-label={hr ? "Pogled unatrag. Bez prosuđivanja." : "A look back. Without judgment."}>{hr ? <>Pogled unatrag.<br />Bez prosuđivanja.</> : <>A look back.<br />Without judgment.</>}</h2>
        <p>{hr ? "Ništa se ne generira automatski. Odaberi razdoblje kada želiš primijetiti svoj ritam." : "Nothing is generated automatically. Choose a period when you want to notice your rhythm."}</p>
      </div>
      <button className="reportDownload" onClick={download}><DownloadSimple /> {hr ? "Preuzmi izvještaj" : "Download report"}</button>
    </div>
    <div className="reportPeriodSwitch" aria-label={hr ? "Razdoblje izvještaja" : "Report period"}>
      {periods.map((item) => <button key={item.id} aria-pressed={period === item.id} onClick={() => setPeriod(item.id)}>{hr ? item.hr : item.en}</button>)}
    </div>
    <div className="reportStory">
      <div className="reportStoryIntro"><span>{rangeLabel}<br />{seasonal.month} · {seasonal.seasonName}</span><h3>{title}</h3></div>
      <div className="reportMetrics">{metrics.map(({ icon: Icon, value, label }) => <div className="reportMetric" key={label}><Icon /><strong>{value}</strong><span>{label}</span></div>)}</div>
      <div className="reportInsight"><div className="sectionLabel">{hr ? "ONO ŠTO SE VIDI" : "WHAT COMES INTO VIEW"}</div><p>{insight}</p><small>{hr ? `${planned.length} planirano · ${activeGoals.length} aktivnih ciljeva · ${reviews.length} zapisanih osvrta` : `${planned.length} planned · ${activeGoals.length} active goals · ${reviews.length} reflections written`}</small></div>
    </div>
  </section>;
}
