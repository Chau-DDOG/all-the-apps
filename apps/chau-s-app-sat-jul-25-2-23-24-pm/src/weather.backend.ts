import { request } from "@datadog/action-catalog/http/http";

export type ForecastDay = {
  date: string;
  weatherCode: number;
  high: number;
  low: number;
  precipitationChance: number;
  windSpeed: number;
};

export type ClothingPlan = {
  headline: string;
  summary: string;
  layers: string[];
  extras: string[];
};

export type WeatherForecast = {
  location: {
    city: string;
    state: string;
    zipcode: string;
  };
  current: {
    temperature: number;
    feelsLike: number;
    weatherCode: number;
    isDay: boolean;
    precipitation: number;
  };
  days: ForecastDay[];
  clothing: ClothingPlan;
  updatedAt: string;
};

type ZipLookupResponse = {
  "post code": string;
  places: Array<{
    "place name": string;
    state: string;
    latitude: string;
    longitude: string;
  }>;
};

type OpenMeteoResponse = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    is_day: number;
    precipitation: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };
};

function buildClothingPlan(
  current: WeatherForecast["current"],
  today: ForecastDay,
): ClothingPlan {
  const feelsLike = current.feelsLike;
  const layers: string[] = [];
  const extras: string[] = [];

  if (feelsLike < 32) {
    layers.push("Thermal base layer", "Insulated coat", "Warm pants and boots");
  } else if (feelsLike < 50) {
    layers.push("Long-sleeve base", "Cozy sweater", "Medium-weight jacket");
  } else if (feelsLike < 65) {
    layers.push(
      "Breathable tee",
      "Light knit or overshirt",
      "Easy layer for later",
    );
  } else if (feelsLike < 80) {
    layers.push(
      "Lightweight top",
      "Relaxed pants or shorts",
      "Thin evening layer",
    );
  } else {
    layers.push(
      "Airy, loose-fitting top",
      "Shorts or light bottoms",
      "Breathable shoes",
    );
  }

  const wetWeather =
    today.precipitationChance >= 35 ||
        (current.weatherCode >= 51 && current.weatherCode <= 82) ||
        current.weatherCode >= 95;
  if (wetWeather) {
    extras.push("Compact umbrella", "Water-resistant outer layer");
  }
  if (today.windSpeed >= 18) {
    extras.push("Windproof shell");
  }
  if (current.weatherCode <= 3 && current.isDay) {
    extras.push("Sunglasses", "SPF 30+");
  }
  if (feelsLike < 42) {
    extras.push("Warm socks", "Beanie or scarf");
  }
  if (feelsLike >= 80) {
    extras.push("Water bottle", "Sun hat");
  }

  const headline =
    feelsLike < 40
      ? "Bundle up in warm layers"
      : feelsLike < 60
        ? "Layer light, keep a jacket close"
        : feelsLike < 78
          ? "Keep it light and flexible"
          : "Choose cool, breathable pieces";

  const summary = `It feels like ${Math.round(feelsLike)}°F now, with a high near ${Math.round(today.high)}°F. ${
    wetWeather
      ? "Plan for a chance of wet weather."
      : "You can leave the rain gear at home."
  }`;

  return {
    headline,
    summary,
    layers,
    extras: extras.length > 0 ? extras : ["No special accessories needed"],
  };
}

export async function getWeatherForecast(
  zipcode: string,
): Promise<WeatherForecast> {
  if (!/^\d{5}$/.test(zipcode)) {
    throw new Error("Enter a valid 5-digit US ZIP code.");
  }

  const locationResponse = await request({
    inputs: {
      url: `https://api.zippopotam.us/us/${zipcode}`,
      verb: "GET",
      responseParsing: "json",
      errorOnStatus: ["400-599"],
    },
  });
  const location = locationResponse.body as ZipLookupResponse;
  const place = location.places?.[0];

  if (!place) {
    throw new Error("We could not find that ZIP code.");
  }

  const weatherResponse = await request({
    inputs: {
      url: "https://api.open-meteo.com/v1/forecast",
      verb: "GET",
      responseParsing: "json",
      errorOnStatus: ["400-599"],
      urlParams: [
        { key: "latitude", value: place.latitude },
        { key: "longitude", value: place.longitude },
        {
          key: "current",
          value:
            "temperature_2m,apparent_temperature,weather_code,is_day,precipitation",
        },
        {
          key: "daily",
          value:
            "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
        },
        { key: "temperature_unit", value: "fahrenheit" },
        { key: "wind_speed_unit", value: "mph" },
        { key: "timezone", value: "auto" },
        { key: "forecast_days", value: "5" },
      ],
    },
  });
  const weather = weatherResponse.body as OpenMeteoResponse;
  const days = weather.daily.time.map((date, index) => ({
    date,
    weatherCode: weather.daily.weather_code[index],
    high: weather.daily.temperature_2m_max[index],
    low: weather.daily.temperature_2m_min[index],
    precipitationChance: weather.daily.precipitation_probability_max[index],
    windSpeed: weather.daily.wind_speed_10m_max[index],
  }));
  const current = {
    temperature: weather.current.temperature_2m,
    feelsLike: weather.current.apparent_temperature,
    weatherCode: weather.current.weather_code,
    isDay: weather.current.is_day === 1,
    precipitation: weather.current.precipitation,
  };

  return {
    location: {
      city: place["place name"],
      state: place.state,
      zipcode: location["post code"],
    },
    current,
    days,
    clothing: buildClothingPlan(current, days[0]),
    updatedAt: new Date().toISOString(),
  };
}
