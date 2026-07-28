import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";

import { getMadridForecast, type DailyForecast } from "./weather.backend";

type Tab = "forecast" | "outfits" | "packing";

const TRIP_START = "2026-08-03";
const TRIP_END = "2026-08-16";

function weatherEmoji(code: number, precipChance: number): string {
  if (precipChance >= 50 || [61, 63, 65, 80, 81, 82].includes(code))
    return "🌧️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  if ([71, 73, 75].includes(code)) return "❄️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55].includes(code)) return "🌦️";
  if (code === 3) return "☁️";
  if (code === 2) return "⛅";
  if (code === 1) return "🌤️";
  return "☀️";
}

function getOutfitAdvice(day: DailyForecast): {
  headline: string;
  wear: string[];
  bring: string[];
} {
  const avgTemp = (day.high + day.low) / 2;
  const wear: string[] = [];
  const bring: string[] = [];
  let headline = "";

  if (avgTemp >= 30) {
    headline = "It's hot — go light and breathable";
    wear.push("linen shirt or cotton tee", "lightweight shorts or linen trousers", "sandals or breathable sneakers");
    bring.push("sun hat", "sunglasses", "SPF 50+ sunscreen", "reusable water bottle");
  } else if (avgTemp >= 22) {
    headline = "Warm and comfortable — light layers work";
    wear.push("short-sleeve shirt", "chinos or jeans", "sneakers or loafers");
    bring.push("sunglasses", "light cardigan for evenings");
  } else if (avgTemp >= 15) {
    headline = "Mild — add a layer for evenings";
    wear.push("long-sleeve top", "jeans or trousers", "sneakers");
    bring.push("light jacket", "scarf");
  } else {
    headline = "Cool — layer up";
    wear.push("warm sweater", "trousers", "closed-toe shoes");
    bring.push("medium jacket", "scarf");
  }

  if (day.precipChance >= 40 || day.precipSum > 2) {
    bring.push("compact umbrella", "waterproof shoes");
    headline += " — rain likely";
  } else if (day.precipChance >= 20) {
    bring.push("compact umbrella (just in case)");
  }

  if (day.windSpeed >= 40) {
    bring.push("windproof layer");
  }

  return { headline, wear, bring };
}

function formatDate(dateStr: string): { weekday: string; date: string } {
  const d = new Date(dateStr + "T12:00:00");
  return {
    weekday: d.toLocaleDateString("en-GB", { weekday: "short" }),
    date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
  };
}

function TempBar({ high, low }: { high: number; low: number }) {
  const minT = 10;
  const maxT = 45;
  const range = maxT - minT;
  const leftPct = ((low - minT) / range) * 100;
  const widthPct = ((high - low) / range) * 100;
  return (
    <div className="temp-bar-track">
      <div
        className="temp-bar-fill"
        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
      />
    </div>
  );
}

