import { CloudSun, MapPin, SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { useLanguage } from "./LanguageContext";

type Weather = { temperature: number; high: number; low: number; code: number; place: string };
const weatherLabel = (code: number, hr: boolean) => code === 0 ? (hr ? "Vedro" : "Clear") : code <= 3 ? (hr ? "Djelomice oblačno" : "Partly cloudy") : code <= 48 ? (hr ? "Magla" : "Foggy") : code <= 67 ? (hr ? "Kiša" : "Rain") : code <= 77 ? (hr ? "Snijeg" : "Snow") : code <= 82 ? (hr ? "Pljuskovi" : "Showers") : code <= 99 ? (hr ? "Nevrijeme" : "Storms") : (hr ? "Vrijeme nije dostupno" : "Conditions unavailable");

export default function WeatherCard() {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const [weather, setWeather] = useState<Weather | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const load = () => {
    if (!navigator.geolocation) { setStatus("error"); return; }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.search = new URLSearchParams({ latitude: String(coords.latitude), longitude: String(coords.longitude), current: "temperature_2m,weather_code", daily: "temperature_2m_max,temperature_2m_min", timezone: "auto", forecast_days: "1" }).toString();
        const response = await fetch(url);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setWeather({ temperature: Math.round(data.current.temperature_2m), high: Math.round(data.daily.temperature_2m_max[0]), low: Math.round(data.daily.temperature_2m_min[0]), code: data.current.weather_code, place: hr ? "Tvoja trenutna lokacija" : "Your current area" });
        setStatus("idle");
      } catch { setStatus("error"); }
    }, () => setStatus("error"), { timeout: 10000, maximumAge: 900000 });
  };
  return (
    <section className="weatherCard card" aria-live="polite">
      <div className="weatherIcon"><CloudSun size={32} weight="duotone" /></div>
      {weather ? <>
        <div><div className="sectionLabel">{hr ? "DANAŠNJE VRIJEME · UŽIVO" : "TODAY’S WEATHER · LIVE"}</div><h2>{weatherLabel(weather.code, hr)}</h2><p><MapPin size={15} /> {weather.place}</p></div>
        <div className="temperature"><strong>{weather.temperature}°</strong><span>{weather.low}° / {weather.high}°C</span></div>
      </> : <>
        <div><div className="sectionLabel">{hr ? "DANAŠNJE VRIJEME" : "TODAY’S WEATHER"}</div><h2>{status === "error" ? (hr ? "Vrijeme trenutačno nije dostupno" : "Weather is unavailable right now") : (hr ? "Planiraj sa svojim danom." : "Plan with your day.")}</h2><p>{status === "error" ? <><WarningCircle size={15} /> {hr ? "Nismo uspjeli dohvatiti lokaciju ili podatke o vremenu." : "We could not reach your location or the weather service."}</> : (hr ? "Uz tvoje dopuštenje prikazat ćemo stvarne uvjete. Ništa ne pretpostavljamo." : "With your permission, we’ll show real conditions. Nothing is guessed.")}</p></div>
        <button onClick={load} disabled={status === "loading"}>{status === "loading" ? <><SpinnerGap className="spin" /> {hr ? "Učitavam…" : "Loading…"}</> : (hr ? "Prikaži stvarno vrijeme" : "Show real weather")}</button>
      </>}
    </section>
  );
}
