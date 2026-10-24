export type Season = "winter" | "spring" | "summer" | "autumn";
export type SeasonLocale = "hr" | "en";

const months = {
  hr: [
    ["Siječanj", "Počni s manje, ali bliže sebi.", "Raščisti jednu malu površinu", "Skuhaj nešto što grije", "Zapiši što ove godine ne moraš nositi"],
    ["Veljača", "Čuvaj energiju prije nego stigne proljeće.", "Pronađi svjetlo usred dana", "Javi se osobi uz koju možeš biti svoja", "Dovrši jednu tihu, važnu stvar"],
    ["Ožujak", "Primijeti što se polako vraća.", "Otvori prozor i prošetaj bez cilja", "Posadi ili unesi nešto zeleno", "Vrati jednu ideju koja je čekala"],
    ["Travanj", "Ostavi mjesta za promjenu vremena i planova.", "Planiraj dan s rezervnim putem", "Potraži boju koja ti je nedostajala", "Provedi dvadeset minuta vani"],
    ["Svibanj", "Slijedi ono zbog čega želiš izaći van.", "Dogovori susret na otvorenom", "Ponesi bilježnicu u park", "Odaberi jedno mjesto za mali bijeg"],
    ["Lipanj", "Neka duži dani ne postanu puniji dani.", "Sačuvaj jednu dugu večer", "Pojedi nešto jednostavno vani", "Završi posao dok još ima svjetla"],
    ["Srpanj", "Uspori dovoljno da osjetiš ljeto.", "Ostavi poslijepodne bez plana", "Potraži hlad, vodu ili tišinu", "Odaberi jednu stvar koju nećeš požurivati"],
    ["Kolovoz", "Čuvaj prostranost prije novog ritma.", "Provedi jutro bez ekrana", "Zapiši što želiš ponijeti u jesen", "Vrati se mjestu na kojem dišeš lakše"],
    ["Rujan", "Novi ritam ne mora početi naglo.", "Odaberi jedan oslonac za jutra", "Složi torbu ili stol za lakši početak", "Ostavi jedan dan bez novih odluka"],
    ["Listopad", "Saberi toplinu prije hladnijih dana.", "Uhvati zadnje popodnevno svjetlo", "Skuhaj nešto toplo za dva dana", "Raščisti jedno mjesto prije zime"],
    ["Studeni", "Dopusti si tiši tempo.", "Upali svjetlo prije nego što se smrači", "Odaberi jedan miran večernji ritual", "Odustani od jedne nepotrebne obaveze"],
    ["Prosinac", "Zadrži samo ono što stvarno nosi toplinu.", "Odaberi jedan susret kojem se veseliš", "Napravi prostor za odmor bez zasluživanja", "Zapiši što želiš sačuvati iz ove godine"],
  ],
  en: [
    ["January", "Begin with less, but closer to yourself.", "Clear one small surface", "Cook something warming", "Write down what you do not need to carry this year"],
    ["February", "Protect your energy before spring arrives.", "Find the daylight in the middle of the day", "Reach out to someone you can be yourself with", "Finish one quiet, meaningful thing"],
    ["March", "Notice what is slowly returning.", "Open a window and walk without a destination", "Plant or bring home something green", "Return to one idea that has been waiting"],
    ["April", "Leave room for changing weather and changing plans.", "Give the day a gentler alternative", "Look for a colour you have missed", "Spend twenty minutes outside"],
    ["May", "Follow what gently draws you outside.", "Meet someone outdoors", "Take a notebook to the park", "Choose one place for a small escape"],
    ["June", "Let longer days stay spacious days.", "Keep one long evening open", "Eat something simple outside", "End work while there is still light"],
    ["July", "Slow down enough to feel the summer.", "Leave an afternoon unplanned", "Look for shade, water or quiet", "Choose one thing you will not rush"],
    ["August", "Protect spaciousness before a new rhythm begins.", "Spend a morning without a screen", "Write what you want to carry into autumn", "Return to a place where breathing feels easier"],
    ["September", "A new rhythm does not have to begin all at once.", "Choose one anchor for your mornings", "Prepare a bag or desk for an easier start", "Leave one day free of new decisions"],
    ["October", "Gather warmth before the colder days.", "Catch the last afternoon light", "Cook something warm that lasts two days", "Clear one place before winter"],
    ["November", "Allow a quieter pace.", "Turn on a light before dusk", "Choose one calm evening ritual", "Release one unnecessary commitment"],
    ["December", "Keep only what genuinely carries warmth.", "Choose one gathering to look forward to", "Make room for rest you do not have to earn", "Write down what you want to keep from this year"],
  ],
} as const;

const seasonNames: Record<SeasonLocale, Record<Season, string>> = {
  hr: { winter: "zima", spring: "proljeće", summer: "ljeto", autumn: "jesen" },
  en: { winter: "winter", spring: "spring", summer: "summer", autumn: "autumn" },
};

