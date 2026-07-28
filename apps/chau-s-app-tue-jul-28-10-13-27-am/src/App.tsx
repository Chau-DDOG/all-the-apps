import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getMadridForecast, type DailyForecast } from "./weather.backend";

// ── WMO weather code helpers ──────────────────────────────────────────────────

function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 75) return "❄️";
  if (code <= 82) return "🌦️";
  return "⛈️";
}

function weatherLabel(code: number): string {
  const labels: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Icy fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Showers",
    82: "Heavy showers",
    95: "Thunderstorm",
    96: "Storm with hail",
    99: "Severe storm",
  };
  return labels[code] ?? "Variable";
}

// ── Outfit advice ─────────────────────────────────────────────────────────────

type OutfitAdvice = {
  headline: string;
  items: string[];
  warning?: string;
};

function getOutfit(day: DailyForecast): OutfitAdvice {
  const avg = (day.tempMax + day.tempMin) / 2;
  const rainy = day.precipitation > 2 || day.precipitationProb > 50;
  const windy = day.windspeed > 35;
  const storm = day.weatherCode >= 95;

  let headline: string;
  let items: string[];
  let warning: string | undefined;

  if (avg >= 35) {
    headline = "Extreme heat — dress ultra-light";
    items = [
      "Loose linen or cotton t-shirt",
      "Light shorts or airy skirt",
      "Breathable sandals",
      "Wide-brim sun hat (essential!)",
      "UV-blocking sunglasses",
      "SPF 50+ sunscreen — reapply every 2 h",
      "Carry 1.5 L of water minimum",
    ];
    warning = `UV index ${day.uvIndex} — apply sunscreen before leaving and top up every 2 hours.`;
  } else if (avg >= 30) {
    headline = "Very hot — keep it light";
    items = [
      "Lightweight t-shirt",
      "Shorts or light trousers",
      "Sandals or mesh sneakers",
      "Cap or sun hat",
      "Sunglasses",
      "SPF 50+ sunscreen",
    ];
  } else if (avg >= 25) {
    headline = "Hot — comfortable summer wear";
    items = [
      "Light shirt or blouse",
      "Shorts or light jeans",
      "Sneakers or sandals",
      "Sunglasses",
      "Sunscreen SPF 30+",
      "Light cardigan for restaurants/metro",
    ];
  } else if (avg >= 20) {
    headline = "Warm — smart-casual layers";
    items = [
      "T-shirt with light jacket",
      "Jeans or chinos",
      "Comfortable sneakers",
      "Sunglasses",
    ];
  } else {
    headline = "Mild — layer up";
    items = [
      "Shirt with sweater or hoodie",
      "Jeans or trousers",
      "Jacket",
      "Comfortable shoes",
    ];
  }

  if (rainy) items.push("Compact umbrella or rain jacket");
  if (windy) items.push("Windbreaker");
  if (storm) warning = "Thunderstorm risk — consider indoor plans.";

  return { headline, items, warning };
}

// ── Packing list ──────────────────────────────────────────────────────────────

type PackingCategory = { label: string; items: string[] };

