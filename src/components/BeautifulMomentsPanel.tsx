import { Check, Heart, Plus, Sparkle, SpotifyLogoIcon, X } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { feelingLabel, feelingOptions, matchingBeautifulMoments, normalizeFeeling } from "@/lib/beautiful-moments";
import { newId } from "@/lib/id";
import type { BeautifulMoment, MomentPreferences, State } from "@/lib/model";
import type { Update } from "@/lib/ui-types";
import { useLanguage } from "./LanguageContext";

const emptyPreferences = (): MomentPreferences => ({ feelings: [], maxMinutes: 0, maxBudget: -1, energy: "", setting: "", badWeatherOnly: false, condition: "" });
const spotifyEmbedUrl = (value?: string) => {
  if (!value) return "";
  try {
    const url = new URL(value);
    const match = url.hostname === "open.spotify.com" && url.pathname.match(/^\/(track|playlist|album|episode|show|artist)\/([A-Za-z0-9]+)/);
    return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : "";
  } catch { return ""; }
};

const discoveryMethods = {
  memory: {
    hr: { title: "Vrati film", note: "Prisjeti se stvarnog trenutka, ne idealne verzije sebe.", prompt: "Kada si se posljednji put osjećala mirnije, življe ili više svojom? Gdje si bila i što je tada bilo prisutno?" },
    en: { title: "Replay a moment", note: "Remember something real, not an ideal version of yourself.", prompt: "When did you last feel calmer, more alive, or more like yourself? Where were you and what was present?" },
  },
  attraction: {
    hr: { title: "Prati privlačnost", note: "Pogledaj čemu se već spontano vraćaš.", prompt: "Što stalno fotografiraš, spremaš, otvaraš ili primjećuješ, čak i kada nema praktičnu svrhu?" },
    en: { title: "Follow attraction", note: "Notice what you already return to without trying.", prompt: "What do you keep photographing, saving, opening, or noticing, even when it has no practical purpose?" },
  },
  contrast: {
    hr: { title: "Okreni suprotnost", note: "Ponekad je lakše krenuti od onoga što ti ne odgovara.", prompt: "Što ti redovito uzme lakoću iz dana? Kako bi izgledala njegova mala, stvarna suprotnost?" },
    en: { title: "Try the opposite", note: "Sometimes it is easier to begin with what does not work.", prompt: "What regularly drains the ease from your day? What would its small, realistic opposite look like?" },
  },
  experiment: {
    hr: { title: "Napravi mali pokus", note: "Ne moraš unaprijed znati hoće li ti se svidjeti.", prompt: "Što možeš isprobati deset minuta, bez troška i bez obveze da to ponoviš?" },
    en: { title: "Run a tiny experiment", note: "You do not need to know in advance whether you will like it.", prompt: "What could you try for ten minutes, with no cost and no obligation to repeat it?" },
  },
} as const;

