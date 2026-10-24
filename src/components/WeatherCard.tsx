import { CloudSun, MapPin, SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";
import { useLanguage } from "./LanguageContext";

type Weather = { temperature: number; high: number; low: number; code: number; place: string };
type ForecastResponse = { current: { temperature_2m: number; weather_code: number }; daily: { temperature_2m_max: number[]; temperature_2m_min: number[] } };
type GeocodingResponse = { results?: Array<{ latitude: number; longitude: number; name: string; country?: string }> };
const weatherLabel = (code: number, hr: boolean) => code === 0 ? (hr ? "Vedro" : "Clear") : code <= 3 ? (hr ? "Djelomice oblačno" : "Partly cloudy") : code <= 48 ? (hr ? "Magla" : "Foggy") : code <= 67 ? (hr ? "Kiša" : "Rain") : code <= 77 ? (hr ? "Snijeg" : "Snow") : code <= 82 ? (hr ? "Pljuskovi" : "Showers") : code <= 99 ? (hr ? "Nevrijeme" : "Storms") : (hr ? "Vrijeme nije dostupno" : "Conditions unavailable");

export default function WeatherCard({ onWeatherChange }: { onWeatherChange?: (code: number) => void }) {
  const { locale } = useLanguage();
  const hr = locale === "hr";
  const [weather, setWeather] = useState<Weather | null>(null);
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const loadForecast = async (latitude: number, longitude: number, place: string) => {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), current: "temperature_2m,weather_code", daily: "temperature_2m_max,temperature_2m_min", timezone: "auto", forecast_days: "1" }).toString();
    const response = await fetch(url);
    if (!response.ok) throw new Error("forecast");
    const data = await response.json() as ForecastResponse;
    setWeather({ temperature: Math.round(data.current.temperature_2m), high: Math.round(data.daily.temperature_2m_max[0]), low: Math.round(data.daily.temperature_2m_min[0]), code: data.current.weather_code, place });
    onWeatherChange?.(data.current.weather_code);
    setStatus("idle");
  };

  const loadLocation = () => {
    if (!navigator.geolocation) { setStatus("error"); return; }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => loadForecast(coords.latitude, coords.longitude, hr ? "Tvoja trenutna lokacija" : "Your current area").catch(() => setStatus("error")),
      () => setStatus("error"),
      { timeout: 10000, maximumAge: 900000 },
    );
  };

  const loadCity = async (event: FormEvent) => {
    event.preventDefault();
    if (!city.trim()) return;
    setStatus("loading");
    try {
      const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
      url.search = new URLSearchParams({ name: city.trim(), count: "1", language: locale, format: "json" }).toString();
      const response = await fetch(url);
      if (!response.ok) throw new Error("geocoding");
      const data = await response.json() as GeocodingResponse;
      const result = data.results?.[0];
      if (!result) throw new Error("city");
      await loadForecast(result.latitude, result.longitude, [result.name, result.country].filter(Boolean).join(", "));
    } catch { setStatus("error"); }
  };

  return (
    <section className="weatherCard card" aria-live="polite">
      <div className="weatherIcon"><CloudSun size={32} weight="duotone" /></div>
      {weather ? <>
        <div><div className="sectionLabel">{hr ? "DANAŠNJE VRIJEME · UŽIVO" : "TODAY’S WEATHER · LIVE"}</div><h2>{weatherLabel(weather.code, hr)}</h2><p><MapPin size={15} /> {weather.place}</p></div>
        <div className="temperature"><strong>{weather.temperature}°</strong><span>{weather.low}° / {weather.high}°C</span></div>
      </> : <>
        <div><div className="sectionLabel">{hr ? "DANAŠNJE VRIJEME" : "TODAY’S WEATHER"}</div><h2>{status === "error" ? (hr ? "Lokacija nije dostupna? Upiši grad." : "Location unavailable? Enter a city.") : (hr ? "Planiraj sa svojim danom." : "Plan with your day.")}</h2><p>{status === "error" ? <><WarningCircle size={15} /> {hr ? "Dopuštenje za lokaciju možda je isključeno. Vrijeme možeš dohvatiti i bez njega." : "Location permission may be off. You can still get the weather without it."}</> : (hr ? "Dopusti lokaciju ili jednostavno upiši grad." : "Allow location or simply enter a city.")}</p></div>
        <div className="weatherActions">
          <button onClick={loadLocation} disabled={status === "loading"}>{status === "loading" ? <><SpinnerGap className="spin" /> {hr ? "Učitavam…" : "Loading…"}</> : (hr ? "Koristi moju lokaciju" : "Use my location")}</button>
          <form onSubmit={loadCity}><input aria-label={hr ? "Grad za vremensku prognozu" : "City for weather"} value={city} onChange={(event) => setCity(event.target.value)} placeholder={hr ? "npr. Zagreb" : "e.g. Zagreb"} /><button className="primary" disabled={!city.trim() || status === "loading"}>{hr ? "Prikaži" : "Show"}</button></form>
        </div>
      </>}
    </section>
  );
}
