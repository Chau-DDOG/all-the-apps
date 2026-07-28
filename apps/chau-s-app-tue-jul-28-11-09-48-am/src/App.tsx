import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getMadridForecast, type DayForecast } from "./weather.backend";
import "./styles.css";

const WMO_CODES: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "☀️", label: "Clear sky" },
  1: { emoji: "🌤️", label: "Mainly clear" },
  2: { emoji: "⛅", label: "Partly cloudy" },
  3: { emoji: "☁️", label: "Overcast" },
  45: { emoji: "🌫️", label: "Foggy" },
  48: { emoji: "🌫️", label: "Icy fog" },
  51: { emoji: "🌦️", label: "Light drizzle" },
  53: { emoji: "🌦️", label: "Drizzle" },
  55: { emoji: "🌧️", label: "Heavy drizzle" },
  61: { emoji: "🌧️", label: "Light rain" },
  63: { emoji: "🌧️", label: "Rain" },
  65: { emoji: "🌧️", label: "Heavy rain" },
  71: { emoji: "🌨️", label: "Light snow" },
  73: { emoji: "❄️", label: "Snow" },
  75: { emoji: "❄️", label: "Heavy snow" },
  77: { emoji: "🌨️", label: "Snow grains" },
  80: { emoji: "🌦️", label: "Light showers" },
  81: { emoji: "🌧️", label: "Showers" },
  82: { emoji: "⛈️", label: "Heavy showers" },
  85: { emoji: "🌨️", label: "Snow showers" },
  86: { emoji: "❄️", label: "Heavy snow showers" },
  95: { emoji: "⛈️", label: "Thunderstorm" },
  96: { emoji: "⛈️", label: "Storm + hail" },
  99: { emoji: "⛈️", label: "Severe storm" },
};

function getWeather(code: number) {
  return WMO_CODES[code] ?? { emoji: "🌤️", label: "Variable" };
}

function isWetCode(code: number) {
  return [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);
}

function getHeatClass(temp: number) {
  if (temp >= 40) return "heat-extreme";
  if (temp >= 35) return "heat-veryhot";
  if (temp >= 30) return "heat-hot";
  if (temp >= 25) return "heat-warm";
  if (temp >= 18) return "heat-mild";
  return "heat-cool";
}

