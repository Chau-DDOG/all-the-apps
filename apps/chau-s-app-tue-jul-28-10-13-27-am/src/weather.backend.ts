// Madrid coordinates: 40.4168°N, 3.7038°W
const MADRID_LAT = 40.4168;
const MADRID_LON = -3.7038;
const FORECAST_DAYS = 16;

type OpenMeteoForecast = {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    wind_speed_10m_max: number[];
    uv_index_max: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
  };
};

export type HeatIntensity =
  | "extreme"
  | "very-hot"
  | "hot"
  | "warm"
  | "mild"
  | "cool";

export type DressAdvice = {
  headline: string;
  summary: string;
  wear: string[];
  bring: string[];
  intensity: HeatIntensity;
};

export type DayForecast = {
  date: string;
  high: number;
  low: number;
  feelsLikeHigh: number;
  feelsLikeLow: number;
  precipitationMm: number;
  precipitationChance: number;
  weatherCode: number;
  condition: string;
  windSpeed: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  dressAdvice: DressAdvice;
};

export type MadridForecast = {
  days: DayForecast[];
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

function getDressAdvice(
  _high: number,
  feelsLikeHigh: number,
  precipitationChance: number,
  windSpeed: number,
  uvIndex: number,
): DressAdvice {
  const feels = feelsLikeHigh;
  const rain = precipitationChance >= 35;
  const windy = windSpeed >= 40;
  const highUv = uvIndex >= 7;

  let intensity: HeatIntensity;
  let headline: string;
  let summary: string;
  let wear: string[] = [];
  let bring: string[] = [];

  if (feels >= 38) {
    intensity = "extreme";
    headline = "Extreme heat — stay cool";
    summary =
      "Temperatures are dangerously hot. Wear the least possible, seek shade, and hydrate constantly.";
    wear = ["loose linen or cotton tee", "lightweight shorts or linen trousers"];
    bring = ["high-SPF sunscreen", "sun hat or cap", "water bottle (2L+)"];
  } else if (feels >= 32) {
    intensity = "very-hot";
    headline = "Very hot — dress for the sun";
    summary =
      "Strong summer heat. Light, breathable fabrics and sun protection are essential.";
    wear = ["breathable cotton tee", "light shorts or chinos"];
    bring = ["SPF 50+ sunscreen", "sun hat", "sunglasses", "water bottle"];
  } else if (feels >= 26) {
    intensity = "hot";
    headline = "Hot and sunny";
    summary =
      "Comfortably warm summer day. Light layers work well for morning and evening transitions.";
    wear = ["t-shirt", "light trousers or shorts"];
    bring = ["sunscreen", "sunglasses"];
  } else if (feels >= 20) {
    intensity = "warm";
    headline = "Warm and pleasant";
    summary =
      "Lovely weather for exploring. A light layer in the evening will help.";
    wear = ["cotton tee or light shirt", "trousers or jeans"];
    bring = ["light cardigan for evenings", "sunglasses"];
  } else if (feels >= 14) {
    intensity = "mild";
    headline = "Mild — bring a jacket";
    summary =
      "Comfortable daytime temps but cooler in the shade and evenings.";
    wear = ["long-sleeve top", "light jacket", "jeans or chinos"];
    bring = ["compact umbrella if cloudy"];
  } else {
    intensity = "cool";
    headline = "Cool — layer up";
    summary = "Cooler than usual for Madrid. A proper jacket is needed.";
    wear = ["warm base layer", "sweater", "jacket"];
    bring = ["scarf", "closed-toe shoes"];
  }

  if (rain) {
    bring.unshift("compact umbrella");
    wear.push("water-resistant layer");
  }
  if (windy) {
    bring.push("wind-resistant layer");
  }
  if (highUv && !bring.includes("SPF 50+ sunscreen") && !bring.includes("sunscreen")) {
    bring.push("sunscreen (UV index: " + Math.round(uvIndex) + ")");
  }

  return {
    intensity,
    headline,
    summary,
    wear,
    bring: [...new Set(bring)],
  };
}

async function readJson<T>(response: Response, message: string): Promise<T> {
  if (!response.ok) {
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function getMadridForecast(): Promise<MadridForecast> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(MADRID_LAT),
    longitude: String(MADRID_LON),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "weather_code",
      "wind_speed_10m_max",
      "uv_index_max",
      "sunrise",
      "sunset",
    ].join(","),
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    timezone: "Europe/Madrid",
    forecast_days: String(FORECAST_DAYS),
  }).toString();

  const data = await readJson<OpenMeteoForecast>(
    await fetch(url),
    "Unable to fetch Madrid forecast. Please try again.",
  );

  const days: DayForecast[] = data.daily.time.map((date, i) => {
    const high = data.daily.temperature_2m_max[i];
    const low = data.daily.temperature_2m_min[i];
    const feelsLikeHigh = data.daily.apparent_temperature_max[i];
    const feelsLikeLow = data.daily.apparent_temperature_min[i];
    const precipChance = data.daily.precipitation_probability_max[i] ?? 0;
    const windSpeed = data.daily.wind_speed_10m_max[i] ?? 0;
    const uvIndex = data.daily.uv_index_max[i] ?? 0;
    const code = data.daily.weather_code[i] ?? 0;

    return {
      date,
      high,
      low,
      feelsLikeHigh,
      feelsLikeLow,
      precipitationMm: data.daily.precipitation_sum[i] ?? 0,
      precipitationChance: precipChance,
      weatherCode: code,
      condition: weatherConditions[code] ?? "Variable",
      windSpeed,
      uvIndex,
      sunrise: data.daily.sunrise[i],
      sunset: data.daily.sunset[i],
      dressAdvice: getDressAdvice(
        high,
        feelsLikeHigh,
        precipChance,
        windSpeed,
        uvIndex,
      ),
    };
  });

  return {
    days,
    fetchedAt: new Date().toISOString(),
  };
}
