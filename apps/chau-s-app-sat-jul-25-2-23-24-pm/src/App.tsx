import { useQuery } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useState } from "react";

import { getWeatherForecast } from "./weather.backend";

type WeatherVisual = {
  label: string;
  icon: ReactNode;
};

const weatherIcons = {
  sun: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="12" />
      <path d="M32 5v10M32 49v10M5 32h10M49 32h10M13 13l7 7M44 44l7 7M51 13l-7 7M20 44l-7 7" />
    </svg>
  ),
  cloud: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 49h30a10 10 0 0 0 1-20 17 17 0 0 0-33-3A12 12 0 0 0 18 49Z" />
    </svg>
  ),
  rain: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 40h30a10 10 0 0 0 1-20 17 17 0 0 0-33-3A12 12 0 0 0 18 40Z" />
      <path d="m22 48-3 8M34 48l-3 8M46 48l-3 8" />
    </svg>
  ),
  snow: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 38h30a10 10 0 0 0 1-20 17 17 0 0 0-33-3A12 12 0 0 0 18 38Z" />
      <path d="M22 47v10M17 52h10M40 47v10M35 52h10" />
    </svg>
  ),
  storm: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 38h30a10 10 0 0 0 1-20 17 17 0 0 0-33-3A12 12 0 0 0 18 38Z" />
      <path className="fill" d="m34 41-8 12h7l-3 9 11-14h-7l5-7Z" />
    </svg>
  ),
};

function getWeatherVisual(code: number): WeatherVisual {
  if (code === 0) return { label: "Clear skies", icon: weatherIcons.sun };
  if (code <= 3) return { label: "Partly cloudy", icon: weatherIcons.cloud };
  if (code <= 48) return { label: "Foggy", icon: weatherIcons.cloud };
  if (code <= 67 || (code >= 80 && code <= 82)) {
    return { label: "Rain showers", icon: weatherIcons.rain };
  }
  if (code <= 77 || code === 85 || code === 86)
    return { label: "Snow showers", icon: weatherIcons.snow };
  return { label: "Thunderstorms", icon: weatherIcons.storm };
}

