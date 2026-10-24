import { CloudSun, MapPin, SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";

type Weather = { temperature: number; high: number; low: number; code: number; place: string };
const weatherLabel = (code: number) => code === 0 ? "Clear" : code <= 3 ? "Partly cloudy" : code <= 48 ? "Foggy" : code <= 67 ? "Rain" : code <= 77 ? "Snow" : code <= 82 ? "Showers" : code <= 99 ? "Storms" : "Conditions unavailable";

export default function WeatherCard() {
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
        setWeather({ temperature: Math.round(data.current.temperature_2m), high: Math.round(data.daily.temperature_2m_max[0]), low: Math.round(data.daily.temperature_2m_min[0]), code: data.current.weather_code, place: "Your current area" });
        setStatus("idle");
      } catch { setStatus("error"); }
    }, () => setStatus("error"), { timeout: 10000, maximumAge: 900000 });
  };
  return (
    <section className="weatherCard card" aria-live="polite">
      <div className="weatherIcon"><CloudSun size={32} weight="duotone" /></div>
      {weather ? <>
        <div><div className="sectionLabel">TODAY’S WEATHER · LIVE</div><h2>{weatherLabel(weather.code)}</h2><p><MapPin size={15} /> {weather.place}</p></div>
        <div className="temperature"><strong>{weather.temperature}°</strong><span>{weather.low}° / {weather.high}°C</span></div>
      </> : <>
        <div><div className="sectionLabel">TODAY’S WEATHER</div><h2>{status === "error" ? "Weather unavailable" : "Plan with the day, not against it."}</h2><p>{status === "error" ? <><WarningCircle size={15} /> Location or weather service could not be reached.</> : "Use your location to load real conditions. Nothing is guessed."}</p></div>
        <button onClick={load} disabled={status === "loading"}>{status === "loading" ? <><SpinnerGap className="spin" /> Loading…</> : "Show real weather"}</button>
      </>}
    </section>
  );
}
