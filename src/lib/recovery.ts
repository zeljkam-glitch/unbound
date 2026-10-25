import type { RecoveryCause, RecoveryCheckin, RecoveryNeed } from "./model";

export type RecoveryProtocol = {
  id: string;
  need: RecoveryNeed;
  minutes: number;
  title: { hr: string; en: string };
  summary: { hr: string; en: string };
  when: { hr: string; en: string };
  steps: { hr: string[]; en: string[] };
};

export const recoveryNeeds: Array<{ id: RecoveryNeed; hr: string; en: string; noteHr: string; noteEn: string }> = [
  { id: "focus", hr: "Više fokusa", en: "More focus", noteHr: "Kad imaš snage, ali misli bježe.", noteEn: "When you have energy but your attention drifts." },
  { id: "energy", hr: "Više energije", en: "More energy", noteHr: "Kad ti treba mali fizički pomak.", noteEn: "When you need a small physical lift." },
  { id: "less-stimulation", hr: "Manje podražaja", en: "Less stimulation", noteHr: "Kad je svega previše.", noteEn: "When everything feels like too much." },
  { id: "study-recovery", hr: "Mentalni oporavak", en: "Mental recovery", noteHr: "Nakon rada za računalom, učenja ili mnogo odluka.", noteEn: "After screen work, study, or too many decisions." },
  { id: "body-recovery", hr: "Oporavak tijela", en: "Body recovery", noteHr: "Nakon vježbanja ili dugog sjedenja.", noteEn: "After exercise or long sitting." },
  { id: "complete-rest", hr: "Potpuni odmor", en: "Complete rest", noteHr: "Kad nastavak rada više nije odgovor.", noteEn: "When continuing to work is not the answer." },
];