function formatDay(date: string, index: number) {
  if (index === 0) return "Today";
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function App() {
  const [zipcode, setZipcode] = useState("94107");
  const [submittedZip, setSubmittedZip] = useState("94107");
  const [validationError, setValidationError] = useState("");
  const forecastQuery = useQuery({
    queryKey: ["weather", submittedZip],
    queryFn: () => getWeatherForecast(submittedZip),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{5}$/.test(zipcode)) {
      setValidationError("Enter a valid 5-digit US ZIP code.");
      return;
    }
    setValidationError("");
    setSubmittedZip(zipcode);
  }

  const forecast = forecastQuery.data;
  const currentVisual = forecast
    ? getWeatherVisual(forecast.current.weatherCode)
    : null;

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Weatherwear home">
          <span className="brand-mark">
            <span />
            <span />
          </span>
          Weatherwear
        </a>
        <span className="forecast-badge">5-day forecast</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Forecast your fit</p>
          <h1>
            Dress for the day,
            <br />
            whatever the weather.
          </h1>
          <p className="intro">
            Local weather and practical outfit ideas, thoughtfully paired for
            your ZIP code.
          </p>
        </div>
        <form className="search-card" onSubmit={handleSubmit}>
          <label htmlFor="zipcode">Where are you heading?</label>
          <div className="search-row">
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
                <circle cx="12" cy="10" r="2" />
              </svg>
              <input
                id="zipcode"
                inputMode="numeric"
                maxLength={5}
                value={zipcode}
                onChange={(event) =>
                  setZipcode(event.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter ZIP code"
                aria-describedby="zipcode-help"
              />
            </div>
            <button type="submit" disabled={forecastQuery.isFetching}>
              {forecastQuery.isFetching ? "Checking…" : "Show my forecast"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <p
            id="zipcode-help"
            className={validationError ? "form-help error" : "form-help"}
          >
            {validationError ||
              "US ZIP codes · Weather data refreshed on request"}
          </p>
        </form>
      </section>

      {forecastQuery.isLoading && (
        <section className="loading-state" aria-live="polite">
          <span className="loader" />
          <p>Looking at the skies and your closet…</p>
        </section>
      )}

      {forecastQuery.isError && (
        <section className="error-state" role="alert">
          <p className="eyebrow">Forecast unavailable</p>
          <h2>We could not read the weather there.</h2>
          <p>
            {forecastQuery.error instanceof Error
              ? forecastQuery.error.message
              : "Try another ZIP code in a moment."}
          </p>
        </section>
      )}

      {forecast && currentVisual && (
        <div className="forecast-content">
          <section className="today-grid">
            <article className="current-card">
              <div className="card-heading">
                <div>
                  <p className="eyebrow">Right now</p>
                  <h2>
                    {forecast.location.city}, {forecast.location.state}
                  </h2>
                </div>
                <span className="zipcode">{forecast.location.zipcode}</span>
              </div>
              <div className="current-weather">
                <div className="weather-icon large">{currentVisual.icon}</div>
                <div>
                  <div className="temperature">
                    {Math.round(forecast.current.temperature)}
                    <sup>°</sup>
                  </div>
                  <p>{currentVisual.label}</p>
                </div>
              </div>
              <div className="weather-details">
                <span>
                  Feels like{" "}
                  <strong>{Math.round(forecast.current.feelsLike)}°</strong>
                </span>
                <span>
                  Today's high{" "}
                  <strong>{Math.round(forecast.days[0].high)}°</strong>
                </span>
                <span>
                  Rain <strong>{forecast.days[0].precipitationChance}%</strong>
                </span>
              </div>
            </article>

            <article className="outfit-card">
              <div className="outfit-title">
                <div className="hanger-icon" aria-hidden="true">
                  <svg viewBox="0 0 64 64">
                    <path d="M27 17a6 6 0 1 1 7 6v5l22 15a4 4 0 0 1-2 7H10a4 4 0 0 1-2-7l19-13" />
                  </svg>
                </div>
                <div>
                  <p className="eyebrow">Your outfit forecast</p>
                  <h2>{forecast.clothing.headline}</h2>
                </div>
              </div>
              <p className="outfit-summary">{forecast.clothing.summary}</p>
              <div className="suggestion-columns">
                <div>
                  <h3>Build your look</h3>
                  <ul>
                    {forecast.clothing.layers.map((layer) => (
                      <li key={layer}>{layer}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Bring along</h3>
                  <ul>
                    {forecast.clothing.extras.map((extra) => (
                      <li key={extra}>{extra}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </section>

          <section className="week-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">The week ahead</p>
                <h2>Plan a few looks ahead</h2>
              </div>
              <p>High / Low</p>
            </div>
            <div className="day-grid">
              {forecast.days.map((day, index) => {
                const visual = getWeatherVisual(day.weatherCode);
                return (
                  <article className="day-card" key={day.date}>
                    <h3>{formatDay(day.date, index)}</h3>
                    <div className="weather-icon">{visual.icon}</div>
                    <p className="day-condition">{visual.label}</p>
                    <p className="day-temp">
                      <strong>{Math.round(day.high)}°</strong>
                      <span>{Math.round(day.low)}°</span>
                    </p>
                    <p className="rain-chance">
                      <span aria-hidden="true">●</span>
                      {day.precipitationChance}% rain
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      <footer>
        <p>
          Weather data from Open-Meteo · Outfit guidance based on feels-like
          conditions
        </p>
        <p>
          Updated{" "}
          {forecast
            ? new Date(forecast.updatedAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })
            : "when you search"}
        </p>
      </footer>
    </main>
  );
}

export default App;