function getOutfitTip(day: DayForecast): string {
  const parts: string[] = [];
  if (day.tempMax >= 38) {
    parts.push("ultra-light top + shorts");
  } else if (day.tempMax >= 32) {
    parts.push("breathable top + shorts/dress");
  } else if (day.tempMax >= 26) {
    parts.push("light layers");
  } else {
    parts.push("light jacket");
  }
  if (day.uvIndexMax >= 8) parts.push("SPF 50+");
  else if (day.uvIndexMax >= 5) parts.push("sunscreen");
  if (day.precipProbMax >= 40) parts.push("umbrella");
  return parts.join(" · ");
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return {
    dow: d.toLocaleDateString("en-US", { weekday: "short" }),
    short: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

const TRIP_START = new Date("2026-08-04T12:00:00");
const TRIP_END = new Date("2026-08-17T12:00:00");

function isTripDay(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d >= TRIP_START && d <= TRIP_END;
}

function uvClass(uv: number) {
  if (uv >= 11) return "uv-extreme";
  if (uv >= 8) return "uv-veryhigh";
  if (uv >= 6) return "uv-high";
  return "uv-moderate";
}

function DayCard({ day }: { day: DayForecast }) {
  const w = getWeather(day.weatherCode);
  const { dow, short } = formatDate(day.date);
  const trip = isTripDay(day.date);

  return (
    <article className={`day-card ${getHeatClass(day.tempMax)}${trip ? " trip-day" : ""}`}>
      {trip && (
        <div className="trip-badge" title="Your trip day">
          ✈️
        </div>
      )}
      <div className="day-card-top">
        <span className="dow">{dow}</span>
        <span className="day-label">{short}</span>
      </div>
      <div className="wx-emoji" role="img" aria-label={w.label}>
        {w.emoji}
      </div>
      <div className="temps">
        <span className="t-max">{Math.round(day.tempMax)}°</span>
        <span className="t-sep">/</span>
        <span className="t-min">{Math.round(day.tempMin)}°</span>
      </div>
      <p className="wx-label">{w.label}</p>
      <div className="day-pills">
        {day.precipProbMax > 5 && (
          <span className="pill pill-rain">💧 {day.precipProbMax}%</span>
        )}
        {day.uvIndexMax >= 3 && (
          <span className={`pill ${uvClass(day.uvIndexMax)}`}>
            UV {Math.round(day.uvIndexMax)}
          </span>
        )}
      </div>
      <p className="outfit">{getOutfitTip(day)}</p>
    </article>
  );
}

function groupByWeek(days: DayForecast[]): DayForecast[][] {
  const weeks: DayForecast[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function ForecastTab({ days }: { days: DayForecast[] }) {
  const weeks = groupByWeek(days);
  const weekLabels = ["Week 1", "Week 2", "Week 3"];

  return (
    <div className="forecast-tab">
      {weeks.map((week, wi) => {
        const label = weekLabels[wi] ?? `Week ${wi + 1}`;
        const from = formatDate(week[0].date).short;
        const to = formatDate(week[week.length - 1].date).short;
        return (
          <section key={label} className="week-section">
            <h2 className="week-heading">
              <span className="week-label">{label}</span>
              <span className="week-range">
                {from} – {to}
              </span>
            </h2>
            <div className="days-grid">
              {week.map((day) => (
                <DayCard key={day.date} day={day} />
              ))}
            </div>
          </section>
        );
      })}
      {days.length < 21 && (
        <p className="forecast-caveat">
          Forecast covers {days.length} days (Open-Meteo free tier limit).
          Days beyond the window use typical Madrid August conditions for the
          packing list. ✈️ marks your Aug 4–17 trip days.
        </p>
      )}
      <p className="forecast-credit">
        Weather data by{" "}
        <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">
          Open-Meteo
        </a>
      </p>
    </div>
  );
}

interface PackingItem {
  name: string;
  qty?: string;
  note?: string;
}

interface PackingCategory {
  icon: string;
  title: string;
  items: PackingItem[];
}

function buildPackingList(tripDays: DayForecast[]): PackingCategory[] {
  const maxTemp =
    tripDays.length > 0
      ? Math.max(...tripDays.map((d) => d.tempMax))
      : 36;
  const maxUV =
    tripDays.length > 0
      ? Math.max(...tripDays.map((d) => d.uvIndexMax))
      : 10;
  const hasRain =
    tripDays.some((d) => d.precipProbMax >= 30 || isWetCode(d.weatherCode));
  const isScorching = maxTemp >= 35;

  return [
    {
      icon: "👕",
      title: "Clothing",
      items: [
        {
          name: "Lightweight t-shirts / tops",
          qty: "7",
          note: "Light colours deflect heat",
        },
        { name: "Shorts", qty: "4" },
        {
          name: "Light dress or linen trousers",
          qty: "2",
          note: "Evenings out",
        },
        {
          name: isScorching ? "Ultra-light cardigan (for AC)" : "Light cardigan / jacket",
          qty: "1",
          note: "Madrid restaurants are heavily air-conditioned",
        },
        { name: "Swimwear", qty: "2" },
        { name: "Underwear", qty: "7" },
        { name: "Socks", qty: "7 pairs" },
        { name: "Pyjamas / sleep shorts" },
        ...(isScorching
          ? [{ name: "Handheld fan (abanico)", note: "Madrid summer essential!" }]
          : []),
      ],
    },
    {
      icon: "👟",
      title: "Footwear",
      items: [
        {
          name: "Comfortable walking shoes / trainers",
          note: "Madrid has cobblestones — comfort over style",
        },
        { name: "Sandals or flip-flops" },
        { name: "Smart casual shoes", note: "Evenings in Malasaña or La Latina" },
      ],
    },
    {
      icon: "🧴",
      title: "Sun & Skin Care",
      items: [
        {
          name: "SPF 50+ sunscreen",
          qty: "2 bottles",
          note:
            maxUV >= 10
              ? "UV is EXTREME — reapply every 2 h"
              : "UV is very high — reapply often",
        },
        { name: "SPF lip balm" },
        { name: "After-sun lotion / aloe vera gel" },
        { name: "Moisturiser (SPF optional)" },
        { name: "Sunglasses (UV400+)", note: "Essential, not optional" },
        { name: "Wide-brim hat or cap" },
        ...(isScorching ? [{ name: "Facial cooling mist spray" }] : []),
      ],
    },
    ...(hasRain
      ? [
          {
            icon: "🌂",
            title: "Rain Protection",
            items: [
              {
                name: "Compact travel umbrella",
                note: "Afternoon storms are common in August",
              },
              {
                name: "Light waterproof jacket",
                note: "Also doubles as an AC layer indoors",
              },
            ],
          },
        ]
      : []),
    {
      icon: "🎒",
      title: "Bag & Tech",
      items: [
        {
          name: "Day backpack or crossbody bag",
          note: "Anti-pickpocket closure preferred",
        },
        { name: "Power bank (10 000 mAh+)" },
        {
          name: "Type C / F plug adapter",
          note: "Spain uses the standard European round-pin plug",
        },
        { name: "Charging cables & wall charger" },
        {
          name: "Reusable water bottle",
          note: "Drink 3 L / day in the heat — Madrid tap water is fine",
        },
        { name: "Headphones / earbuds" },
      ],
    },
    {
      icon: "🗂️",
      title: "Documents & Money",
      items: [
        { name: "Passport or national ID", note: "Keep a photo backup on your phone" },
        { name: "Travel insurance card / policy number" },
        {
          name: "Credit & debit cards (Visa / Mastercard)",
          note: "Widely accepted everywhere",
        },
        { name: "Cash (euros)", note: "€50–100 for markets & small shops" },
        { name: "Accommodation confirmation" },
        { name: "Emergency contacts list" },
      ],
    },
    {
      icon: "💊",
      title: "Health & Wellbeing",
      items: [
        {
          name: "Prescription medications",
          note: "Pack extra — Spanish pharmacies may not stock your brand",
        },
        { name: "Pain relievers (ibuprofen / paracetamol)" },
        { name: "Antihistamines", note: "For AC-related reactions or pollen" },
        { name: "Oral rehydration sachets", note: "Crucial in extreme heat" },
        { name: "Antidiarrheal medication" },
        {
          name: "Blister plasters",
          note: "Madrid cobblestones + heat = blisters guaranteed",
        },
        { name: "Small first aid kit" },
        { name: "Hand sanitiser" },
      ],
    },
    {
      icon: "🗺️",
      title: "Madrid Must-Haves",
      items: [
        {
          name: "Madrid Metro app / 12-trip card",
          note: "Cheapest way to get around the city",
        },
        {
          name: "Google Maps offline download",
          note: "Download the Madrid area before you fly",
        },
        {
          name: "Restaurant reservations",
          note: "Book ahead via phone or Resy for popular spots",
        },
        {
          name: "Museo del Prado tickets",
          note: "Book online — queues are brutal in August",
        },
        {
          name: "El Rastro flea-market visit",
          note: "Sundays only, open-air — go early",
        },
        {
          name: "Basic Spanish phrasebook / app",
          note: "¡Gracias! goes a very long way",
        },
      ],
    },
  ];
}

function PackingTab({ days }: { days: DayForecast[] }) {
  const tripDays = days.filter((d) => isTripDay(d.date));
  const categories = buildPackingList(
    tripDays.length > 0 ? tripDays : days,
  );

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const avgHigh =
    tripDays.length > 0
      ? Math.round(
          tripDays.reduce((s, d) => s + d.tempMax, 0) / tripDays.length,
        )
      : 35;
  const rainDays = tripDays.filter((d) => d.precipProbMax >= 30).length;
  const sunnyDays = tripDays.length - rainDays;

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const packedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="packing-tab">
      <div className="trip-hero">
        <div className="trip-hero-text">
          <h2>Your Madrid Trip</h2>
          <p className="trip-dates-label">Aug 4 – Aug 17, 2026 · 14 nights</p>
        </div>
        <div className="trip-stats">
          <div className="trip-stat">
            <span>🌡️</span>
            <strong>{avgHigh}°C</strong>
            <small>Avg high</small>
          </div>
          <div className="trip-stat">
            <span>☀️</span>
            <strong>{tripDays.length > 0 ? sunnyDays : "~11"}</strong>
            <small>Sunny days</small>
          </div>
          <div className="trip-stat">
            <span>🌧️</span>
            <strong>{tripDays.length > 0 ? rainDays : "~3"}</strong>
            <small>Rain likely</small>
          </div>
          <div className="trip-stat">
            <span>✅</span>
            <strong>
              {packedCount}/{totalItems}
            </strong>
            <small>Packed</small>
          </div>
        </div>
        {tripDays.length < 14 && (
          <p className="trip-caveat">
            {tripDays.length > 0
              ? `Forecast covers ${tripDays.length} of 14 trip days. Remaining days estimated from typical Madrid August averages.`
              : "Trip dates fall outside the 16-day forecast window. Packing list uses typical Madrid August conditions."}
          </p>
        )}
      </div>

      <div className="packing-grid">
        {categories.map((cat) => {
          const catPacked = cat.items.filter(
            (item) => checked[`${cat.title}-${item.name}`],
          ).length;
          return (
            <section key={cat.title} className="pack-cat">
              <h3 className="pack-cat-heading">
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
                <span className="cat-progress">
                  {catPacked}/{cat.items.length}
                </span>
              </h3>
              <ul className="pack-list">
                {cat.items.map((item) => {
                  const key = `${cat.title}-${item.name}`;
                  const done = !!checked[key];
                  return (
                    <li key={key} className={`pack-item${done ? " done" : ""}`}>
                      <label>
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => toggle(key)}
                        />
                        <div className="item-body">
                          <span className="item-name">{item.name}</span>
                          {item.qty && (
                            <span className="item-qty">× {item.qty}</span>
                          )}
                          {item.note && (
                            <span className="item-note">{item.note}</span>
                          )}
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

type Tab = "forecast" | "packing";

function App() {
  const [tab, setTab] = useState<Tab>("forecast");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["madrid-forecast"],
    queryFn: getMadridForecast,
    staleTime: 1000 * 60 * 30,
  });

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-flag" aria-hidden="true">
              🇪🇸
            </span>
            <div>
              <h1>Madrid</h1>
              <p className="brand-sub">3-week forecast · trip planner</p>
            </div>
          </div>
          <nav className="tab-nav" role="tablist" aria-label="App sections">
            <button
              role="tab"
              aria-selected={tab === "forecast"}
              className={`tab-btn${tab === "forecast" ? " active" : ""}`}
              onClick={() => setTab("forecast")}
            >
              🌤 Forecast
            </button>
            <button
              role="tab"
              aria-selected={tab === "packing"}
              className={`tab-btn${tab === "packing" ? " active" : ""}`}
              onClick={() => setTab("packing")}
            >
              🎒 Packing List
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {isLoading && (
          <div className="loading" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <p>Loading Madrid forecast…</p>
          </div>
        )}

        {isError && (
          <div className="error-card" role="alert">
            <span className="error-icon">⚠️</span>
            <p>
              {error instanceof Error
                ? error.message
                : "Could not load the forecast."}
            </p>
            <p className="error-hint">Try refreshing the page.</p>
          </div>
        )}

        {data && tab === "forecast" && <ForecastTab days={data.days} />}
        {data && tab === "packing" && <PackingTab days={data.days} />}
      </main>
    </div>
  );
}

export default App;