function buildPackingList(daily: DailyForecast[]): PackingCategory[] {
  const tripDays = daily.slice(7, 21);
  const avgMax = tripDays.reduce((s, d) => s + d.tempMax, 0) / tripDays.length;
  const rainDays = tripDays.filter((d) => d.precipitation > 2 || d.precipitationProb > 50).length;
  const coolNights = tripDays.some((d) => d.tempMin < 20);

  const clothing: string[] = [
    "8 × lightweight t-shirts",
    "3 × breathable shirts/blouses",
    "4 × shorts (or 2 shorts + 2 light trousers)",
    "1 pair jeans (for cooler evenings)",
    "1 smart-casual outfit (dinners/shows)",
    coolNights ? "1 light cardigan or sweatshirt" : "1 thin cardigan (for A/C indoors)",
    rainDays > 2 ? "1 lightweight packable rain jacket" : "Compact travel umbrella",
    "Comfortable walking shoes — Madrid has lots of cobblestones!",
    "Sandals or flip-flops",
    "14 × underwear",
    "14 × socks",
    "Pyjamas or sleepwear",
  ];

  const sun: string[] = [
    avgMax >= 35 ? "3 × SPF 50+ sunscreen (larger bottles)" : "2 × SPF 50+ sunscreen",
    "SPF lip balm",
    "Polarised sunglasses",
    "Wide-brim hat or compact packable hat",
    "After-sun lotion or aloe vera gel",
  ];
  if (avgMax >= 35) {
    sun.push("Portable mini fan");
    sun.push("Electrolyte sachets or rehydration tablets");
  }

  const toiletries: string[] = [
    "Shampoo & conditioner (travel size)",
    "Deodorant (extra!)",
    "Toothbrush, toothpaste & floss",
    "Razor / shaver",
    "Face moisturiser",
    "Insect repellent (mosquitoes at dusk)",
    "Nail clippers",
  ];

  const health: string[] = [
    "Paracetamol / ibuprofen",
    "Antihistamines (heat + pollen)",
    "Blister plasters (cobblestone streets!)",
    "Rehydration sachets",
    "Any prescription medication (14-day supply)",
    "Travel first aid kit",
  ];

  const tech: string[] = [
    "Phone + charger",
    "EU power adapter (Type C/E — Spain uses 230 V)",
    "Portable power bank (min 10 000 mAh)",
    "Camera + memory cards",
    "Earphones or noise-cancelling headphones",
    "E-reader or tablet (long flights)",
  ];

  const documents: string[] = [
    "Passport / national ID",
    "Travel insurance documents & emergency contacts",
    "Credit card(s) + small amount of euros cash",
    "Madrid Metro card (rechargeable)",
    "Printed/saved accommodation bookings",
    "Copies of flight itinerary",
  ];

  const daypack: string[] = [
    "Day backpack (20–25 L)",
    "Anti-theft cross-body bag for city walks",
    "Packing cubes (keep luggage organised over 2 weeks)",
    "Luggage locks",
    "Reusable water bottle (1.5 L minimum)",
    "Reusable tote bag (shops charge for bags in Spain)",
    "Ziploc bags (wet swimwear etc.)",
  ];

  const madrid: string[] = [
    "Madrid City Tourist Pass or Museum Pass (buy online)",
    "Metro app or map downloaded offline",
    "Reservation for Prado Museum (book ahead!)",
    "Reservation for Reina Sofía Museum",
    "Restaurant list with bookings for popular spots",
    "VPN (optional, for streaming from home)",
  ];

  return [
    { label: "👕 Clothing", items: clothing },
    { label: "☀️ Sun & Heat Protection", items: sun },
    { label: "🧴 Toiletries", items: toiletries },
    { label: "💊 Health & Pharmacy", items: health },
    { label: "📱 Tech & Gadgets", items: tech },
    { label: "📄 Documents & Money", items: documents },
    { label: "🎒 Bags & Accessories", items: daypack },
    { label: "🏛️ Madrid Essentials", items: madrid },
  ];
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function formatDate(dateStr: string): { day: string; month: string; weekday: string } {
  const d = new Date(dateStr + "T12:00:00");
  return {
    weekday: d.toLocaleDateString("en-GB", { weekday: "short" }),
    day: d.toLocaleDateString("en-GB", { day: "numeric" }),
    month: d.toLocaleDateString("en-GB", { month: "short" }),
  };
}

function uvColor(uv: number): string {
  if (uv <= 2) return "var(--uv-low)";
  if (uv <= 5) return "var(--uv-mod)";
  if (uv <= 7) return "var(--uv-high)";
  if (uv <= 10) return "var(--uv-very)";
  return "var(--uv-extreme)";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DayCard({ day, expanded, onToggle }: {
  day: DailyForecast;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { weekday, day: dayNum, month } = formatDate(day.date);
  const outfit = getOutfit(day);
  const isHot = day.tempMax >= 35;

  return (
    <div className={`day-card ${expanded ? "expanded" : ""} ${isHot ? "hot" : ""}`}>
      <button className="day-card__header" onClick={onToggle} aria-expanded={expanded}>
        <div className="day-card__date">
          <span className="day-card__weekday">{weekday}</span>
          <span className="day-card__day">{dayNum}</span>
          <span className="day-card__month">{month}</span>
        </div>

        <span className="day-card__emoji" role="img" aria-label={weatherLabel(day.weatherCode)}>
          {weatherEmoji(day.weatherCode)}
        </span>

        <div className="day-card__temps">
          <span className="temp-max">{day.tempMax}°</span>
          <span className="temp-sep">/</span>
          <span className="temp-min">{day.tempMin}°</span>
        </div>

        <span className="day-card__condition">{weatherLabel(day.weatherCode)}</span>

        <div className="day-card__meta">
          {day.precipitationProb > 10 && (
            <span className="meta-pill rain">💧 {day.precipitationProb}%</span>
          )}
          <span className="meta-pill uv" style={{ background: uvColor(day.uvIndex) }}>
            UV {day.uvIndex}
          </span>
          <span className="meta-pill wind">💨 {day.windspeed} km/h</span>
        </div>

        <span className="day-card__toggle-icon" aria-hidden="true">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="day-card__body">
          <div className="outfit">
            <p className="outfit__headline">👗 {outfit.headline}</p>
            <ul className="outfit__items">
              {outfit.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {outfit.warning && (
              <p className="outfit__warning">⚠️ {outfit.warning}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WeekTab({ days }: { days: DailyForecast[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  function toggle(i: number) {
    setExpandedIdx((prev) => (prev === i ? null : i));
  }

  return (
    <div className="week-tab">
      {days.map((day, i) => (
        <DayCard
          key={day.date}
          day={day}
          expanded={expandedIdx === i}
          onToggle={() => toggle(i)}
        />
      ))}
    </div>
  );
}

function PackingList({ daily }: { daily: DailyForecast[] }) {
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const categories = buildPackingList(daily);

  const tripDays = daily.slice(7, 21);
  const avgMax = Math.round(tripDays.reduce((s, d) => s + d.tempMax, 0) / tripDays.length);
  const avgMin = Math.round(tripDays.reduce((s, d) => s + d.tempMin, 0) / tripDays.length);

  function toggleItem(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const packedCount = checked.size;

  return (
    <div className="packing-list">
      <div className="packing-summary">
        <div className="packing-summary__trip">
          <span>✈️</span>
          <div>
            <strong>Madrid, Spain — 2-week trip</strong>
            <span>4 Aug – 17 Aug 2026</span>
          </div>
        </div>
        <div className="packing-summary__weather">
          <span>🌡️ Forecast avg: {avgMax}° high / {avgMin}° low</span>
          {avgMax >= 35 && <span className="heat-badge">🔥 Heatwave conditions expected</span>}
        </div>
        <div className="packing-summary__progress">
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${Math.round((packedCount / totalItems) * 100)}%` }}
            />
          </div>
          <span>{packedCount}/{totalItems} items packed</span>
        </div>
      </div>

      {categories.map((cat) => {
        const catChecked = cat.items.filter((item) => checked.has(`${cat.label}:${item}`)).length;
        const isOpen = openCat === cat.label;

        return (
          <div key={cat.label} className={`packing-cat ${isOpen ? "open" : ""}`}>
            <button
              className="packing-cat__header"
              onClick={() => setOpenCat(isOpen ? null : cat.label)}
            >
              <span className="packing-cat__label">{cat.label}</span>
              <span className="packing-cat__count">
                {catChecked}/{cat.items.length}
              </span>
              <span className="packing-cat__chevron">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <ul className="packing-cat__items">
                {cat.items.map((item) => {
                  const key = `${cat.label}:${item}`;
                  return (
                    <li key={item} className={checked.has(key) ? "checked" : ""}>
                      <label>
                        <input
                          type="checkbox"
                          checked={checked.has(key)}
                          onChange={() => toggleItem(key)}
                        />
                        {item}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────

type TabKey = "forecast" | "packing";

export default function App() {
  const [tab, setTab] = useState<TabKey>("forecast");
  const [week, setWeek] = useState(0);

  const query = useQuery({
    queryKey: ["madrid-forecast"],
    queryFn: getMadridForecast,
    staleTime: 1000 * 60 * 30,
  });

  const daily = query.data?.daily ?? [];
  const weeks = [daily.slice(0, 7), daily.slice(7, 14), daily.slice(14, 21)];

  const weekLabels = ["Week 1", "Week 2", "Week 3"];

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__title">
          <span className="app-header__flag" aria-hidden="true">🇪🇸</span>
          <div>
            <h1>Madrid Weather Guide</h1>
            <p>3-week forecast · dressing tips · 2-week packing list</p>
          </div>
        </div>

        <nav className="app-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "forecast"}
            className={tab === "forecast" ? "active" : ""}
            onClick={() => setTab("forecast")}
          >
            🌤️ Forecast
          </button>
          <button
            role="tab"
            aria-selected={tab === "packing"}
            className={tab === "packing" ? "active" : ""}
            onClick={() => setTab("packing")}
          >
            🎒 Packing List
          </button>
        </nav>
      </header>

      <main className="app-main">
        {query.isLoading && (
          <div className="state-message loading">
            <span className="spinner" aria-hidden="true" />
            Loading Madrid forecast…
          </div>
        )}

        {query.isError && (
          <div className="state-message error">
            <span>⚠️</span>
            <div>
              <strong>Could not load forecast</strong>
              <p>Check your connection and try again.</p>
              <button onClick={() => query.refetch()}>Retry</button>
            </div>
          </div>
        )}

        {query.isSuccess && tab === "forecast" && (
          <>
            <div className="week-nav" role="tablist" aria-label="Week selector">
              {weekLabels.map((label, i) => (
                <button
                  key={label}
                  role="tab"
                  aria-selected={week === i}
                  className={week === i ? "active" : ""}
                  onClick={() => setWeek(i)}
                >
                  {label}
                  <span className="week-nav__range">
                    {weeks[i][0] &&
                      (() => {
                        const s = formatDate(weeks[i][0].date);
                        const e = formatDate(weeks[i][6]?.date ?? weeks[i][weeks[i].length - 1].date);
                        return `${s.day} ${s.month} – ${e.day} ${e.month}`;
                      })()}
                  </span>
                </button>
              ))}
            </div>

            {weeks[week] && <WeekTab days={weeks[week]} />}
          </>
        )}

        {query.isSuccess && tab === "packing" && (
          <PackingList daily={daily} />
        )}
      </main>
    </div>
  );
}
