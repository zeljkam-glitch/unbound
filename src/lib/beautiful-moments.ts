import type { BeautifulMoment, MomentPreferences } from "./model";

type Locale = "hr" | "en";
type Seed = Omit<BeautifulMoment, "title" | "description" | "favorite" | "completedDates"> & { title: [string, string]; description: [string, string] };

const seeds: Seed[] = [
  { id: "moment-one-song-move", title: ["Pokreni se uz jednu pjesmu", "Move to one song"], description: ["Pusti pjesmu koja te digne i kreći se koliko tijelu odgovara. Može i sjedeći.", "Play a song that lifts you and move only as much as your body wants. Sitting counts too."], duration: 5, budget: 0, energy: "low", feelings: ["relaxed", "playful", "energetic"], category: "music", setting: "inside", badWeather: true, solo: true, social: true },
  { id: "moment-tea-window", title: ["Čaj uz prozor", "Tea by the window"], description: ["Bez ekrana. Samo topli napitak i pogled prema van.", "No screen. Just something warm and a view outside."], duration: 15, budget: 0, energy: "low", feelings: ["calm", "relaxed"], category: "ritual", setting: "inside", badWeather: true, solo: true, social: false },
  { id: "moment-one-song", title: ["Jedna pjesma, od početka do kraja", "One song, from beginning to end"], description: ["Sjedni i poslušaj je bez paralelnog zadatka.", "Sit down and listen without doing anything else."], duration: 10, budget: 0, energy: "low", feelings: ["calm", "inspired", "free"], category: "ritual", setting: "either", badWeather: true, solo: true, social: false },
  { id: "moment-bookshop", title: ["Knjižara bez obveze kupnje", "A bookshop with no need to buy"], description: ["Listaj ono što te privuče. Ne moraš ništa pronaći.", "Browse whatever draws you in. You do not have to find anything."], duration: 45, budget: 0, energy: "steady", feelings: ["curious", "inspired"], category: "culture", setting: "inside", badWeather: true, solo: true, social: true },
  { id: "moment-library-art", title: ["Knjige o umjetnosti u knjižnici", "Art books at the library"], description: ["Listaj umjetnost, putovanja, fotografiju ili kuhanje.", "Browse art, travel, photography or cooking books."], duration: 60, budget: 0, energy: "low", feelings: ["inspired", "curious", "traveling"], category: "culture", setting: "inside", badWeather: true, solo: true, social: false },
  { id: "moment-gallery", title: ["Sat vremena u galeriji", "An hour in a gallery"], description: ["Odaberi jednu izložbu i zadrži se samo uz ono što te zaustavi.", "Choose one exhibition and stay only with what makes you pause."], duration: 60, budget: 10, energy: "steady", feelings: ["inspired", "curious", "calm"], category: "culture", setting: "inside", badWeather: true, solo: true, social: true },
  { id: "moment-cafe-book", title: ["Kava s knjigom", "Coffee with a book"], description: ["Lijep prostor, jedna knjiga i bez potrebe da budeš produktivna.", "A beautiful room, one book and no need to be productive."], duration: 60, budget: 10, energy: "low", feelings: ["pampered", "calm", "alone-good"], category: "food", setting: "inside", badWeather: true, solo: true, social: false },
  { id: "moment-dessert-home", title: ["Desert kod kuće", "Dessert at home"], description: ["Nešto fino uz stranicu koju stvarno želiš pročitati.", "Something good with a page you genuinely want to read."], duration: 30, budget: 5, energy: "low", feelings: ["pampered", "relaxed"], category: "home", setting: "inside", badWeather: true, solo: true, social: true },
  { id: "moment-colour-walk", title: ["Šetnja s jednom temom", "A walk with one theme"], description: ["Gledaj samo boje, izloge, svjetlo ili zanimljive detalje.", "Notice only colours, windows, light or interesting details."], duration: 30, budget: 0, energy: "steady", feelings: ["curious", "creative", "free"], category: "walk", setting: "outside", badWeather: false, solo: true, social: true },
  { id: "moment-slow-neighbourhood", title: ["Spora šetnja kvartom", "A slow neighbourhood walk"], description: ["Bez rute i bez cilja. Vrati se kada ti bude dovoljno.", "No route and no goal. Return when it feels enough."], duration: 30, budget: 0, energy: "low", feelings: ["calm", "free"], category: "walk", setting: "outside", badWeather: false, solo: true, social: true },
  { id: "moment-flower-shop", title: ["Cvjećarnica kao mala izložba", "A flower shop as a tiny exhibition"], description: ["Pogledaj boje i oblike, čak i ako ništa ne kupiš.", "Notice colours and shapes, even if you buy nothing."], duration: 20, budget: 0, energy: "steady", feelings: ["inspired", "playful", "curious"], category: "city", setting: "inside", badWeather: true, solo: true, social: true },
  { id: "moment-new-street", title: ["Jedna ulica kojom još nisi prošla", "One street you have not walked before"], description: ["Malo istraživanje grada bez velikog plana.", "A small city exploration without a big plan."], duration: 45, budget: 0, energy: "steady", feelings: ["adventurous", "curious", "free"], category: "city", setting: "outside", badWeather: false, solo: true, social: true },
  { id: "moment-window-shopping", title: ["Gledanje lijepih izloga", "Looking at beautiful windows"], description: ["Traži ideje, ne stvari koje moraš kupiti.", "Look for ideas, not things you have to buy."], duration: 30, budget: 0, energy: "steady", feelings: ["inspired", "playful"], category: "city", setting: "either", badWeather: true, solo: true, social: true },
  { id: "moment-market", title: ["Krug po placu", "A round at the market"], description: ["Mirisi, boje i sezonske stvari. Kupi samo ako nešto stvarno želiš.", "Scents, colours and seasonal things. Buy only if you truly want to."], duration: 45, budget: 10, energy: "steady", feelings: ["connected", "curious"], category: "city", setting: "outside", badWeather: false, solo: true, social: true },
  { id: "moment-photo-walk", title: ["Šetnja s foto-zadatkom", "A walk with a photo prompt"], description: ["Snimi pet tragova dana: svjetlo, teksturu, boju, pokret i tišinu.", "Capture five traces of the day: light, texture, colour, movement and quiet."], duration: 60, budget: 0, energy: "steady", feelings: ["creative", "inspired", "curious"], category: "creative", setting: "outside", badWeather: false, solo: true, social: true },
  { id: "moment-collage", title: ["Mali analogni kolaž", "A small analogue collage"], description: ["Papir, stare stranice i dvadeset minuta bez cilja.", "Paper, old pages and twenty minutes with no outcome in mind."], duration: 30, budget: 0, energy: "low", feelings: ["creative", "playful"], category: "creative", setting: "inside", badWeather: true, solo: true, social: true },
  { id: "moment-write-page", title: ["Jedna stranica samo za sebe", "One page just for yourself"], description: ["Piši bez teme i bez namjere da išta riješiš.", "Write without a topic and without trying to solve anything."], duration: 20, budget: 0, energy: "low", feelings: ["free", "creative", "calm"], category: "creative", setting: "inside", badWeather: true, solo: true, social: false },
  { id: "moment-cook-new", title: ["Skuhaj nešto iz druge zemlje", "Cook something from another country"], description: ["Neka večera nakratko promijeni mjesto na kojem se nalaziš.", "Let dinner briefly change where you feel you are."], duration: 90, budget: 20, energy: "high", feelings: ["traveling", "creative", "fulfilled"], category: "food", setting: "inside", badWeather: true, solo: true, social: true },
  { id: "moment-breakfast-table", title: ["Doručak za stolom", "Breakfast at the table"], description: ["Bez stajanja i ekrana. Postavi stol i sjedni.", "No standing and no screen. Set the table and sit down."], duration: 30, budget: 5, energy: "low", feelings: ["pampered", "calm"], category: "food", setting: "inside", badWeather: true, solo: true, social: true },
  { id: "moment-lunch-new-place", title: ["Ručak u nepoznatom prostoru", "Lunch somewhere unfamiliar"], description: ["Odaberi ambijent koji te zanima, ne samo najbližu opciju.", "Choose a room that interests you, not merely the nearest option."], duration: 90, budget: 30, energy: "steady", feelings: ["traveling", "inspired", "pampered"], category: "food", setting: "inside", badWeather: true, solo: true, social: true },
  { id: "moment-music-floor", title: ["Glazba na podu", "Music on the floor"], description: ["Lezi ili sjedni na pod i poslušaj jedan cijeli album.", "Lie or sit on the floor and listen to one full album."], duration: 45, budget: 0, energy: "low", feelings: ["relaxed", "free", "alone-good"], category: "rest", setting: "inside", badWeather: true, solo: true, social: false },
  { id: "moment-bath", title: ["Dugi tuš ili kupka bez žurbe", "A long shower or bath without rushing"], description: ["Toplina, miris i dovoljno vremena da se vratiš sebi.", "Warmth, scent and enough time to return to yourself."], duration: 30, budget: 0, energy: "low", feelings: ["pampered", "safe", "relaxed"], category: "ritual", setting: "inside", badWeather: true, solo: true, social: false },
  { id: "moment-fresh-sheets", title: ["Svježa posteljina ranije navečer", "Fresh sheets, earlier in the evening"], description: ["Pripremi krevet dok još imaš energije i kasnije samo dođi u njega.", "Prepare the bed while you still have energy, then simply return to it later."], duration: 20, budget: 0, energy: "low", feelings: ["safe", "pampered", "calm"], category: "home", setting: "inside", badWeather: true, solo: true, social: false },
  { id: "moment-candle", title: ["Jedno svjetlo manje", "One light less"], description: ["Ugasi glavno svjetlo, upali lampu ili svijeću i uspori prostor.", "Turn off the main light, switch on a lamp or candle and slow the room down."], duration: 15, budget: 0, energy: "low", feelings: ["romantic", "calm", "safe"], category: "home", setting: "inside", badWeather: true, solo: true, social: true },
  { id: "moment-call", title: ["Poziv osobi uz koju možeš biti svoja", "Call someone you can be yourself with"], description: ["Ne treba agenda. Samo kratko: kako si, stvarno?", "No agenda needed. Just: how are you, really?"], duration: 30, budget: 0, energy: "low", feelings: ["connected", "safe"], category: "connection", setting: "either", badWeather: true, solo: false, social: true },
  { id: "moment-shared-coffee", title: ["Kava bez posebnog razloga", "Coffee for no particular reason"], description: ["Pozovi nekoga tko ti ne troši energiju.", "Invite someone who does not drain your energy."], duration: 60, budget: 10, energy: "steady", feelings: ["connected", "relaxed"], category: "connection", setting: "inside", badWeather: true, solo: false, social: true },
  { id: "moment-picnic", title: ["Mali piknik", "A small picnic"], description: ["Jednostavna hrana, dekica i mjesto na kojem se dan otvori.", "Simple food, a blanket and a place where the day opens up."], duration: 120, budget: 15, energy: "steady", feelings: ["free", "playful", "connected"], category: "nature", setting: "outside", badWeather: false, solo: true, social: true },
  { id: "moment-viewpoint", title: ["Otiđi do pogleda", "Go somewhere with a view"], description: ["Brdo, rijeka ili rub grada. Ostani dok se ritam ne promijeni.", "A hill, river or edge of town. Stay until your rhythm changes."], duration: 120, budget: 10, energy: "high", feelings: ["free", "adventurous", "calm"], category: "nature", setting: "outside", badWeather: false, solo: true, social: true },
  { id: "moment-day-trip", title: ["Mali izlet bez gustog rasporeda", "A small trip without a packed itinerary"], description: ["Jedno mjesto, jedan obrok i dovoljno praznog vremena.", "One place, one meal and enough empty time."], duration: 360, budget: 50, energy: "high", feelings: ["adventurous", "traveling", "free"], category: "new", setting: "outside", badWeather: false, solo: true, social: true },
  { id: "moment-cinema", title: ["Kino usred dana", "A daytime film"], description: ["Odaberi film zbog atmosfere, ne zato što ga moraš pogledati.", "Choose a film for its atmosphere, not because you should see it."], duration: 150, budget: 15, energy: "low", feelings: ["inspired", "relaxed", "alone-good"], category: "culture", setting: "inside", badWeather: true, solo: true, social: true },
  { id: "moment-nothing", title: ["Pola sata bez cilja", "Half an hour with no goal"], description: ["Ne optimiziraj ga. Ne dokumentiraj ga. Samo ostani.", "Do not optimise it. Do not document it. Just stay."], duration: 30, budget: 0, energy: "low", feelings: ["free", "calm", "safe"], category: "rest", setting: "either", badWeather: true, solo: true, social: false },
];