const seasonIdeas: Record<SeasonLocale, Record<Season, string[]>> = {
  hr: {
    winter: ["Potraži dnevno svjetlo prije podneva", "Pripremi mirnu večer prije nego što se dan ubrza", "Odaberi jedan topao obrok bez kompliciranja", "Provjeri što ti ovaj tjedan stvarno čuva energiju"],
    spring: ["Prošetaj rutom na kojoj možeš primijetiti što se promijenilo", "Otvori prostor za jednu novu ideju", "Ponesi dio dana van", "Odaberi jednu stvar koju želiš osvježiti"],
    summer: ["Pomakni jednu obavezu iz najtoplijeg dijela dana", "Sačuvaj vrijeme za vodu, hlad ili večernji zrak", "Ostavi jedan obrok jednostavnim", "Odaberi mali izlazak bez gustog plana"],
    autumn: ["Ponesi sloj više i ostavi planu rezervu", "Odaberi jedno mjesto koje želiš učiniti toplijim", "Sačuvaj malo dnevnog svjetla za sebe", "Pripremi nešto zbog čega će sutrašnje jutro biti lakše"],
  },
  en: {
    winter: ["Find the daylight before noon", "Prepare a quiet evening before the day speeds up", "Choose one warm meal without overcomplicating it", "Notice what genuinely protects your energy this week"],
    spring: ["Walk somewhere you can notice what has changed", "Make room for one new idea", "Take part of the day outside", "Choose one thing you want to refresh"],
    summer: ["Move one commitment away from the hottest part of the day", "Keep some time for water, shade or evening air", "Let one meal stay simple", "Choose a small outing without a packed plan"],
    autumn: ["Take an extra layer and leave the plan some margin", "Choose one place you want to make warmer", "Keep a little daylight for yourself", "Prepare something that will make tomorrow morning easier"],
  },
};

const holidays: Array<{ month: number; day: number; hr: string; en: string }> = [
  { month: 0, day: 1, hr: "Nova godina je danas. Ostavi plan otvorenijim nego inače.", en: "It is New Year’s Day. Leave the plan more open than usual." },
  { month: 0, day: 6, hr: "Blagdan je. Provjeri što danas može ostati neplanirano.", en: "It is a holiday. Notice what can remain unplanned today." },
  { month: 4, day: 1, hr: "Praznik rada je blizu. Napravi mjesta za odmor koji ne treba zaslužiti.", en: "Labour Day is close. Make room for rest you do not have to earn." },
  { month: 4, day: 30, hr: "Blagdan je blizu. Unaprijed zaštiti vrijeme za ljude i mjesta koja voliš.", en: "A holiday is close. Protect time for people and places you love." },
  { month: 7, day: 5, hr: "Blagdan je blizu. Provjeri promet i radno vrijeme pa ostavi više prostora.", en: "A holiday is close. Check travel and opening hours, then leave more room." },
  { month: 10, day: 1, hr: "Blagdan je blizu. Ostavi vrijeme za sjećanje i sporiji ritam.", en: "A holiday is close. Leave room for remembrance and a slower pace." },
  { month: 11, day: 24, hr: "Badnjak je blizu. Odaberi ono što donosi toplinu, ne još obaveza.", en: "Christmas Eve is close. Choose what brings warmth, not more obligations." },
  { month: 11, day: 25, hr: "Božić je blizu. Neka dovoljno zaista bude dovoljno.", en: "Christmas is close. Let enough genuinely be enough." },
  { month: 11, day: 31, hr: "Kraj godine je blizu. Sačuvaj jednu stvar koju želiš ponijeti dalje.", en: "The year is ending. Keep one thing you want to carry forward." },
];

const weatherIdea = (code: number | undefined, locale: SeasonLocale) => {
  if (code === undefined) return "";
  if (code >= 51 && code <= 99) return locale === "hr" ? "Vrijeme traži zaklon. Odaberi toplu unutarnju verziju dana." : "The weather calls for shelter. Choose a warm indoor version of the day.";
  if (code <= 3) return locale === "hr" ? "Dan ima svjetla. Sačuvaj barem deset minuta vani." : "There is light today. Keep at least ten minutes for outside.";
  return locale === "hr" ? "Vrijeme je promjenjivo. Sačuvaj jednostavnu rezervnu opciju." : "The weather is changeable. Keep a simple alternative ready.";
};

export function seasonForMonth(month: number): Season {
  if (month === 11 || month <= 1) return "winter";
  if (month <= 4) return "spring";
  if (month <= 7) return "summer";
  return "autumn";
}

export function seasonalContext(date = new Date(), locale: SeasonLocale = "en", context: { obligations?: string[]; weatherCode?: number } = {}) {
  const monthIndex = date.getMonth();
  const [month, theme, ...monthlyIdeas] = months[locale][monthIndex];
  const season = seasonForMonth(monthIndex);
  const dayKey = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  const pool = [...monthlyIdeas, ...seasonIdeas[locale][season]];
  const rotating = Array.from({ length: 3 }, (_, index) => pool[(dayKey + index * 2) % pool.length]);
  const upcomingHoliday = holidays.find((holiday) => {
    const target = new Date(date.getFullYear(), holiday.month, holiday.day);
    const difference = Math.round((target.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000);
    return difference >= 0 && difference <= 3;
  });
  const obligation = context.obligations?.[0] ? (locale === "hr" ? `Ostavi malo prostora prije obaveze: ${context.obligations[0]}` : `Leave a little room before: ${context.obligations[0]}`) : "";
  const specific = [upcomingHoliday ? upcomingHoliday[locale] : "", weatherIdea(context.weatherCode, locale), obligation].filter(Boolean);
  const ideas = [...specific, ...rotating].filter((idea, index, all) => all.indexOf(idea) === index).slice(0, 3);
  return { month, monthIndex, season, seasonName: seasonNames[locale][season], theme, ideas };
}
