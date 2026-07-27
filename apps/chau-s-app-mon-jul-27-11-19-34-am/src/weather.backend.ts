type GeocodingResult = {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
};

type ForecastResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
  };
};

export type WeatherSnapshot = {
  location: string;
  zipCode: string;
  observedAt: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  weatherCode: number;
  isDay: boolean;
  high: number;
  low: number;
  rainChance: number;
  sunrise: string;
  sunset: string;
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

export async function getWeather(zipCode: string): Promise<WeatherSnapshot> {
  if (!/^\d{5}$/.test(zipCode)) {
    throw new Error("Enter a valid 5-digit US ZIP code.");
  }

  const geocodingUrl = new URL(
    "https://geocoding-api.open-meteo.com/v1/search",
  );
  geocodingUrl.search = new URLSearchParams({
    name: zipCode,
    count: "1",
    language: "en",
    format: "json",
    countryCode: "US",
  }).toString();
  const geocoding = await readJson<{ results?: GeocodingResult[] }>(
    await fetch(geocodingUrl),
    "Unable to find that ZIP code.",
  );
  const place = geocoding.results?.[0];
  if (!place) {
    throw new Error("We could not find that ZIP code. Try another one.");
  }

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.search = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "is_day",
    ].join(","),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "sunrise",
      "sunset",
    ].join(","),
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto",
    forecast_days: "1",
  }).toString();
  const forecast = await readJson<ForecastResponse>(
    await fetch(forecastUrl),
    "The forecast is temporarily unavailable.",
  );

  return {
    location: [place.name, place.admin1].filter(Boolean).join(", "),
    zipCode,
    observedAt: forecast.current.time,
    temperature: forecast.current.temperature_2m,
    feelsLike: forecast.current.apparent_temperature,
    humidity: forecast.current.relative_humidity_2m,
    windSpeed: forecast.current.wind_speed_10m,
    precipitation: forecast.current.precipitation,
    condition:
      weatherConditions[forecast.current.weather_code] ?? "Variable conditions",
    weatherCode: forecast.current.weather_code,
    isDay: Boolean(forecast.current.is_day),
    high: forecast.daily.temperature_2m_max[0],
    low: forecast.daily.temperature_2m_min[0],
    rainChance: forecast.daily.precipitation_probability_max[0] ?? 0,
    sunrise: forecast.daily.sunrise[0],
    sunset: forecast.daily.sunset[0],
  };
}