export const feelingOptions = [
  "inspired", "relaxed", "free", "playful", "pampered", "calm", "curious", "connected", "creative", "adventurous", "safe", "alone-good", "traveling", "romantic", "fulfilled",
  "productive", "grounded", "organized", "focused", "clear", "capable", "motivated", "energetic", "present", "stable", "relieved", "less-pressure", "in-control", "open-new", "proud", "confident",
] as const;

export const normalizeFeeling = (value: string): string => value;

export const feelingLabel = (value: string, locale: Locale) => ({
  inspired: ["nadahnuto", "inspired"], relaxed: ["opušteno", "relaxed"], free: ["slobodno", "free"], playful: ["razigrano", "playful"], pampered: ["razmaženo", "pampered"], calm: ["mirno", "calm"], curious: ["znatiželjno", "curious"], connected: ["povezano", "connected"], creative: ["kreativno", "creative"], adventurous: ["pustolovno", "adventurous"], safe: ["sigurno", "safe"], "alone-good": ["sama, ali dobro mi je", "alone, and content"], traveling: ["kao da putujem", "as if I am travelling"], romantic: ["romantično", "romantic"], fulfilled: ["ispunjeno", "fulfilled"],
  productive: ["produktivno", "productive"], grounded: ["čvrsto na zemlji", "grounded"], organized: ["organizirano", "organized"], focused: ["usredotočeno", "focused"], clear: ["jasno", "clear"], capable: ["sposobno", "capable"], motivated: ["motivirano", "motivated"], energetic: ["energično", "energetic"], present: ["prisutno", "present"], stable: ["stabilno", "stable"], relieved: ["rasterećeno", "relieved"], "less-pressure": ["manjak pritiska", "less pressure"], "in-control": ["imam kontrolu", "in control"], "open-new": ["otvoreno za nešto novo", "open to something new"], proud: ["ponosno na sebe", "proud of myself"], confident: ["samopouzdano", "confident"],
}[normalizeFeeling(value)]?.[locale === "hr" ? 0 : 1] || value);

