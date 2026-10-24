import { newId } from "@/lib/id";
import { localDate, type State } from "@/lib/model";
import { ArrowRight, EnvelopeSimple, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import type { Update } from "@/lib/ui-types";
import { Empty } from "./Primitives";

export default function InboxScreen({ state, update }: { state: State; update: Update }) {
  const [text, setText] = useState("");
  const plan = (id: string, title: string) => update((s) => ({ ...s, inbox: s.inbox.filter((x) => x.id !== id), tasks: [...s.tasks, { id: newId(), title, date: localDate(), time: "", deadline: "", kind: "flexible", duration: 30, repeat: "none", area: "anywhere", effort: "light", completedAt: null }] }));
  return <>
    <section className="card inboxCapture"><EnvelopeSimple size={30} weight="duotone" /><div><div className="sectionLabel">CAPTURE WITHOUT COMMITTING</div><h2>Get it out of your head.</h2><p>Review it when you have capacity. Nothing here becomes a task by itself.</p></div><input aria-label="Inbox item" value={text} onChange={(e) => setText(e.target.value)} placeholder="Something to remember or decide…" /><button className="primary" disabled={!text.trim()} onClick={() => { update((s) => ({ ...s, inbox: [{ id: newId(), text: text.trim(), createdAt: new Date().toISOString() }, ...s.inbox] })); setText(""); }}><Plus /> Capture</button></section>
    <div className="sectionHead"><div><div className="sectionLabel">INBOX</div><h2>Decide when you’re ready.</h2></div><span className="quiet">{state.inbox.length} waiting</span></div>
    {!state.inbox.length && <Empty>Your inbox is clear. New notes will wait here without pressure.</Empty>}
    <div className="inboxList">{state.inbox.map((item) => <article className="card inboxItem" key={item.id}><div><h3>{item.text}</h3><time>{new Date(item.createdAt).toLocaleString()}</time></div><div className="actions"><button className="primary" onClick={() => plan(item.id, item.text)}>Plan for today <ArrowRight /></button><button aria-label={"Delete " + item.text} onClick={() => update((s) => ({ ...s, inbox: s.inbox.filter((x) => x.id !== item.id) }))}><Trash /></button></div></article>)}</div>
    <p className="integrationNote">Email scanning and reply suggestions are not connected in this MVP. This inbox only contains items you add here.</p>
  </>;
}