export const recoveryProtocols: RecoveryProtocol[] = [
  {
    id: "mental-reset-2", need: "study-recovery", minutes: 2,
    title: { hr: "Mentalni reset", en: "Mental reset" },
    summary: { hr: "Zatvori petlju prije nego prijeđeš dalje.", en: "Close the loop before moving on." },
    when: { hr: "Kad imaš samo dvije minute između blokova rada.", en: "When you only have two minutes between work blocks." },
    steps: { hr: ["Zapiši gdje staješ i prvi sljedeći korak.", "Spusti ramena i napravi pet sporih izdaha.", "Pogledaj u daljinu, ne u drugi ekran."], en: ["Write where you stopped and the next first step.", "Drop your shoulders and take five slow exhales.", "Look into the distance, not at another screen."] },
  },
  {
    id: "active-recovery-10", need: "study-recovery", minutes: 10,
    title: { hr: "Aktivni oporavak", en: "Active recovery" },
    summary: { hr: "Kratka promjena stanja, bez novog sadržaja.", en: "A short state change without more input." },
    when: { hr: "Nakon predavanja, učenja ili rada za ekranom kada želiš provjeriti možeš li se vratiti.", en: "After class, study, or screen work when you want to see if you can return." },
    steps: { hr: ["Ustani i udalji se od ekrana.", "Hodaj pet minuta bez mobitela.", "Popij vodu i napravi lagano istezanje vrata i kukova.", "Na kraju ponovno ocijeni energiju i fokus."], en: ["Stand up and step away from the screen.", "Walk for five minutes without your phone.", "Drink water and gently stretch your neck and hips.", "Rate energy and focus again at the end."] },
  },
  {
    id: "deep-recovery-30", need: "study-recovery", minutes: 30,
    title: { hr: "Duboki oporavak", en: "Deep recovery" },
    summary: { hr: "Pravi prekid rada, ne pauza ispunjena drugim ekranom.", en: "A real stop, not a break filled by another screen." },
    when: { hr: "Kad je mentalni umor visok, fokus se ne vraća ili je dan pri kraju.", en: "When mental fatigue is high, focus does not return, or the day is ending." },
    steps: { hr: ["Zatvori rad i utišaj obavijesti.", "Provedi 15 minuta u šetnji, tušu ili ležećem odmoru bez sadržaja.", "Pojedi nešto jednostavno ako si gladna.", "Vrati se samo ako se stanje stvarno promijenilo."], en: ["Close work and silence notifications.", "Spend 15 minutes walking, showering, or resting without content.", "Eat something simple if you are hungry.", "Return only if your state has actually changed."] },
  },
  {
    id: "evening-shutdown", need: "complete-rest", minutes: 20,
    title: { hr: "Večernje zatvaranje dana", en: "Evening shutdown" },
    summary: { hr: "Za dane kada predavanja ili posao završavaju oko 21:30.", en: "For days when class or work ends around 21:30." },
    when: { hr: "Kad ti više ne treba produktivnost, nego jasan prijelaz prema snu.", en: "When you no longer need productivity, but a clear transition toward sleep." },
    steps: { hr: ["Zapiši samo ono što ne želiš nositi u glavi.", "Priguši svjetlo i odloži radne ekrane.", "Tuš, voda ili mali obrok prema potrebi.", "Ne otvaraj novi zadatak."], en: ["Write down only what you do not want to hold in your head.", "Dim the lights and put work screens away.", "Shower, water, or a small meal as needed.", "Do not open a new task."] },
  },
  {
    id: "focus-return-15", need: "focus", minutes: 15,
    title: { hr: "Povratak jednoj stvari", en: "Return to one thing" },
    summary: { hr: "Smanji broj odluka prije nego tražiš više discipline.", en: "Reduce decisions before asking for more discipline." },
    when: { hr: "Kad je energija dovoljna, ali je pažnja raspršena.", en: "When energy is sufficient but attention is scattered." },
    steps: { hr: ["Makni sve osim jednog zadatka.", "Odredi najmanji vidljivi ishod.", "Postavi 10 minuta bez obavijesti.", "Stani i odluči želiš li nastaviti."], en: ["Remove everything except one task.", "Define the smallest visible outcome.", "Set ten minutes without notifications.", "Stop and decide whether to continue."] },
  },
  {
    id: "energy-shift-10", need: "energy", minutes: 10,
    title: { hr: "Mali fizički pomak", en: "Small physical shift" },
    summary: { hr: "Voda, zrak i kratko kretanje bez forsiranja.", en: "Water, fresh air, and brief movement without forcing it." },
    when: { hr: "Kad je energija niska, ali nisi pospana do točke potpunog odmora.", en: "When energy is low, but you are not sleepy enough to need complete rest." },
    steps: { hr: ["Popij čašu vode.", "Nakratko promijeni zrak u prostoru.", "Hodaj po stanu ili se razgibaj pet minuta.", "Provjeri trebaš li hranu ili pravi odmor."], en: ["Drink a glass of water.", "Refresh the air in the room for a moment.", "Walk around the room or move for five minutes.", "Check whether you need food or real rest."] },
  },
  {
    id: "low-battery-20", need: "energy", minutes: 20,
    title: { hr: "Kad je tijelo na rezervi", en: "When your body is running low" },
    summary: { hr: "Ne traži dodatnu energiju od tijela koje je već prazno.", en: "Do not demand more energy from a body that is already depleted." },
    when: { hr: "Kad te crpi manjak fizičke energije, bez obzira na motivaciju.", en: "When low physical energy is the drain, regardless of motivation." },
    steps: { hr: ["Sjedni ili lezi deset minuta bez sadržaja.", "Provjeri jesi li jela, pila dovoljno i je li ti toplo.", "Odaberi tuš, mali obrok ili kratko drijemanje — ne trening.", "Nakon toga smanji plan ako energija ostane niska."], en: ["Sit or lie down for ten minutes without content.", "Check whether you have eaten, had enough water, and are warm.", "Choose a shower, small meal, or short nap — not a workout.", "Reduce the plan afterward if energy stays low."] },
  },
  {
    id: "room-change-12", need: "energy", minutes: 12,
    title: { hr: "Promijeni osjećaj prostora", en: "Change how the room feels" },
    summary: { hr: "Za zasićenost stanom kada izlazak nije dobra opcija.", en: "For cabin fever when going out is not a good option." },
    when: { hr: "Kad si dugo unutra, prostor je malen i treba ti promjena bez izlaska.", en: "When you have been indoors for a long time, the space is small, and you need a change without going out." },
    steps: { hr: ["Otvori prozor dvije minute i promijeni zrak.", "Premjesti se u drugi kut ili sjedni na pod uz drugi izvor svjetla.", "Pusti jednu energičnu pjesmu i istegni se ili otpleši koliko ti odgovara.", "Nakon pjesme odluči želiš li tuš, kuhanje ili razgovor s nekim."], en: ["Open the window for two minutes and refresh the air.", "Move to another corner or sit on the floor by a different light source.", "Play one energetic song and stretch or dance as much as feels right.", "After the song, choose between a shower, cooking, or calling someone."] },
  },
  {
    id: "food-water-check-15", need: "energy", minutes: 15,
    title: { hr: "Gorivo prije plana", en: "Fuel before the plan" },
    summary: { hr: "Glad i žeđ često izgledaju kao manjak volje.", en: "Hunger and thirst often look like a lack of motivation." },
    when: { hr: "Kad dugo nisi jela ili pila i energija pada.", en: "When it has been a while since you ate or drank and your energy is dropping." },
    steps: { hr: ["Popij vodu.", "Pojedi nešto jednostavno što već imaš.", "Sjedni deset minuta bez multitaskinga.", "Tek tada odluči što još stane u dan."], en: ["Drink some water.", "Eat something simple you already have.", "Sit for ten minutes without multitasking.", "Only then decide what else fits in the day."] },
  },
  {
    id: "quiet-input-15", need: "less-stimulation", minutes: 15,
    title: { hr: "Utišaj ulaz", en: "Quiet the input" },
    summary: { hr: "Ne rješavaj osjećaj preplavljenosti novim sadržajem.", en: "Do not treat overwhelm with more content." },
    when: { hr: "Nakon gužve, mnogo razgovora, obavijesti ili previše otvorenih stvari.", en: "After crowds, many conversations, notifications, or too many open loops." },
    steps: { hr: ["Utišaj obavijesti i odloži slušalice.", "Smanji svjetlo i makni se iz prolaza.", "Bez čitanja i skrolanja petnaest minuta.", "Odaberi samo jedan sljedeći signal."], en: ["Silence notifications and put headphones away.", "Lower the light and move out of busy spaces.", "No reading or scrolling for fifteen minutes.", "Choose only one next signal."] },
  },
  {
    id: "body-release-15", need: "body-recovery", minutes: 15,
    title: { hr: "Lagani oporavak tijela", en: "Gentle body recovery" },
    summary: { hr: "Kretanje bez novog treninga.", en: "Movement without turning it into another workout." },
    when: { hr: "Kod uobičajene zategnutosti ili umora nakon vježbanja i sjedenja.", en: "For ordinary tightness or fatigue after exercise and sitting." },
    steps: { hr: ["Hodaj pet minuta laganim tempom.", "Pokreni zglobove bez forsiranja raspona.", "Popij vodu i pojedi obrok s proteinima ako je vrijeme.", "Odaberi san i odmor prije dodatnog intenziteta."], en: ["Walk for five minutes at an easy pace.", "Move your joints without forcing range.", "Drink water and have a protein-containing meal if it is time.", "Choose sleep and rest before more intensity."] },
  },
  {
    id: "full-stop-30", need: "complete-rest", minutes: 30,
    title: { hr: "Potpuni prekid", en: "Full stop" },
    summary: { hr: "Odmor bez cilja da se odmah vratiš radu.", en: "Rest without the goal of returning to work immediately." },
    when: { hr: "Kod manjka sna, jake iscrpljenosti ili kad se stanje ne popravlja nakon kratke pauze.", en: "After too little sleep, strong exhaustion, or when a short break does not help." },
    steps: { hr: ["Zatvori obaveze za ovaj blok vremena.", "Lezi ili sjedni bez sadržaja i zahtjeva.", "Pobrini se za vodu, hranu, toplinu i tišinu.", "Ponovno planiraj tek poslije odmora."], en: ["Close obligations for this block of time.", "Lie or sit down without content or demands.", "Take care of water, food, warmth, and quiet.", "Plan again only after resting."] },
  },
];