const feelingSignals: Record<string, string[]> = {
  productive: ["productive", "fulfilled", "creative"],
  grounded: ["grounded", "connected", "safe", "alone-good", "calm"],
  organized: ["organized", "safe", "fulfilled"],
  focused: ["focused", "calm", "creative"],
  clear: ["clear", "calm", "free"],
  capable: ["capable", "fulfilled", "adventurous", "creative"],
  motivated: ["motivated", "inspired", "creative"],
  energetic: ["energetic", "playful", "adventurous"],
  present: ["present", "calm", "relaxed", "connected", "romantic"],
  stable: ["stable", "safe", "calm"],
  relieved: ["relieved", "relaxed", "free", "pampered"],
  "less-pressure": ["less-pressure", "relaxed", "free", "calm", "alone-good"],
  "in-control": ["in-control", "safe", "fulfilled"],
  "open-new": ["open-new", "curious", "adventurous", "traveling", "playful"],
  proud: ["proud", "fulfilled", "creative"],
  confident: ["confident", "adventurous", "safe", "fulfilled"],
};

export function beautifulMomentCatalog(locale: Locale): BeautifulMoment[] {
  const index = locale === "hr" ? 0 : 1;
  return seeds.map((item) => ({ ...item, title: item.title[index], description: item.description[index], favorite: false, completedDates: [] }));
}

