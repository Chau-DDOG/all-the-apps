type DailyForecastRaw = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  precipitation_sum: number[];
  weather_code: number[];
  wind_speed_10m_max: number[];
  sunrise: string[];
  sunset: string[];
};

type ForecastResponse = {
  daily: DailyForecastRaw;
};

export type DailyForecast = {
  date: string;
  high: number;
  low: number;
  precipChance: number;
  precipSum: number;
  weatherCode: number;
  condition: string;
  windSpeed: number;
  sunrise: string;
  sunset: string;
};

export type MadridForecast = {
  days: DailyForecast[];
  fetchedAt: string;
};

const weatherConditions: Record<number, string> = {
  0: "Clear skies",
  1: "Mostly clear",
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
  81: "Rain showers",
  82: "Heavy showers",
  95: "Thunderstorms",
  96: "Storms with hail",
  99: "Severe storms",
};

async function readJson<T>(response: Response, message: string): Promise<T> {
  if (!response.ok) {
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function getMadridForecast(): Promise<MadridForecast> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: "40.4168",
    longitude: "-3.7038",
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "weather_code",
      "wind_speed_10m_max",
      "sunrise",
      "sunset",
    ].join(","),
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    timezone: "Europe/Madrid",
    forecast_days: "16",
  }).toString();

  const forecast = await readJson<ForecastResponse>(
    await fetch(url),
    "The Madrid forecast is temporarily unavailable.",
  );

  const days: DailyForecast[] = forecast.daily.time.map((date, i) => ({
    date,
    high: forecast.daily.temperature_2m_max[i],
    low: forecast.daily.temperature_2m_min[i],
    precipChance: forecast.daily.precipitation_probability_max[i] ?? 0,
    precipSum: forecast.daily.precipitation_sum[i] ?? 0,
    weatherCode: forecast.daily.weather_code[i],
    condition:
      weatherConditions[forecast.daily.weather_code[i]] ?? "Variable conditions",
    windSpeed: forecast.daily.wind_speed_10m_max[i],
    sunrise: forecast.daily.sunrise[i],
    sunset: forecast.daily.sunset[i],
  }));

  return { days, fetchedAt: new Date().toISOString() };
}
