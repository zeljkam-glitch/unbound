export type Season = "winter" | "spring" | "summer" | "autumn";
export type SeasonLocale = "hr" | "en";

const months = {
  hr: [
    ["Siječanj", "Počni s manje, ali bliže sebi.", "Raščisti jednu malu površinu", "Skuhaj nešto što grije", "Zapiši što ove godine ne moraš nositi"],
    ["Veljača", "Čuvaj energiju prije nego stigne proljeće.", "Pronađi svjetlo usred dana", "Javi se osobi uz koju možeš biti svoja", "Dovrši jednu tihu, važnu stvar"],
    ["Ožujak", "Primijeti što se polako vraća.", "Otvori prozor i prošetaj bez cilja", "Posadi ili unesi nešto zeleno", "Vrati jednu ideju koja je čekala"],
    ["Travanj", "Ostavi mjesta za promjenu vremena i planova.", "Planiraj dan s rezervnim putem", "Potraži boju koja ti je nedostajala", "Provedi dvadeset minuta vani"],
    ["Svibanj", "Slijedi ono što te nježno izvodi van.", "Dogovori susret na otvorenom", "Ponesi bilježnicu u park", "Odaberi jedno mjesto za mali bijeg"],
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

export function seasonForMonth(month: number): Season {
  if (month === 11 || month <= 1) return "winter";
  if (month <= 4) return "spring";
  if (month <= 7) return "summer";
  return "autumn";
}

export function seasonalContext(date = new Date(), locale: SeasonLocale = "en") {
  const monthIndex = date.getMonth();
  const [month, theme, ...ideas] = months[locale][monthIndex];
  const season = seasonForMonth(monthIndex);
  return { month, monthIndex, season, seasonName: seasonNames[locale][season], theme, ideas };
}
