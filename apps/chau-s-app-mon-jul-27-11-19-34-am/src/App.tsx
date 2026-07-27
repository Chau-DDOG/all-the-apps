import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { getWeather, type WeatherSnapshot } from "./weather.backend";

const sampleWeather: WeatherSnapshot = {
  location: "Brooklyn, NY",
  zipCode: "11201",
  observedAt: "2026-07-27T11:20",
  temperature: 78,
  feelsLike: 81,
  humidity: 64,
  windSpeed: 8,
  precipitation: 0,
  condition: "Partly cloudy",
  weatherCode: 2,
  isDay: true,
  high: 84,
  low: 70,
  rainChance: 18,
  sunrise: "2026-07-27T05:50",
  sunset: "2026-07-27T20:16",
};

type IconName = "cloudSun" | "droplet" | "location" | "search" | "sun" | "wind";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    cloudSun: (
      <>
        <path d="M8 7.5a5 5 0 0 1 9.4 2.4A4.5 4.5 0 1 1 17.5 19H7a4 4 0 1 1 1-7.9" />
        <path d="M4.5 7.5 3 6m6-2V2m4.5 5.5L15 6M4 12H2" />
      </>
    ),
    droplet: (
      <path d="M12 2S6.5 8.4 6.5 13a5.5 5.5 0 0 0 11 0C17.5 8.4 12 2 12 2Z" />
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19" />
      </>
    ),
    wind: <path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a2 2 0 1 1-2 2M3 16h9" />,
  };
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function formatTime(dateTime: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateTime));
}

function getWardrobe(weather: WeatherSnapshot) {
  const layers: string[] = [];
  const extras: string[] = [];
  let headline = "Keep it light and comfortable";
  let summary =
    "Breathable pieces will keep you comfortable throughout the day.";

  if (weather.feelsLike <= 35) {
    headline = "Bundle up from head to toe";
    summary = "Insulating layers and covered skin are essential in this cold.";
    layers.push("thermal base", "heavy coat", "warm trousers");
    extras.push("gloves", "beanie", "scarf");
  } else if (weather.feelsLike <= 52) {
    headline = "Layer up for a cool day";
    summary =
      "A warm outer layer will make the cooler air feel much more comfortable.";
    layers.push("long-sleeve top", "sweater", "medium jacket");
    extras.push("closed-toe shoes");
  } else if (weather.feelsLike <= 67) {
    headline = "Bring one easy layer";
    summary = "Mild conditions call for light layers you can add or remove.";
    layers.push("cotton tee", "light jacket", "jeans or chinos");
    extras.push("comfortable sneakers");
  } else if (weather.feelsLike >= 88) {
    headline = "Dress for the heat";
    summary = "Loose, breathable fabrics and sun protection are your best bet.";
    layers.push("linen or cotton top", "lightweight shorts");
    extras.push("sun hat", "water bottle");
  } else {
    layers.push("breathable tee", "lightweight bottoms");
    extras.push("comfortable sneakers");
  }

  if (weather.rainChance >= 35 || weather.precipitation > 0) {
    extras.unshift("compact umbrella");
    layers.push("water-resistant shell");
    summary += " Keep rain protection close by.";
  }
  if (weather.windSpeed >= 18) {
    extras.push("wind-resistant layer");
  }
  if (weather.isDay) {
    extras.push("sunglasses");
  }

  return { headline, summary, layers, extras: [...new Set(extras)] };
}