export default function BeautifulMomentsPanel({ state, today, weatherCode, update }: { state: State; today: string; weatherCode?: number; update: Update }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const preferences = state.momentPreferences[today] || emptyPreferences();
  const rainy = weatherCode !== undefined && weatherCode >= 51 && weatherCode <= 99;
  const afterDark = new Date().getHours() >= 17 || new Date().getHours() < 6;
  const sunday = new Date(`${today}T12:00:00`).getDay() === 0;
  const [skipFeeling, setSkipFeeling] = useState(false);
  const [surpriseId, setSurpriseId] = useState("");
  const [adding, setAdding] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discoveryMethod, setDiscoveryMethod] = useState<keyof typeof discoveryMethods | "">("");
  const plannedIds = state.plannedMoments[today] || [];
  const planned = plannedIds.map((id) => state.beautifulMoments.find((moment) => moment.id === id)).filter(Boolean) as BeautifulMoment[];
  const ready = preferences.feelings.length > 0 || skipFeeling;
  const matches = useMemo(() => {
    const effectivePreferences: MomentPreferences = { ...preferences, badWeatherOnly: preferences.badWeatherOnly || rainy, setting: preferences.setting || (rainy || afterDark ? "inside" : "") };
    return matchingBeautifulMoments(state.beautifulMoments, effectivePreferences).filter((moment) => !(sunday && ["moment-bookshop", "moment-flower-shop", "moment-market", "moment-window-shopping"].includes(moment.id)));
  }, [state.beautifulMoments, preferences, rainy, afterDark, sunday]);
  const visible = surpriseId ? matches.filter((moment) => moment.id === surpriseId) : matches.slice(0, 6);
  const selectedFeelings = [...new Set(preferences.feelings.map(normalizeFeeling))];

  const setPreferences = (patch: Partial<MomentPreferences>) => update((current) => ({ ...current, momentPreferences: { ...current.momentPreferences, [today]: { ...preferences, ...patch } } }));
  const toggleFeeling = (feeling: string) => setPreferences({ feelings: selectedFeelings.includes(feeling) ? selectedFeelings.filter((item) => item !== feeling) : [...selectedFeelings, feeling] });
  const toggleFavourite = (id: string) => update((current) => ({ ...current, beautifulMoments: current.beautifulMoments.map((moment) => moment.id === id ? { ...moment, favorite: !moment.favorite } : moment) }));
  const addToday = (id: string) => update((current) => ({ ...current, plannedMoments: { ...current.plannedMoments, [today]: plannedIds.includes(id) ? plannedIds : [...plannedIds, id] } }));
  const removeToday = (id: string) => update((current) => ({ ...current, plannedMoments: { ...current.plannedMoments, [today]: plannedIds.filter((item) => item !== id) } }));
  const toggleDone = (id: string) => update((current) => ({ ...current, beautifulMoments: current.beautifulMoments.map((moment) => moment.id === id ? { ...moment, completedDates: moment.completedDates.includes(today) ? moment.completedDates.filter((date) => date !== today) : [...moment.completedDates, today] } : moment) }));
  const surprise = () => {
    if (!matches.length) return;
    const pool = matches.filter((moment) => moment.id !== surpriseId);
    setSurpriseId((pool.length ? pool : matches)[Math.floor(Math.random() * (pool.length || matches.length))].id);
  };

  return <section className="beautifulMoments">
    <div className="beautifulMomentsIntro">
      <div><span className="sectionLabel">{hr ? "MOJ ATLAS LIJEPIH TRENUTAKA" : "MY ATLAS OF BEAUTIFUL MOMENTS"}</span><h2>{hr ? "Kako se danas želiš osjećati?" : "How do you want to feel today?"}</h2><p>{hr ? "Prvo osjećaj. Zatim ono što je danas stvarno izvedivo." : "Feeling first. Then what is genuinely possible today."}</p></div>
      <Sparkle size={34} weight="thin" />
    </div>

    <div className="momentOwnership">
      <div><strong>{hr ? "Ovaj Atlas treba postati tvoj." : "This Atlas should become yours."}</strong><p>{hr ? "Prijedlozi su samo početni tragovi. Ne određuju što bi tebi trebalo biti lijepo. Tvoje ideje, mjesta i odgovori ostaju spremljeni samo u ovom pregledniku." : "Suggestions are only starting traces. They do not define what should feel beautiful to you. Your ideas, places, and answers stay only in this browser."}</p></div>
      <button onClick={() => { setDiscovering(!discovering); setAdding(false); }}><Sparkle weight="thin" /> {hr ? "Pomozi mi pronaći moje" : "Help me find mine"}</button>
    </div>

    {discovering && <section className="momentDiscovery" aria-label={hr ? "Vodič za otkrivanje lijepih trenutaka" : "Beautiful moment discovery guide"}>
      <div className="momentDiscoveryHead"><span className="sectionLabel">{hr ? "MALI VODIČ · BEZ TOČNIH ODGOVORA" : "A SMALL GUIDE · NO RIGHT ANSWERS"}</span><h3>{hr ? "Kreni tragom koji ti je danas najlakši." : "Begin with the trace that feels easiest today."}</h3><p>{hr ? "Ne moraš odmah razumjeti sebe. Dovoljan je jedan mali, iskren trag." : "You do not have to understand yourself all at once. One small, honest trace is enough."}</p></div>
      <div className="discoveryMethods">{Object.entries(discoveryMethods).map(([id, method]) => { const copy = method[hr ? "hr" : "en"]; return <button type="button" key={id} aria-pressed={discoveryMethod === id} onClick={() => setDiscoveryMethod(id as keyof typeof discoveryMethods)}><strong>{copy.title}</strong><span>{copy.note}</span></button>; })}</div>
      {discoveryMethod && <form className="discoveryForm" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const spotifyUrl = String(form.get("spotifyUrl") || "").trim();
        const moment: BeautifulMoment = { id: newId(), title: String(form.get("title")).trim(), description: String(form.get("reflection")).trim(), url: spotifyUrl || undefined, duration: Number(form.get("duration")) || 10, budget: 0, energy: String(form.get("energy")) as BeautifulMoment["energy"], feelings: selectedFeelings.length ? selectedFeelings : ["open-new"], category: "personal", setting: String(form.get("setting")) as BeautifulMoment["setting"], badWeather: form.get("setting") !== "outside", solo: true, social: true, favorite: true, completedDates: [] };
        update((current) => ({ ...current, beautifulMoments: [moment, ...current.beautifulMoments] }));
        setSkipFeeling(true); setSurpriseId(moment.id); setDiscovering(false); setDiscoveryMethod("");
      }}>
        <label className="discoveryReflection"><span>{discoveryMethods[discoveryMethod][hr ? "hr" : "en"].prompt}</span><textarea name="reflection" required rows={3} aria-label={hr ? "Moj trag" : "My trace"} placeholder={hr ? "Zapiši nesavršeno. Nitko drugi ovo ne mora vidjeti." : "Write it imperfectly. Nobody else needs to see this."} /></label>
        <label><span>{hr ? "Kako bi nazvala taj trenutak?" : "What would you call that moment?"}</span><input name="title" required aria-label={hr ? "Naziv mog lijepog trenutka" : "Name my beautiful moment"} placeholder={hr ? "npr. deset mirnih minuta uz prozor" : "e.g. ten quiet minutes by the window"} /></label>
        <label><span>{hr ? "Koliko mu prostora treba?" : "How much room does it need?"}</span><select name="duration" defaultValue="10"><option value="10">10 min</option><option value="30">30 min</option><option value="60">1 h</option><option value="120">2 h</option></select></label>
        <label><span>{hr ? "Koliko energije traži?" : "How much energy does it need?"}</span><select name="energy" defaultValue="low"><option value="low">{hr ? "malo" : "a little"}</option><option value="steady">{hr ? "stabilno" : "steady"}</option><option value="high">{hr ? "puno" : "a lot"}</option></select></label>
        <label><span>{hr ? "Gdje se može dogoditi?" : "Where can it happen?"}</span><select name="setting" defaultValue="either"><option value="either">{hr ? "bilo gdje" : "anywhere"}</option><option value="inside">{hr ? "unutra" : "inside"}</option><option value="outside">{hr ? "vani" : "outside"}</option></select></label>
        <label><span>{hr ? "Spotify poveznica · nije obavezno" : "Spotify link · optional"}</span><input name="spotifyUrl" type="url" placeholder="https://open.spotify.com/…" /></label>
        <div className="discoverySave"><small>{hr ? "Sprema se samo u tvoj Atlas na ovom uređaju. Kasnije ga možeš promijeniti ili izbrisati." : "Saved only to your Atlas on this device. You can change or delete it later."}</small><button className="primary">{hr ? "Spremi kao moj trag" : "Save as my trace"}</button></div>
      </form>}
    </section>}

    {planned.length > 0 && <div className="plannedMoments"><span className="sectionLabel">{hr ? "DANAS SAM ODABRALA" : "CHOSEN FOR TODAY"}</span>{planned.map((moment) => { const done = moment.completedDates.includes(today); return <div className={done ? "plannedMoment isDone" : "plannedMoment"} key={moment.id}><button className="momentDone" aria-pressed={done} aria-label={(done ? (hr ? "Ponovno otvori " : "Reopen ") : (hr ? "Označi ostvareno " : "Mark experienced ")) + moment.title} onClick={() => toggleDone(moment.id)}>{done ? <Check /> : null}</button><span><strong>{moment.title}</strong><small>{done ? (hr ? "Dogodilo se. Bez mjerenja, samo trag." : "It happened. No score, just a trace.") : moment.description}</small></span><button className="iconButton" aria-label={(hr ? "Makni iz dana " : "Remove from today ") + moment.title} onClick={() => removeToday(moment.id)}><X /></button></div>; })}</div>}

    <div className="feelingChoices">{feelingOptions.map((feeling) => <button key={feeling} aria-pressed={selectedFeelings.includes(feeling)} onClick={() => { toggleFeeling(feeling); setSkipFeeling(false); setSurpriseId(""); }}>{feelingLabel(feeling, locale)}</button>)}</div>
    {!ready && <button className="quietAction" onClick={() => setSkipFeeling(true)}>{hr ? "Danas još ne znam. Predloži mi nešto što odgovara ovom danu." : "I am not sure yet. Suggest something that fits this day."}</button>}

    {ready && <>
      <details className="momentFilters"><summary>{hr ? "Suzi prijedloge prema današnjem danu" : "Narrow suggestions for today"}</summary><div>
        <label><span>{hr ? "Koliko vremena imaš?" : "How much time do you have?"}</span><select aria-label={hr ? "Koliko vremena imaš za lijepi trenutak?" : "Time available for a beautiful moment"} value={preferences.maxMinutes} onChange={(event) => setPreferences({ maxMinutes: Number(event.target.value) })}><option value="0">{hr ? "Nije važno" : "Any amount"}</option><option value="15">{hr ? "Do 15 min" : "Up to 15 min"}</option><option value="30">{hr ? "Do 30 min" : "Up to 30 min"}</option><option value="60">{hr ? "Do 1 h" : "Up to 1 hour"}</option><option value="180">{hr ? "Do 3 h" : "Up to 3 hours"}</option><option value="360">{hr ? "Pola dana" : "Half a day"}</option></select></label>
        <label><span>{hr ? "Koliko želiš potrošiti?" : "How much do you want to spend?"}</span><select aria-label={hr ? "Budžet za lijepi trenutak" : "Budget for a beautiful moment"} value={preferences.maxBudget} onChange={(event) => setPreferences({ maxBudget: Number(event.target.value) })}><option value="-1">{hr ? "Nije važno" : "Any amount"}</option><option value="0">0 €</option><option value="5">≤ 5 €</option><option value="10">≤ 10 €</option><option value="20">≤ 20 €</option><option value="50">≤ 50 €</option></select></label>
        <label><span>{hr ? "Koliko energije imaš?" : "How much energy do you have?"}</span><select aria-label={hr ? "Energija za lijepi trenutak" : "Energy for a beautiful moment"} value={preferences.energy} onChange={(event) => setPreferences({ energy: event.target.value as MomentPreferences["energy"] })}><option value="">{hr ? "Nije važno" : "Any level"}</option><option value="low">{hr ? "Malo" : "Low"}</option><option value="steady">{hr ? "Dovoljno" : "Steady"}</option><option value="high">{hr ? "Puno" : "High"}</option></select></label>
        <label><span>{hr ? "Prostor" : "Setting"}</span><select aria-label={hr ? "Prostor za lijepi trenutak" : "Setting for a beautiful moment"} value={preferences.setting} onChange={(event) => setPreferences({ setting: event.target.value as MomentPreferences["setting"] })}><option value="">{hr ? "svejedno" : "either"}</option><option value="inside">{hr ? "unutra" : "inside"}</option><option value="outside">{hr ? "vani" : "outside"}</option></select></label>
        <label><span>{hr ? "Tijelo danas" : "Body today"}</span><select aria-label={hr ? "Fizički kapacitet" : "Physical capacity"} value={preferences.condition} onChange={(event) => setPreferences({ condition: event.target.value as MomentPreferences["condition"] })}><option value="">{hr ? "bez ograničenja" : "no limits"}</option><option value="gentle">{hr ? "trebam nešto lagano" : "I need something gentle"}</option><option value="rest">{hr ? "trebam odmor" : "I need rest"}</option></select></label>
        <label className="weatherCheck"><input type="checkbox" checked={preferences.badWeatherOnly || rainy} disabled={rainy} onChange={(event) => setPreferences({ badWeatherOnly: event.target.checked })} /><span>{rainy ? (hr ? "Kiša je već uzeta u obzir" : "Rain is already taken into account") : (hr ? "Prikladno za kišu ili loše vrijeme" : "Works in rain or bad weather")}</span></label>
      </div></details>

      <div className="momentToolbar"><span>{matches.length} {hr ? "početnih tragova koji stanu u ovaj dan" : "starting traces that fit this day"}</span><div><button onClick={() => { setAdding(!adding); setDiscovering(false); }}><Plus /> {hr ? "Dodaj svoje" : "Add your own"}</button><button className="primary" onClick={surprise} disabled={!matches.length}><Sparkle /> {hr ? "Iznenadi me" : "Surprise me"}</button></div></div>
      {adding && <form className="momentAddForm" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const spotifyUrl = String(form.get("spotifyUrl") || "").trim(); const moment: BeautifulMoment = { id: newId(), title: String(form.get("title")).trim(), description: String(form.get("description")).trim(), url: spotifyUrl || undefined, duration: Number(form.get("duration")) || 30, budget: Number(form.get("budget")) || 0, energy: String(form.get("energy")) as BeautifulMoment["energy"], feelings: selectedFeelings.length ? selectedFeelings : ["present"], category: "personal", setting: String(form.get("setting")) as BeautifulMoment["setting"], badWeather: form.get("badWeather") === "on", solo: true, social: true, favorite: true, completedDates: [] }; update((current) => ({ ...current, beautifulMoments: [moment, ...current.beautifulMoments] })); setAdding(false); }}>
        <div className="momentAddIntro"><span className="sectionLabel">{hr ? "NOVI TRAG" : "A NEW TRACE"}</span><p>{hr ? "Dodaj nešto svoje. Dovoljno je nekoliko riječi." : "Add something of your own. A few words are enough."}</p></div>
        <label className="momentAddTitle"><span>{hr ? "Što ti čini život ljepšim?" : "What makes life feel better?"}</span><input name="title" required placeholder={hr ? "npr. jutarnja kava uz otvoren prozor" : "e.g. morning coffee by an open window"} /></label>
        <label className="momentAddDescription"><span>{hr ? "Zašto ti to odgovara?" : "Why does this work for you?"}</span><input name="description" placeholder={hr ? "Kratak podsjetnik samo za tebe" : "A short reminder just for you"} /></label>
        <div className="momentAddDetails">
          <label><span>{hr ? "Vrijeme" : "Time"}</span><input name="duration" type="number" min="5" step="5" defaultValue="30" /><small>min</small></label>
          <label><span>{hr ? "Trošak" : "Cost"}</span><input name="budget" type="number" min="0" step="1" defaultValue="0" /><small>€</small></label>
          <label><span>{hr ? "Energija" : "Energy"}</span><select name="energy" defaultValue="low"><option value="low">{hr ? "malo" : "low"}</option><option value="steady">{hr ? "dovoljno" : "steady"}</option><option value="high">{hr ? "puno" : "high"}</option></select></label>
          <label><span>{hr ? "Mjesto" : "Place"}</span><select name="setting" defaultValue="either"><option value="either">{hr ? "bilo gdje" : "anywhere"}</option><option value="inside">{hr ? "unutra" : "inside"}</option><option value="outside">{hr ? "vani" : "outside"}</option></select></label>
        </div>
        <label className="momentAddSpotify"><span>{hr ? "Spotify poveznica · nije obavezno" : "Spotify link · optional"}</span><input name="spotifyUrl" type="url" placeholder="https://open.spotify.com/…" /></label>
        <div className="momentAddFinish"><label className="momentRainCheck"><input type="checkbox" name="badWeather" /><span>{hr ? "Odgovara i kišnom danu" : "Works on a rainy day too"}</span></label><button className="primary">{hr ? "Spremi u Atlas" : "Save to Atlas"}</button></div>
      </form>}

      {!matches.length ? <p className="momentEmpty">{hr ? "Nema dobrog podudaranja. Promijeni jedan uvjet. Dan ne mora biti precizan da bi bio lijep." : "Nothing fits well yet. Change one condition. The day does not need to be precise to be beautiful."}</p> : <div className="momentGrid">{visible.map((moment) => { const embedUrl = spotifyEmbedUrl(moment.url); return <article key={moment.id} className="momentCard"><button className="momentHeart" aria-label={(moment.favorite ? (hr ? "Makni iz omiljenih " : "Remove favourite ") : (hr ? "Spremi u omiljene " : "Save favourite ")) + moment.title} aria-pressed={moment.favorite} onClick={() => toggleFavourite(moment.id)}><Heart weight={moment.favorite ? "fill" : "thin"} /></button><span className="sectionLabel">{moment.duration} MIN · {moment.budget === 0 ? "0 €" : `≈ ${moment.budget} €`} · {hr ? ({ low: "NISKA", steady: "STABILNA", high: "VISOKA" } as const)[moment.energy] : moment.energy.toUpperCase()}</span><h3>{moment.title}</h3><p>{moment.description}</p><small>{moment.feelings.slice(0, 3).map((feeling) => feelingLabel(feeling, locale)).join(" · ")}</small>{embedUrl ? <iframe className="momentSpotifyEmbed" title={`Spotify · ${moment.title}`} src={embedUrl} width="100%" height="80" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" /> : moment.url && <a className="momentListen" href={moment.url} target="_blank" rel="noreferrer"><SpotifyLogoIcon weight="fill" /> {hr ? "Otvori poveznicu" : "Open link"}</a>}<button className="primary" disabled={plannedIds.includes(moment.id)} onClick={() => addToday(moment.id)}>{plannedIds.includes(moment.id) ? <Check weight="thin" /> : <Plus weight="thin" />} {plannedIds.includes(moment.id) ? (hr ? "Odabrano za danas" : "Chosen for today") : (hr ? "Dodaj kao lijepi trenutak" : "Add as a beautiful moment")}</button></article>; })}</div>}
      {surpriseId && <button className="quietAction momentAgain" onClick={surprise}>{hr ? "Predloži nešto drugo" : "Suggest something else"}</button>}
    </>}
    <p className="momentFootnote">{hr ? "Ovo nije zadatak. Ako se ne dogodi, ništa nisi propustila ni pokvarila." : "This is not a task. If it does not happen, nothing has been missed or failed."}</p>
  </section>;
}
