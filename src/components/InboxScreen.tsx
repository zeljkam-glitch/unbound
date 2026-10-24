import { newId } from "@/lib/id";
import { addDays, localDate, type State } from "@/lib/model";
import { AppleLogo, ArrowRight, Feather, GoogleLogo, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import { Empty } from "./Primitives";
import { useLanguage } from "./LanguageContext";

export default function InboxScreen({ state, update }: { state: State; update: Update }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const [text, setText] = useState("");
  const plan = (id: string, title: string) => update((s) => ({ ...s, inbox: s.inbox.filter((x) => x.id !== id), tasks: [...s.tasks, { id: newId(), title, date: localDate(), time: "", deadline: "", kind: "flexible", duration: 30, repeat: "none", area: "anywhere", effort: "light", completedAt: null }] }));
  const compactDate = (date: string) => date.replaceAll("-", "");
  const googleUrl = (title: string) => {
    const start = localDate();
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${compactDate(start)}/${compactDate(addDays(start, 1))}`;
  };
  const downloadCalendar = (title: string) => {
    const start = localDate();
    const escaped = title.replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll(";", "\\;").replaceAll("\n", "\\n");
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//UNBOUND//Planner//HR", "BEGIN:VEVENT", `UID:${newId()}@unbound`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`, `DTSTART;VALUE=DATE:${compactDate(start)}`, `DTEND;VALUE=DATE:${compactDate(addDays(start, 1))}`, `SUMMARY:${escaped}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "unbound-plan.ics"; anchor.click(); URL.revokeObjectURL(url);
  };
  return <>
    <section className="inboxCapture"><Feather size={34} weight="thin" /><div><div className="sectionLabel">{hr ? "ZAPIŠI BEZ OBAVEZE" : "WRITE IT DOWN, NO COMMITMENT"}</div><h2>{hr ? "Makni to iz glave." : "Get it out of your head."}</h2><p>{hr ? "Vrati se tome kad budeš imala prostora. Bilješka postaje zadatak samo ako ti tako odlučiš." : "Come back when you have room. A note becomes a task only when you decide."}</p></div><input aria-label={hr ? "Nova bilješka" : "Inbox item"} value={text} onChange={(e) => setText(e.target.value)} placeholder={hr ? "Nešto što želiš zapamtiti ili odlučiti…" : "Something to remember or decide…"} /><button className="primary" disabled={!text.trim()} onClick={() => { update((s) => ({ ...s, inbox: [{ id: newId(), text: text.trim(), createdAt: new Date().toISOString() }, ...s.inbox] })); setText(""); }}><Plus /> {hr ? "Zapiši" : "Capture"}</button></section>
    <div className="sectionHead"><div><div className="sectionLabel">{hr ? "ULAZNO" : "INBOX"}</div><h2>{hr ? "Odluči kada bude pravo vrijeme." : "Decide when the time is right."}</h2></div><span className="quiet">{state.inbox.length} {hr ? "čeka" : "waiting"}</span></div>
    {!state.inbox.length && <Empty>{hr ? "Ovdje je mirno. Nove bilješke čekat će te bez pritiska." : "It is quiet here. New notes will wait without pressure."}</Empty>}
    <div className="inboxList">{state.inbox.map((item) => <article className="card inboxItem" key={item.id}><div><h3>{item.text}</h3><time>{new Date(item.createdAt).toLocaleString(hr ? "hr-HR" : "en-GB")}</time></div><div className="actions"><button className="primary" onClick={() => plan(item.id, item.text)}>{hr ? "Planiraj za danas" : "Plan for today"} <ArrowRight /></button><a className="buttonLink" href={googleUrl(item.text)} target="_blank" rel="noreferrer"><GoogleLogo /> Google</a><button onClick={() => downloadCalendar(item.text)}><AppleLogo /> Apple</button><button aria-label={(hr ? "Obriši " : "Delete ") + item.text} onClick={() => update((s) => ({ ...s, inbox: s.inbox.filter((x) => x.id !== item.id) }))}><Trash /></button></div></article>)}</div>
    <p className="integrationNote">{hr ? "Google Calendar otvara događaj za danas, a Apple preuzima .ics datoteku. To je svjestan jednosmjerni prijenos — UNBOUND ne čita tvoj privatni kalendar." : "Google Calendar opens an event for today, while Apple downloads an .ics file. This is a deliberate one-way handoff—UNBOUND does not read your private calendar."}</p>
  </>;
}
