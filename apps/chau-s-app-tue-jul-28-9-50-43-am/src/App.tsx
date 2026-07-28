import { useEffect, useMemo, useState } from "react";

type WeatherSource = "Live forecast" | "Trend estimate";

type RemoteWeatherDay = {
  apparentMax?: number;
  apparentMin?: number;
  precipitationProbability?: number;
  precipitationSum?: number;
  temperatureMax?: number;
  temperatureMin?: number;
  uvIndex?: number;
  weatherCode?: number;
  windSpeed?: number;
};

type WeatherDay = {
  accessories: string[];
  apparentMax: number;
  apparentMin: number;
  date: Date;
  dateKey: string;
  emoji: string;
  headline: string;
  layers: string[];
  precipitationProbability: number;
  precipitationSum: number;
  source: WeatherSource;
  summary: string;
  temperatureMax: number;
  temperatureMin: number;
  uvIndex: number;
  weatherCode: number;
  windSpeed: number;
};

type OpenMeteoResponse = {
  daily?: {
    apparent_temperature_max?: number[];
    apparent_temperature_min?: number[];
    precipitation_probability_max?: number[];
    precipitation_sum?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    time?: string[];
    uv_index_max?: number[];
    weather_code?: number[];
    wind_speed_10m_max?: number[];
  };
};

const FORECAST_DAYS = 21;
const MADRID_TIME_ZONE = "Europe/Madrid";
const MADRID_COORDINATES = {
  latitude: "40.4168",
  longitude: "-3.7038",
};

const datePartsFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  timeZone: MADRID_TIME_ZONE,
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: MADRID_TIME_ZONE,
  weekday: "short",
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: MADRID_TIME_ZONE,
  weekday: "long",
});

const updatedAtFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  timeZone: MADRID_TIME_ZONE,
});

const weatherDescriptions: Record<number, { emoji: string; summary: string }> = {
  0: { emoji: "☀️", summary: "Sunny" },
  1: { emoji: "🌤️", summary: "Mostly sunny" },
  2: { emoji: "⛅", summary: "Partly cloudy" },
  3: { emoji: "☁️", summary: "Cloudy" },
  45: { emoji: "🌫️", summary: "Foggy" },
  48: { emoji: "🌫️", summary: "Rime fog" },
  51: { emoji: "🌦️", summary: "Light drizzle" },
  53: { emoji: "🌦️", summary: "Drizzle" },
  55: { emoji: "🌧️", summary: "Heavy drizzle" },
  61: { emoji: "🌦️", summary: "Light rain" },
  63: { emoji: "🌧️", summary: "Rain" },
  65: { emoji: "🌧️", summary: "Heavy rain" },
  80: { emoji: "🌦️", summary: "Passing showers" },
  81: { emoji: "🌧️", summary: "Showers" },
  82: { emoji: "⛈️", summary: "Heavy showers" },
  95: { emoji: "⛈️", summary: "Thunderstorms" },
  96: { emoji: "⛈️", summary: "Storms with hail" },
  99: { emoji: "⛈️", summary: "Severe storms" },
};

function getMadridDateKey(date: Date) {
  const parts = datePartsFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function createDateFromKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

function getMadridToday() {
  return createDateFromKey(getMadridDateKey(new Date()));
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);
  return nextDate;
}

function getDayOfYear(date: Date) {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const millisecondsInDay = 1000 * 60 * 60 * 24;
  return Math.floor((date.getTime() - startOfYear.getTime()) / millisecondsInDay);
}