export function recoveryInsights(checkins: RecoveryCheckin[]) {
  const afters = checkins.filter((item) => item.phase === "after" && item.sessionId && item.protocolId);
  return afters.reduce<Record<string, { uses: number; helped: number; maintained: number }>>((result, after) => {
    const before = checkins.find((item) => item.phase === "before" && item.sessionId === after.sessionId);
    if (!before || !after.protocolId) return result;
    const comparison = compareRecovery(before, after);
    const current = result[after.protocolId] || { uses: 0, helped: 0, maintained: 0 };
    result[after.protocolId] = { uses: current.uses + 1, helped: current.helped + Number(comparison.helped), maintained: current.maintained + Number(comparison.outcome === "maintained") };
    return result;
  }, {});
}

export function recommendRecovery(input: { energy: number; focus: number; cause: RecoveryCause; need?: RecoveryNeed; evening?: boolean; history?: RecoveryCheckin[] }) {
  if (input.cause === "pain") return recoveryProtocols.find((item) => item.id === "full-stop-30")!;
  if (input.cause === "hunger") return recoveryProtocols.find((item) => item.id === "food-water-check-15")!;
  if (input.cause === "low-physical-energy") return recoveryProtocols.find((item) => item.id === "low-battery-20")!;
  if (input.cause === "indoors") return recoveryProtocols.find((item) => item.id === "room-change-12")!;
  if (input.cause === "emotional" && input.need !== "focus") return recoveryProtocols.find((item) => item.id === "quiet-input-15")!;
  if (input.evening && input.cause === "mental") return recoveryProtocols.find((item) => item.id === "evening-shutdown")!;
  if (input.need === "study-recovery") {
    const insights = recoveryInsights(input.history || []);
    const learned = recoveryProtocols.filter((item) => item.need === "study-recovery" && insights[item.id]?.uses >= 2).sort((a, b) => (insights[b.id].helped / insights[b.id].uses) - (insights[a.id].helped / insights[a.id].uses))[0];
    return learned || recoveryProtocols.find((item) => item.id === "active-recovery-10")!;
  }
  if (input.need) return recoveryProtocols.find((item) => item.need === input.need) || recoveryProtocols[1];
  if (input.cause === "physical") return recoveryProtocols.find((item) => item.id === "body-release-15")!;
  if (input.cause === "stress") return recoveryProtocols.find((item) => item.id === "quiet-input-15")!;
  if (input.cause === "sleep" || input.energy <= 2) return recoveryProtocols.find((item) => item.id === "full-stop-30")!;
  if (input.cause === "mental") return recoveryProtocols.find((item) => item.id === "active-recovery-10")!;
  if (input.focus <= 2) return recoveryProtocols.find((item) => item.id === "focus-return-15")!;
  return recoveryProtocols.find((item) => item.id === "energy-shift-10")!;
}

export function compareRecovery(before: Pick<RecoveryCheckin, "energy" | "focus">, after: Pick<RecoveryCheckin, "energy" | "focus" | "rested">) {
  const energyDelta = after.energy - before.energy;
  const focusDelta = after.focus - before.focus;
  const outcome = energyDelta > 0 || focusDelta > 0 ? "improved" : energyDelta < 0 || focusDelta < 0 ? "declined" : "maintained";
  return { energyDelta, focusDelta, outcome, helped: outcome === "improved" || (outcome === "maintained" && after.rested === "yes") } as const;
}