function App() {
  const [zipCode, setZipCode] = useState("11201");
  const [weather, setWeather] = useState(sampleWeather);
  const weatherMutation = useMutation({
    mutationFn: getWeather,
    onSuccess: setWeather,
  });
  const wardrobe = getWardrobe(weather);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (/^\d{5}$/.test(zipCode)) {
      weatherMutation.mutate(zipCode);
    }
  };

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="cloudSun" />
          </span>
          <span>
            <strong>Weather & Wear</strong>
            <small>Your daily forecast, styled</small>
          </span>
        </div>
        <span className="today">MONDAY · JULY 27</span>
        <span className="units">°F</span>
      </header>

      <section className="hero">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-content">
          <span className="eyebrow">DRESS READY FOR YOUR DAY</span>
          <h1>
            Step outside
            <br />
            with confidence.
          </h1>
          <p>
            Local weather and a thoughtful outfit recommendation, all from your
            ZIP code.
          </p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="zip">
              <Icon name="location" />
              <span>ZIP CODE</span>
            </label>
            <div className="search-field">
              <input
                id="zip"
                aria-label="US ZIP code"
                inputMode="numeric"
                maxLength={5}
                onChange={(event) =>
                  setZipCode(event.target.value.replace(/\D/g, ""))
                }
                pattern="\d{5}"
                placeholder="Enter ZIP code"
                value={zipCode}
              />
              <button
                disabled={weatherMutation.isPending || zipCode.length !== 5}
                type="submit"
              >
                {weatherMutation.isPending ? (
                  "Checking…"
                ) : (
                  <>
                    <Icon name="search" /> Check weather
                  </>
                )}
              </button>
            </div>
            {weatherMutation.isError && (
              <p className="form-error" role="alert">
                {weatherMutation.error instanceof Error
                  ? weatherMutation.error.message
                  : "Unable to load this forecast."}
              </p>
            )}
          </form>
          <div className="quick-links">
            <span>TRY</span>
            {["10001", "60601", "94105"].map((zip) => (
              <button key={zip} onClick={() => setZipCode(zip)}>
                {zip}
              </button>
            ))}
          </div>
        </div>

        <div className="weather-glance">
          <div className="glance-location">
            <Icon name="location" />
            <span>
              {weather.location}
              <small>{weather.zipCode}</small>
            </span>
          </div>
          <div className="current-weather">
            <Icon name="cloudSun" />
            <strong>{Math.round(weather.temperature)}°</strong>
            <span>
              {weather.condition}
              <small>Feels like {Math.round(weather.feelsLike)}°</small>
            </span>
          </div>
          <div className="glance-stats">
            <div>
              <Icon name="droplet" />
              <span>
                <small>HUMIDITY</small>
                <strong>{weather.humidity}%</strong>
              </span>
            </div>
            <div>
              <Icon name="wind" />
              <span>
                <small>WIND</small>
                <strong>{Math.round(weather.windSpeed)} mph</strong>
              </span>
            </div>
            <div>
              <span className="rain-icon">⌁</span>
              <span>
                <small>RAIN</small>
                <strong>{weather.rainChance}%</strong>
              </span>
            </div>
          </div>
          <div className="high-low">
            <span>H: {Math.round(weather.high)}°</span>
            <i />
            <span>L: {Math.round(weather.low)}°</span>
          </div>
        </div>
      </section>

      <section className="dashboard">
        <div className="section-intro">
          <span className="eyebrow dark">TODAY&apos;S EDIT</span>
          <h2>Your weather-ready look</h2>
          <p>
            Built around how it actually feels outside—not just the number on
            the thermometer.
          </p>
        </div>

        <div className="cards">
          <article className="outfit-card">
            <div className="outfit-visual" aria-hidden="true">
              <div className="hanger">⌒</div>
              <div className="shirt">
                <i />
                <span />
              </div>
              <div className="pants">
                <i />
                <i />
              </div>
              <div className="shoe">◒</div>
              <div className="sun-badge">
                <Icon name="sun" />
              </div>
            </div>
            <div className="outfit-copy">
              <span className="recommendation-label">OUR RECOMMENDATION</span>
              <h3>{wardrobe.headline}</h3>
              <p>{wardrobe.summary}</p>
              <div className="wardrobe-list">
                <div>
                  <small>WEAR</small>
                  {wardrobe.layers.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div>
                  <small>BRING</small>
                  {wardrobe.extras.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <aside className="details-card">
            <div className="details-heading">
              <span>DAY AT A GLANCE</span>
              <small>Local time</small>
            </div>
            <div className="temperature-range">
              <div>
                <small>MORNING</small>
                <strong>{Math.round(weather.low + 3)}°</strong>
                <span>Cool start</span>
              </div>
              <div className="peak">
                <small>AFTERNOON</small>
                <strong>{Math.round(weather.high)}°</strong>
                <span>Day&apos;s peak</span>
              </div>
              <div>
                <small>EVENING</small>
                <strong>{Math.round((weather.high + weather.low) / 2)}°</strong>
                <span>Cooling down</span>
              </div>
            </div>
            <div className="sun-times">
              <div>
                <Icon name="sun" />
                <span>
                  <small>SUNRISE</small>
                  <strong>{formatTime(weather.sunrise)}</strong>
                </span>
              </div>
              <div>
                <span className="sunset-icon">◒</span>
                <span>
                  <small>SUNSET</small>
                  <strong>{formatTime(weather.sunset)}</strong>
                </span>
              </div>
            </div>
            <p className="updated">
              Forecast observed at {formatTime(weather.observedAt)} · Weather
              data by Open-Meteo
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default App;