export function matchingBeautifulMoments(moments: BeautifulMoment[], preferences: MomentPreferences) {
  const energyRank = { low: 0, steady: 1, high: 2 } as const;
  const feelingMatchCount = (moment: BeautifulMoment) => preferences.feelings.filter((feeling) => (feelingSignals[normalizeFeeling(feeling)] || [feeling]).some((signal) => moment.feelings.includes(signal))).length;
  return moments.filter((moment) => {
    const requiredFeelingMatches = preferences.feelings.length <= 1 ? preferences.feelings.length : Math.ceil(preferences.feelings.length / 2);
    if (feelingMatchCount(moment) < requiredFeelingMatches) return false;
    if (preferences.maxMinutes > 0 && moment.duration > preferences.maxMinutes) return false;
    if (preferences.maxBudget >= 0 && moment.budget > preferences.maxBudget) return false;
    if (preferences.energy && energyRank[moment.energy] > energyRank[preferences.energy]) return false;
    if (preferences.setting && moment.setting !== "either" && moment.setting !== preferences.setting) return false;
    if (preferences.badWeatherOnly && !moment.badWeather) return false;
    if (preferences.condition === "gentle" && moment.energy === "high") return false;
    if (preferences.condition === "rest" && moment.energy !== "low") return false;
    return true;
  }).sort((a, b) => feelingMatchCount(b) - feelingMatchCount(a) || Number(b.favorite) - Number(a.favorite) || a.duration - b.duration);
}