function ForecastTab({ days }: { days: DailyForecast[] }) {
  return (
    <div className="forecast-grid">
      {days.map((day) => {
        const { weekday, date } = formatDate(day.date);
        const emoji = weatherEmoji(day.weatherCode, day.precipChance);
        const isTrip = day.date >= TRIP_START && day.date <= TRIP_END;
        return (
          <div key={day.date} className={`forecast-card${isTrip ? " trip-day" : ""}`}>
            {isTrip && <span className="trip-badge">✈️ Trip</span>}
            <div className="fc-date">
              <strong>{weekday}</strong>
              <span>{date}</span>
            </div>
            <div className="fc-emoji">{emoji}</div>
            <div className="fc-condition">{day.condition}</div>
            <div className="fc-temps">
              <span className="high">{Math.round(day.high)}°</span>
              <TempBar high={day.high} low={day.low} />
              <span className="low">{Math.round(day.low)}°</span>
            </div>
            <div className="fc-details">
              {day.precipChance > 0 && (
                <span>💧 {day.precipChance}%</span>
              )}
              <span>💨 {Math.round(day.windSpeed)} km/h</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OutfitsTab({ days }: { days: DailyForecast[] }) {
  return (
    <div className="outfits-list">
      {days.map((day) => {
        const { weekday, date } = formatDate(day.date);
        const outfit = getOutfitAdvice(day);
        const emoji = weatherEmoji(day.weatherCode, day.precipChance);
        const isTrip = day.date >= TRIP_START && day.date <= TRIP_END;
        return (
          <div key={day.date} className={`outfit-row${isTrip ? " trip-day" : ""}`}>
            <div className="outfit-date">
              <strong>{weekday}</strong>
              <span>{date}</span>
              {isTrip && <span className="trip-badge">✈️</span>}
            </div>
            <div className="outfit-weather">
              <span className="outfit-emoji">{emoji}</span>
              <span className="outfit-temps">
                {Math.round(day.high)}° / {Math.round(day.low)}°
              </span>
            </div>
            <div className="outfit-advice">
              <p className="outfit-headline">{outfit.headline}</p>
              <div className="outfit-tags">
                <div>
                  <small>WEAR</small>
                  {outfit.wear.map((item) => (
                    <span key={item} className="tag">{item}</span>
                  ))}
                </div>
                {outfit.bring.length > 0 && (
                  <div>
                    <small>BRING</small>
                    {outfit.bring.map((item) => (
                      <span key={item} className="tag tag-bring">{item}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type PackingItem = { item: string; qty?: string; note?: string };
type PackingCategory = { category: string; icon: string; items: PackingItem[] };

function getPackingList(tripDays: DailyForecast[]): PackingCategory[] {
  const avgHigh =
    tripDays.length > 0
      ? tripDays.reduce((s, d) => s + d.high, 0) / tripDays.length
      : 35;
  const rainyDays = tripDays.filter((d) => d.precipChance >= 35).length;

  const clothes: PackingItem[] = [
    { item: "Breathable cotton/linen t-shirts", qty: "10–12" },
    { item: "Lightweight shorts", qty: "5–6" },
    { item: "Linen or cotton trousers", qty: "2–3", note: "evenings & nicer venues" },
    { item: "Sundress or light dress", qty: "2–3" },
    { item: "Swimwear", qty: "2" },
    { item: "Light cardigan or thin layer", qty: "1–2", note: "air-conditioned places" },
  ];

  if (avgHigh < 28) {
    clothes.push({ item: "Light jacket", qty: "1" });
  }

  const footwear: PackingItem[] = [
    { item: "Comfortable walking sandals", qty: "1 pair" },
    { item: "Lightweight sneakers", qty: "1 pair" },
    { item: "Flip-flops", qty: "1 pair", note: "pool/beach/hotel" },
  ];

  if (rainyDays >= 3) {
    footwear.push({ item: "Waterproof shoes or sandals", qty: "1 pair" });
  }

  const accessories: PackingItem[] = [
    { item: "Wide-brim sun hat", qty: "1" },
    { item: "Sunglasses (UV400)", qty: "1" },
    { item: "Reusable water bottle (1L+)", qty: "1", note: "Madrid tap water is excellent" },
    { item: "Day backpack or tote", qty: "1" },
  ];

  if (rainyDays >= 2) {
    accessories.push({ item: "Compact travel umbrella", qty: "1" });
  }

  const toiletries: PackingItem[] = [
    { item: "SPF 50+ sunscreen (200ml+)", note: "reapply every 2 hrs" },
    { item: "After-sun lotion" },
    { item: "Lip balm with SPF" },
    { item: "Insect repellent", note: "evenings near parks" },
    { item: "Travel-size toiletries" },
    { item: "Prescription medications (14-day supply)" },
    { item: "Basic first-aid (plasters, ibuprofen)" },
  ];

  const tech: PackingItem[] = [
    { item: "EU Type F plug adapter", note: "Spain uses Schuko" },
    { item: "Power bank (10 000 mAh+)" },
    { item: "Phone charger & cables" },
    { item: "Earbuds or headphones" },
    { item: "Travel camera / lens cloth" },
  ];

  const documents: PackingItem[] = [
    { item: "Passport (valid 6+ months)" },
    { item: "Travel insurance docs" },
    { item: "Flight e-tickets" },
    { item: "Hotel/Airbnb confirmations" },
    { item: "European Health Insurance Card (if EU citizen)" },
    { item: "Credit/debit cards (notify bank)" },
    { item: "Small euros cash for markets & tips" },
  ];

  const madrid: PackingItem[] = [
    { item: "Madrid Metro card (or Tarjeta Multi)", note: "10-trip card saves money" },
    { item: "Phrase book or Spanish translation app" },
    { item: "Museum tickets booked in advance", note: "Prado, Reina Sofía fill up fast" },
    { item: "Comfortable shoes for cobblestones" },
    { item: "Late dinner reservations (9–10 PM is normal)" },
  ];

  return [
    { category: "Clothing", icon: "👕", items: clothes },
    { category: "Footwear", icon: "👟", items: footwear },
    { category: "Accessories & Sun Protection", icon: "🧢", items: accessories },
    { category: "Toiletries & Health", icon: "🧴", items: toiletries },
    { category: "Tech & Electronics", icon: "🔌", items: tech },
    { category: "Documents & Money", icon: "📄", items: documents },
    { category: "Madrid Specifics", icon: "🇪🇸", items: madrid },
  ];
}

function PackingTab({ days }: { days: DailyForecast[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const tripDays = days.filter(
    (d) => d.date >= TRIP_START && d.date <= TRIP_END,
  );
  const categories = getPackingList(tripDays);

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const total = categories.reduce((s, c) => s + c.items.length, 0);
  const done = checked.size;

  return (
    <div className="packing-wrapper">
      <div className="packing-header">
        <div>
          <h2>2-Week Packing List</h2>
          <p>
            Madrid · Aug 3 – Aug 16, 2026 · Based on the forecast
          </p>
        </div>
        <div className="packing-progress">
          <div
            className="packing-bar"
            style={{ "--pct": `${total > 0 ? (done / total) * 100 : 0}%` } as React.CSSProperties}
          />
          <span>
            {done}/{total} packed
          </span>
        </div>
      </div>
      {categories.map((cat) => (
        <div key={cat.category} className="packing-category">
          <h3>
            {cat.icon} {cat.category}
          </h3>
          <ul>
            {cat.items.map((it) => {
              const key = `${cat.category}:${it.item}`;
              const ticked = checked.has(key);
              return (
                <li
                  key={key}
                  className={ticked ? "ticked" : ""}
                  onClick={() => toggle(key)}
                >
                  <span className="check-box">{ticked ? "✓" : ""}</span>
                  <span className="pack-item-text">
                    <strong>{it.item}</strong>
                    {it.qty && <span className="pack-qty"> × {it.qty}</span>}
                    {it.note && <span className="pack-note"> — {it.note}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className={`tab-btn${active ? " active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function App() {
  const [tab, setTab] = useState<Tab>("forecast");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["madrid-forecast"],
    queryFn: getMadridForecast,
    staleTime: 1000 * 60 * 30,
  });

  return (
    <main>
      <header className="app-header">
        <div className="app-brand">
          <span className="brand-flag">🇪🇸</span>
          <div>
            <h1>Madrid</h1>
            <p>3-week forecast · packing guide</p>
          </div>
        </div>
        <div className="header-meta">
          <span>40.42°N · 3.70°W</span>
          {data && (
            <span className="updated-at">
              Updated {new Date(data.fetchedAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </header>

      <nav className="tab-nav">
        <TabButton active={tab === "forecast"} onClick={() => setTab("forecast")}>
          📅 Forecast
        </TabButton>
        <TabButton active={tab === "outfits"} onClick={() => setTab("outfits")}>
          👗 What to Wear
        </TabButton>
        <TabButton active={tab === "packing"} onClick={() => setTab("packing")}>
          🧳 Packing List
        </TabButton>
      </nav>

      <div className="tab-content">
        {isLoading && (
          <div className="state-card">
            <div className="spinner" />
            <p>Loading Madrid forecast…</p>
          </div>
        )}

        {isError && (
          <div className="state-card error">
            <p>
              {error instanceof Error
                ? error.message
                : "Unable to load the forecast."}
            </p>
            <button onClick={() => void refetch()} type="button">
              Try again
            </button>
          </div>
        )}

        {data && tab === "forecast" && <ForecastTab days={data.days} />}
        {data && tab === "outfits" && <OutfitsTab days={data.days} />}
        {data && tab === "packing" && <PackingTab days={data.days} />}
      </div>
    </main>
  );
}

export default App;