function getSeasonalMadridEstimate(date: Date, index: number): RemoteWeatherDay {
  const summerFactor =
    (Math.sin(((getDayOfYear(date) - 172) / 365) * Math.PI * 2) + 1) / 2;
  const dryFactor = 1 - summerFactor;
  const dailyWobble = ((date.getDate() + index) % 5) - 2;
  const precipitationProbability = Math.round(8 + dryFactor * 34 + dailyWobble * 2);
  const weatherCode = precipitationProbability > 42 ? 61 : precipitationProbability > 25 ? 3 : 0;
  const temperatureMax = Math.round(11 + summerFactor * 23 + dailyWobble);
  const temperatureMin = Math.round(3 + summerFactor * 17 + dailyWobble * 0.5);

  return {
    apparentMax: temperatureMax + (summerFactor > 0.72 ? 2 : 0),
    apparentMin: temperatureMin,
    precipitationProbability,
    precipitationSum: precipitationProbability > 42 ? 3 : 0,
    temperatureMax,
    temperatureMin,
    uvIndex: Math.round(2 + summerFactor * 8),
    weatherCode,
    windSpeed: Math.round(10 + dryFactor * 10 + Math.abs(dailyWobble) * 2),
  };
}

function getNumber(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getWeatherDescription(weatherCode: number) {
  return (
    weatherDescriptions[weatherCode] ?? {
      emoji: "🌡️",
      summary: "Variable skies",
    }
  );
}

function getOutfitAdvice(day: Omit<WeatherDay, "accessories" | "headline" | "layers">) {
  const layers: string[] = [];
  const accessories: string[] = [];
  let headline = "Balanced layers for a comfortable Madrid day";

  if (day.apparentMax >= 36) {
    headline = "Dress for intense dry heat";
    layers.push("Breathable linen or cotton top", "Loose shorts, skirt, or airy trousers");
    accessories.push("SPF 50", "Wide-brim hat", "Sunglasses", "Refillable water bottle");
  } else if (day.apparentMax >= 30) {
    headline = "Keep it light and sun-ready";
    layers.push("Short sleeves or a light dress", "Lightweight bottoms", "Comfortable sandals or sneakers");
    accessories.push("Sunglasses", "Sunscreen", "Water bottle");
  } else if (day.apparentMax >= 24) {
    headline = "Warm-day outfit with an evening layer";
    layers.push("T-shirt or breezy blouse", "Chinos, skirt, or light trousers");
    accessories.push("Sunglasses");
  } else if (day.apparentMax >= 18) {
    headline = "Mild weather with flexible layers";
    layers.push("Long-sleeve shirt or knit top", "Light jacket for shade and evening");
  } else {
    headline = "Cooler day: layer up";
    layers.push("Warm knit or sweatshirt", "Jacket or coat", "Closed-toe shoes");
  }

  if (day.temperatureMin < 16) {
    layers.push("Pack a light evening layer");
  }

  if (day.precipitationProbability >= 45 || day.precipitationSum >= 1) {
    accessories.push("Compact umbrella", "Water-resistant shoes");
  }

  if (day.windSpeed >= 30) {
    accessories.push("Secure hat or skip loose scarves");
  }

  if (day.uvIndex >= 8 && !accessories.includes("SPF 50")) {
    accessories.push("SPF 50");
  }

  return {
    accessories: [...new Set(accessories)],
    headline,
    layers: [...new Set(layers)],
  };
}

function buildWeatherDay(date: Date, index: number, remoteDay?: RemoteWeatherDay): WeatherDay {
  const trend = getSeasonalMadridEstimate(date, index);
  const weatherCode = Math.round(getNumber(remoteDay?.weatherCode, trend.weatherCode ?? 0));
  const weather = getWeatherDescription(weatherCode);
  const baseDay = {
    apparentMax: Math.round(getNumber(remoteDay?.apparentMax, trend.apparentMax ?? trend.temperatureMax ?? 24)),
    apparentMin: Math.round(getNumber(remoteDay?.apparentMin, trend.apparentMin ?? trend.temperatureMin ?? 14)),
    date,
    dateKey: getMadridDateKey(date),
    emoji: weather.emoji,
    precipitationProbability: Math.round(
      getNumber(remoteDay?.precipitationProbability, trend.precipitationProbability ?? 0),
    ),
    precipitationSum: Number(getNumber(remoteDay?.precipitationSum, trend.precipitationSum ?? 0).toFixed(1)),
    source: remoteDay ? "Live forecast" : "Trend estimate",
    summary: weather.summary,
    temperatureMax: Math.round(getNumber(remoteDay?.temperatureMax, trend.temperatureMax ?? 24)),
    temperatureMin: Math.round(getNumber(remoteDay?.temperatureMin, trend.temperatureMin ?? 14)),
    uvIndex: Math.round(getNumber(remoteDay?.uvIndex, trend.uvIndex ?? 5)),
    weatherCode,
    windSpeed: Math.round(getNumber(remoteDay?.windSpeed, trend.windSpeed ?? 12)),
  } satisfies Omit<WeatherDay, "accessories" | "headline" | "layers">;
  const outfit = getOutfitAdvice(baseDay);

  return {
    ...baseDay,
    ...outfit,
  };
}

function buildThreeWeekForecast(remoteDays: Map<string, RemoteWeatherDay>) {
  const today = getMadridToday();
  return Array.from({ length: FORECAST_DAYS }, (_, index) => {
    const date = addDays(today, index);
    return buildWeatherDay(date, index, remoteDays.get(getMadridDateKey(date)));
  });
}

function buildWeatherUrl() {
  const params = new URLSearchParams({
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "wind_speed_10m_max",
      "uv_index_max",
    ].join(","),
    forecast_days: "16",
    latitude: MADRID_COORDINATES.latitude,
    longitude: MADRID_COORDINATES.longitude,
    precipitation_unit: "mm",
    temperature_unit: "celsius",
    timezone: MADRID_TIME_ZONE,
    wind_speed_unit: "kmh",
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

async function fetchMadridForecast(signal: AbortSignal) {
  const response = await fetch(buildWeatherUrl(), { signal });
  if (!response.ok) {
    throw new Error(`Open-Meteo returned ${response.status}`);
  }

  const payload = (await response.json()) as OpenMeteoResponse;
  if (!payload.daily?.time?.length) {
    throw new Error("Open-Meteo response did not include daily forecast data");
  }

  const remoteDays = new Map<string, RemoteWeatherDay>();
  payload.daily.time.forEach((dateKey, index) => {
    remoteDays.set(dateKey, {
      apparentMax: payload.daily?.apparent_temperature_max?.[index],
      apparentMin: payload.daily?.apparent_temperature_min?.[index],
      precipitationProbability: payload.daily?.precipitation_probability_max?.[index],
      precipitationSum: payload.daily?.precipitation_sum?.[index],
      temperatureMax: payload.daily?.temperature_2m_max?.[index],
      temperatureMin: payload.daily?.temperature_2m_min?.[index],
      uvIndex: payload.daily?.uv_index_max?.[index],
      weatherCode: payload.daily?.weather_code?.[index],
      windSpeed: payload.daily?.wind_speed_10m_max?.[index],
    });
  });

  return buildThreeWeekForecast(remoteDays);
}

function formatTemperature(value: number) {
  return `${Math.round(value)}°C`;
}

function App() {
  const [forecast, setForecast] = useState<WeatherDay[]>(() => buildThreeWeekForecast(new Map()));
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchMadridForecast(controller.signal)
      .then((nextForecast) => {
        setForecast(nextForecast);
        setError(null);
        setUpdatedAt(new Date());
      })
      .catch((nextError: unknown) => {
        if (nextError instanceof DOMException && nextError.name === "AbortError") {
          return;
        }

        setForecast(buildThreeWeekForecast(new Map()));
        setUpdatedAt(new Date());
        setError(nextError instanceof Error ? nextError.message : "Unable to load live weather");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [reloadKey]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const selectedDay = useMemo(
    () => forecast.find((day) => day.dateKey === selectedDateKey) ?? forecast[0],
    [forecast, selectedDateKey],
  );

  const highlights = useMemo(() => {
    const hottestDay = forecast.reduce((currentHottest, day) =>
      day.temperatureMax > currentHottest.temperatureMax ? day : currentHottest,
    );
    const rainyDays = forecast.filter(
      (day) => day.precipitationProbability >= 45 || day.precipitationSum >= 1,
    );
    const liveDays = forecast.filter((day) => day.source === "Live forecast");

    return {
      hottestDay,
      liveDays: liveDays.length,
      rainyDays: rainyDays.length,
    };
  }, [forecast]);

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Madrid · 21-day wardrobe planner</span>
          <h1>Weather and outfit guidance for the next 3 weeks</h1>
          <p>
            Check Madrid's daily forecast, spot hot or rainy stretches, and get a practical dressing plan for every
            day.
          </p>
          <div className="hero-actions">
            <button className="primary-action" disabled={isLoading} onClick={handleRefresh} type="button">
              {isLoading ? "Refreshing…" : "Refresh forecast"}
            </button>
            <span className="update-pill">
              {updatedAt ? `Updated ${updatedAtFormatter.format(updatedAt)} Madrid time` : "Preparing forecast"}
            </span>
          </div>
          {error ? (
            <p className="status-message">
              Live weather could not load ({error}). Showing Madrid seasonal trend estimates until the next refresh.
            </p>
          ) : (
            <p className="status-message">
              Live forecast powers the first {highlights.liveDays} day{highlights.liveDays === 1 ? "" : "s"}; later
              cards use Madrid seasonal trend estimates.
            </p>
          )}
        </div>

        <div className="hero-card" aria-label="Weather highlights">
          <div>
            <span className="metric-label">Peak</span>
            <strong>{formatTemperature(highlights.hottestDay.temperatureMax)}</strong>
            <small>{shortDateFormatter.format(highlights.hottestDay.date)}</small>
          </div>
          <div>
            <span className="metric-label">Umbrella</span>
            <strong>{highlights.rainyDays}</strong>
            <small>days to watch</small>
          </div>
          <div>
            <span className="metric-label">Coverage</span>
            <strong>{highlights.liveDays}/21</strong>
            <small>live daily forecasts</small>
          </div>
        </div>
      </section>

      {selectedDay ? (
        <section className="outfit-panel" aria-live="polite">
          <div className="selected-weather">
            <span className="weather-emoji">{selectedDay.emoji}</span>
            <div>
              <span className="eyebrow dark">{longDateFormatter.format(selectedDay.date)}</span>
              <h2>{selectedDay.headline}</h2>
              <p>
                {selectedDay.summary}. High {formatTemperature(selectedDay.temperatureMax)}, low{" "}
                {formatTemperature(selectedDay.temperatureMin)}, rain chance {selectedDay.precipitationProbability}%.
              </p>
            </div>
          </div>

          <div className="advice-grid">
            <div>
              <h3>Wear</h3>
              <ul>
                {selectedDay.layers.map((layer) => (
                  <li key={layer}>{layer}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Bring</h3>
              <ul>
                {selectedDay.accessories.length > 0 ? (
                  selectedDay.accessories.map((accessory) => <li key={accessory}>{accessory}</li>)
                ) : (
                  <li>Nothing extra beyond your everyday bag</li>
                )}
              </ul>
            </div>
            <div>
              <h3>Weather details</h3>
              <dl>
                <div>
                  <dt>Feels like</dt>
                  <dd>{formatTemperature(selectedDay.apparentMax)}</dd>
                </div>
                <div>
                  <dt>Wind</dt>
                  <dd>{selectedDay.windSpeed} km/h</dd>
                </div>
                <div>
                  <dt>UV index</dt>
                  <dd>{selectedDay.uvIndex}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      ) : null}

      <section className="forecast-grid" aria-label="Daily weather and outfit advice">
        {forecast.map((day) => (
          <button
            aria-pressed={selectedDay?.dateKey === day.dateKey}
            className="day-card"
            key={day.dateKey}
            onClick={() => setSelectedDateKey(day.dateKey)}
            type="button"
          >
            <span className="source-tag">{day.source}</span>
            <span className="day-date">{shortDateFormatter.format(day.date)}</span>
            <span className="day-emoji" aria-hidden="true">
              {day.emoji}
            </span>
            <strong>{day.summary}</strong>
            <span className="temperature-row">
              <span>{formatTemperature(day.temperatureMax)}</span>
              <span>{formatTemperature(day.temperatureMin)}</span>
            </span>
            <span className="mini-advice">{day.headline}</span>
          </button>
        ))}
      </section>
    </main>
  );
}

export default App;