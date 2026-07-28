export type DailyForecast = {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  precipitationProb: number;
  windspeed: number;
  weatherCode: number;
  uvIndex: number;
};

export type MadridForecast = {
  daily: DailyForecast[];
  generatedAt: string;
};

type OpenMeteoResponse = {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: (number | null)[];
    windspeed_10m_max: number[];
    weathercode: number[];
    uv_index_max: (number | null)[];
    precipitation_probability_max: (number | null)[];
  };
};

export async function getMadridForecast(): Promise<MadridForecast> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: "40.4168",
    longitude: "-3.7038",
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "windspeed_10m_max",
      "weathercode",
      "uv_index_max",
      "precipitation_probability_max",
    ].join(","),
    forecast_days: "21",
    timezone: "Europe/Madrid",
  }).toString();

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather fetch failed: ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoResponse;

  const daily: DailyForecast[] = data.daily.time.map((date, i) => ({
    date,
    tempMax: Math.round(data.daily.temperature_2m_max[i]),
    tempMin: Math.round(data.daily.temperature_2m_min[i]),
    precipitation: Math.round((data.daily.precipitation_sum[i] ?? 0) * 10) / 10,
    precipitationProb: data.daily.precipitation_probability_max[i] ?? 0,
    windspeed: Math.round(data.daily.windspeed_10m_max[i]),
    weatherCode: data.daily.weathercode[i],
    uvIndex: Math.round(data.daily.uv_index_max[i] ?? 0),
  }));

  return { daily, generatedAt: new Date().toISOString() };
}
