import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";

import { getMadridForecast } from "./weather.backend";
import type { DayForecast, HeatIntensity } from "./weather.backend";

// Trip: 2 weeks starting next week (Aug 4 – Aug 17, 2026)
const TRIP_START = "2026-08-04";
const TRIP_END = "2026-08-17";

// ─── Icons ────────────────────────────────────────────────────────────────────
type IconName =
  | "sun"
  | "cloud"
  | "cloudRain"
  | "cloudSun"
  | "wind"
  | "umbrella"
  | "suitcase"
  | "thermometer"
  | "droplet"
  | "uv"
  | "shirt"
  | "sunrise"
  | "check";

function Icon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19" />
      </>
    ),
    cloud: (
      <path d="M17.5 19H7a4 4 0 1 1 .88-7.9A5 5 0 1 1 17.5 19Z" />
    ),
    cloudRain: (
      <>
        <path d="M17.5 19H7a4 4 0 1 1 .88-7.9A5 5 0 1 1 17.5 19Z" />
        <path d="M11 13v4m4-3v4m-8-1v4" />
      </>
    ),
    cloudSun: (
      <>
        <path d="M8 7.5a5 5 0 0 1 9.4 2.4A4.5 4.5 0 1 1 17.5 19H7a4 4 0 1 1 1-7.9" />
        <path d="M4.5 7.5 3 6m6-2V2m4.5 5.5L15 6M4 12H2" />
      </>
    ),
    wind: <path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a2 2 0 1 1-2 2M3 16h9" />,
    umbrella: (
      <>
        <path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7" />
      </>
    ),
    suitcase: (
      <>
        <rect width="20" height="14" x="2" y="7" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 12v3M8 12v3M16 12v3" />
      </>
    ),
    thermometer: (
      <>
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0Z" />
      </>
    ),
    droplet: (
      <path d="M12 2S6.5 8.4 6.5 13a5.5 5.5 0 0 0 11 0C17.5 8.4 12 2 12 2Z" />
    ),
    uv: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19" />
        <text x="8" y="15" fontSize="6" fill="currentColor" stroke="none">UV</text>
      </>
    ),
    shirt: (
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23Z" />
    ),
    sunrise: (
      <>
        <path d="M12 2v8M4.93 10.93 6.34 12.34M2 18h2M20 18h2M17.66 12.34l1.41-1.41" />
        <path d="M20 18a8 8 0 1 0-16 0" />
        <line x1="12" y1="18" x2="12" y2="22" />
      </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
  };
  return (
    <svg
      className={`icon${className ? ` ${className}` : ""}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

function formatDayOfWeek(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return new Intl.DateTimeFormat("en-GB", { weekday: "short" })
    .format(d)
    .toUpperCase();
}

function formatDayNum(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.getDate();
}

function formatMonth(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return new Intl.DateTimeFormat("en-GB", { month: "short" })
    .format(d)
    .toUpperCase();
}

function formatTime(isoStr: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Madrid",
  }).format(new Date(isoStr));
}

function isInTrip(dateStr: string) {
  return dateStr >= TRIP_START && dateStr <= TRIP_END;
}

function weatherIcon(code: number): IconName {
  if (code === 0 || code === 1) return "sun";
  if (code === 2) return "cloudSun";
  if (code === 3 || code === 45 || code === 48) return "cloud";
  return "cloudRain";
}

const intensityColors: Record<HeatIntensity, string> = {
  extreme: "intensity-extreme",
  "very-hot": "intensity-very-hot",
  hot: "intensity-hot",
  warm: "intensity-warm",
  mild: "intensity-mild",
  cool: "intensity-cool",
};

// ─── Packing List ─────────────────────────────────────────────────────────────
function buildPackingList(tripDays: DayForecast[]) {
  const avgHigh =
    tripDays.reduce((s, d) => s + d.high, 0) / (tripDays.length || 1);
  const maxHigh = Math.max(...tripDays.map((d) => d.high));
  const hasRain = tripDays.some((d) => d.precipitationChance >= 35);
  const maxUv = Math.max(...tripDays.map((d) => d.uvIndex));

  const clothing = [
    `${Math.ceil(tripDays.length * 1.1)} breathable t-shirts / light tops`,
    `${Math.ceil(tripDays.length * 0.7)} pairs of lightweight shorts`,
    "2–3 pairs of light trousers or chinos (evenings / smart casual)",
    "1 smart-casual outfit (dinner / cultural sites)",
    "1 light cardigan or thin long-sleeve (air-conditioned spaces)",
    `${Math.ceil(tripDays.length * 1.2)} pairs of underwear & socks`,
    "Comfortable walking shoes",
    "Sandals or flip-flops",
  ];

  if (avgHigh >= 32) {
    clothing.push("Wide-brim sun hat or baseball cap");
  }
  if (maxHigh >= 38) {
    clothing.push("Cooling towel or misting fan");
  }

  const sunProtection = [
    `SPF ${maxUv >= 10 ? "50+" : "30+"} sunscreen (multiple tubes — reapply often)`,
    "UV-blocking sunglasses",
    "After-sun lotion or aloe vera gel",
  ];

  const health = [
    "Electrolyte sachets / rehydration salts (essential in Madrid heat)",
    "Pain/fever relief (ibuprofen or paracetamol)",
    "Blister plasters (for walking cobblestones)",
    "Hand sanitiser",
    "Any personal medication",
  ];

  const gear = [
    "Type C/F European plug adaptor",
    "Portable phone charger / power bank",
    "Reusable water bottle (2L — Madrid has free water fountains)",
    "Small day-pack or tote bag",
    "Phone holder or belt bag",
  ];

  if (hasRain) {
    gear.push("Compact travel umbrella or packable rain jacket");
  }

  const documents = [
    "Passport / national ID",
    "Travel insurance documents",
    "Accommodation bookings (printed or downloaded offline)",
    "Transport cards / intercity rail tickets",
    "Euros (cash — useful for markets & small cafes)",
    "Emergency contact list",
  ];

  return { clothing, sunProtection, health, gear, documents };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function PackingCategory({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="pack-category">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <Icon name="check" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DayCard({
  day,
  isSelected,
  onClick,
}: {
  day: DayForecast;
  isSelected: boolean;
  onClick: () => void;
}) {
  const inTrip = isInTrip(day.date);
  return (
    <button
      className={`day-card ${intensityColors[day.dressAdvice.intensity]} ${isSelected ? "selected" : ""} ${inTrip ? "in-trip" : ""}`}
      onClick={onClick}
      title={day.condition}
    >
      {inTrip && <span className="trip-badge">Trip</span>}
      <span className="day-dow">{formatDayOfWeek(day.date)}</span>
      <span className="day-num">{formatDayNum(day.date)}</span>
      <span className="day-month">{formatMonth(day.date)}</span>
      <Icon name={weatherIcon(day.weatherCode)} className="day-weather-icon" />
      <span className="day-high">{Math.round(day.high)}°</span>
      <span className="day-low">{Math.round(day.low)}°</span>
      <span className="day-rain">{day.precipitationChance}%</span>
    </button>
  );
}

function DetailPanel({ day }: { day: DayForecast }) {
  const { dressAdvice } = day;
  return (
    <div className={`detail-panel ${intensityColors[dressAdvice.intensity]}`}>
      <div className="detail-header">
        <div className="detail-date">
          <span className="detail-dow">{formatDayOfWeek(day.date)}</span>
          <strong>{formatDate(day.date)}</strong>
          {isInTrip(day.date) && <span className="detail-trip-badge">Your trip</span>}
        </div>
        <div className="detail-condition">
          <Icon name={weatherIcon(day.weatherCode)} className="detail-icon" />
          <span>{day.condition}</span>
        </div>
      </div>

      <div className="detail-stats">
        <div className="stat">
          <Icon name="thermometer" />
          <span>
            <small>HIGH / LOW</small>
            <strong>
              {Math.round(day.high)}° / {Math.round(day.low)}°
            </strong>
          </span>
        </div>
        <div className="stat">
          <Icon name="thermometer" />
          <span>
            <small>FEELS LIKE</small>
            <strong>
              {Math.round(day.feelsLikeHigh)}° / {Math.round(day.feelsLikeLow)}°
            </strong>
          </span>
        </div>
        <div className="stat">
          <Icon name="droplet" />
          <span>
            <small>RAIN CHANCE</small>
            <strong>{day.precipitationChance}%</strong>
          </span>
        </div>
        <div className="stat">
          <Icon name="wind" />
          <span>
            <small>WIND</small>
            <strong>{Math.round(day.windSpeed)} km/h</strong>
          </span>
        </div>
        <div className="stat">
          <Icon name="sun" />
          <span>
            <small>UV INDEX</small>
            <strong>{Math.round(day.uvIndex)}</strong>
          </span>
        </div>
        <div className="stat">
          <Icon name="sunrise" />
          <span>
            <small>SUNRISE / SET</small>
            <strong>
              {formatTime(day.sunrise)} / {formatTime(day.sunset)}
            </strong>
          </span>
        </div>
      </div>

      <div className="dress-section">
        <span className="dress-eyebrow">WHAT TO WEAR</span>
        <h3>{dressAdvice.headline}</h3>
        <p>{dressAdvice.summary}</p>
        <div className="dress-lists">
          <div className="dress-col">
            <small>WEAR</small>
            {dressAdvice.wear.map((item) => (
              <span key={item} className="dress-tag">
                {item}
              </span>
            ))}
          </div>
          <div className="dress-col">
            <small>BRING</small>
            {dressAdvice.bring.map((item) => (
              <span key={item} className="dress-tag">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const forecastQuery = useQuery({
    queryKey: ["madrid-forecast"],
    queryFn: getMadridForecast,
    staleTime: 1000 * 60 * 30,
  });

  const days = forecastQuery.data?.days ?? [];

  // Fill in remaining days of 3 weeks with placeholder when forecast is shorter
  const startDate = new Date("2026-07-28T12:00:00");
  const allDates: string[] = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const [selectedDate, setSelectedDate] = useState<string>(allDates[0]);

  const selectedDay = days.find((d) => d.date === selectedDate);
  const tripDays = days.filter((d) => isInTrip(d.date));
  const packing = buildPackingList(tripDays);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main>
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-city">
          <span className="city-flag">🇪🇸</span>
          <div>
            <h1>Madrid</h1>
            <span>3-Week Weather Forecast · July 28 – August 17, 2026</span>
          </div>
        </div>
        <div className="header-meta">
          <span className="trip-pill">✈ Trip: Aug 4–17</span>
        </div>
      </header>

      {/* ── Loading / Error ── */}
      {forecastQuery.isLoading && (
        <div className="status-bar loading">
          <span className="spinner" />
          Fetching live forecast from Open-Meteo…
        </div>
      )}
      {forecastQuery.isError && (
        <div className="status-bar error" role="alert">
          Unable to load forecast:{" "}
          {forecastQuery.error instanceof Error
            ? forecastQuery.error.message
            : "Unknown error"}
          <button onClick={() => forecastQuery.refetch()}>Retry</button>
        </div>
      )}

      {/* ── Calendar grid ── */}
      <section className="calendar-section">
        <div className="calendar-legend">
          <span className="legend-dot extreme" /> Extreme heat (&gt;38°C)
          <span className="legend-dot very-hot" /> Very hot (32–38°C)
          <span className="legend-dot hot" /> Hot (26–32°C)
          <span className="legend-dot warm" /> Warm (20–26°C)
          <span className="legend-dot mild" /> Mild (&lt;20°C)
        </div>

        <div className="calendar-grid">
          {allDates.map((date) => {
            const day = days.find((d) => d.date === date);
            if (!day) {
              return (
                <div key={date} className="day-card day-placeholder">
                  <span className="day-dow">{formatDayOfWeek(date)}</span>
                  <span className="day-num">{formatDayNum(date)}</span>
                  <span className="day-month">{formatMonth(date)}</span>
                  <span className="placeholder-label">Forecast<br />pending</span>
                </div>
              );
            }
            return (
              <DayCard
                key={date}
                day={day}
                isSelected={selectedDate === date}
                onClick={() => setSelectedDate(date)}
              />
            );
          })}
        </div>

        <p className="forecast-note">
          Open-Meteo provides up to 16 days of forecast. Days without data show
          as &ldquo;Forecast pending&rdquo;.{" "}
          {forecastQuery.dataUpdatedAt > 0 && (
            <>
              Last updated:{" "}
              {new Intl.DateTimeFormat("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Madrid",
              }).format(new Date(forecastQuery.dataUpdatedAt))}
              {" "}Madrid time.
            </>
          )}
        </p>
      </section>

      {/* ── Day detail ── */}
      {selectedDay ? (
        <section className="detail-section">
          <div className="section-label">
            <Icon name="shirt" />
            <span>
              {selectedDay.date === today
                ? "Today's Forecast & Outfit"
                : "Forecast & Outfit"}
            </span>
          </div>
          <DetailPanel day={selectedDay} />
        </section>
      ) : (
        forecastQuery.isSuccess && (
          <section className="detail-section">
            <div className="no-detail">
              Select a day in the calendar above to see the full forecast and
              dressing advice.
            </div>
          </section>
        )
      )}

      {/* ── Packing list ── */}
      <section className="packing-section">
        <div className="packing-header">
          <Icon name="suitcase" className="suitcase-icon" />
          <div>
            <h2>Packing List for Madrid</h2>
            <p>
              2-week trip · August 4–17, 2026
              {tripDays.length > 0 && (
                <>
                  {" "}· Average high {Math.round(tripDays.reduce((s, d) => s + d.high, 0) / tripDays.length)}°C,
                  max {Math.round(Math.max(...tripDays.map((d) => d.high)))}°C
                </>
              )}
            </p>
          </div>
        </div>

        <div className="packing-grid">
          <PackingCategory title="👕 Clothing" items={packing.clothing} />
          <PackingCategory
            title="☀️ Sun Protection"
            items={packing.sunProtection}
          />
          <PackingCategory title="💊 Health & Wellness" items={packing.health} />
          <PackingCategory title="🎒 Gear & Accessories" items={packing.gear} />
          <PackingCategory title="📄 Documents & Money" items={packing.documents} />
        </div>

        <div className="packing-tip">
          <strong>Madrid tip:</strong> In August, temperatures regularly exceed
          35°C. Aim to do outdoor activities before 11 am or after 7 pm, and
          always carry water. Museums, the metro, and most restaurants are
          heavily air-conditioned — that light cardigan earns its place.
        </div>
      </section>
    </main>
  );
}

export default App;
