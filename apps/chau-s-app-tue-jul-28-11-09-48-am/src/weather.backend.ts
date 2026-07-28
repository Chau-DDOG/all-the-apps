export interface DayForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipProbMax: number;
  precipSum: number;
  windSpeedMax: number;
  uvIndexMax: number;
}

export interface MadridForecastResult {
  days: DayForecast[];
}

export async function getMadridForecast(): Promise<MadridForecastResult> {
  const params = new URLSearchParams({
    latitude: "40.4168",
    longitude: "-3.7038",
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "wind_speed_10m_max",
      "uv_index_max",
    ].join(","),
    timezone: "Europe/Madrid",
    forecast_days: "16",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Weather fetch failed: ${response.status} ${response.statusText}`);
  }

  const raw = (await response.json()) as {
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_probability_max: (number | null)[];
      precipitation_sum: (number | null)[];
      wind_speed_10m_max: (number | null)[];
      uv_index_max: (number | null)[];
    };
  };

  const d = raw.daily;
  return {
    days: d.time.map((date, i) => ({
      date,
      weatherCode: d.weather_code[i],
      tempMax: d.temperature_2m_max[i],
      tempMin: d.temperature_2m_min[i],
      precipProbMax: d.precipitation_probability_max[i] ?? 0,
      precipSum: d.precipitation_sum[i] ?? 0,
      windSpeedMax: d.wind_speed_10m_max[i] ?? 0,
      uvIndexMax: d.uv_index_max[i] ?? 0,
    })),
  };
}
