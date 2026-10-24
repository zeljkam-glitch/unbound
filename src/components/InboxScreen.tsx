import { newId } from "@/lib/id";
import { localDate, type State } from "@/lib/model";
import { ArrowRight, EnvelopeSimple, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import { Empty } from "./Primitives";
import { useLanguage } from "./LanguageContext";

export default function InboxScreen({ state, update }: { state: State; update: Update }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const [text, setText] = useState("");
  const plan = (id: string, title: string) => update((s) => ({ ...s, inbox: s.inbox.filter((x) => x.id !== id), tasks: [...s.tasks, { id: newId(), title, date: localDate(), time: "", deadline: "", kind: "flexible", duration: 30, repeat: "none", area: "anywhere", effort: "light", completedAt: null }] }));
  return <>
    <section className="card inboxCapture"><EnvelopeSimple size={30} weight="duotone" /><div><div className="sectionLabel">{hr ? "ZAPIŠI BEZ OBAVEZE" : "WRITE IT DOWN, NO COMMITMENT"}</div><h2>{hr ? "Makni to iz glave." : "Get it out of your head."}</h2><p>{hr ? "Vrati se tome kad budeš imala prostora. Bilješka postaje zadatak samo ako ti tako odlučiš." : "Come back when you have room. A note becomes a task only when you decide."}</p></div><input aria-label={hr ? "Nova bilješka" : "Inbox item"} value={text} onChange={(e) => setText(e.target.value)} placeholder={hr ? "Nešto što želiš zapamtiti ili odlučiti…" : "Something to remember or decide…"} /><button className="primary" disabled={!text.trim()} onClick={() => { update((s) => ({ ...s, inbox: [{ id: newId(), text: text.trim(), createdAt: new Date().toISOString() }, ...s.inbox] })); setText(""); }}><Plus /> {hr ? "Zapiši" : "Capture"}</button></section>
    <div className="sectionHead"><div><div className="sectionLabel">{hr ? "ULAZNO" : "INBOX"}</div><h2>{hr ? "Odluči kada bude pravo vrijeme." : "Decide when the time is right."}</h2></div><span className="quiet">{state.inbox.length} {hr ? "čeka" : "waiting"}</span></div>
    {!state.inbox.length && <Empty>{hr ? "Ovdje je mirno. Nove bilješke čekat će te bez pritiska." : "It is quiet here. New notes will wait without pressure."}</Empty>}
    <div className="inboxList">{state.inbox.map((item) => <article className="card inboxItem" key={item.id}><div><h3>{item.text}</h3><time>{new Date(item.createdAt).toLocaleString(hr ? "hr-HR" : "en-GB")}</time></div><div className="actions"><button className="primary" onClick={() => plan(item.id, item.text)}>{hr ? "Planiraj za danas" : "Plan for today"} <ArrowRight /></button><button aria-label={(hr ? "Obriši " : "Delete ") + item.text} onClick={() => update((s) => ({ ...s, inbox: s.inbox.filter((x) => x.id !== item.id) }))}><Trash /></button></div></article>)}</div>
    <p className="integrationNote">{hr ? "Skeniranje e-pošte i prijedlozi odgovora još nisu povezani. Ovdje se prikazuje samo ono što sama dodaš." : "Email scanning and reply suggestions are not connected yet. This inbox shows only what you add yourself."}</p>
  </>;
}
