export interface DailyForecast {
    date: string;
    high: number;
    low: number;
    apparentHigh: number;
    apparentLow: number;
    humidity: number;
    rainChance: number;
    weatherCode: number;
    uvIndex: number;
    wind: number;
}

export interface WeatherForecast {
    zipCode: string;
    location: string;
    timezone: string;
    days: DailyForecast[];
}

interface GeocodingResult {
    name: string;
    admin1?: string;
    country_code: string;
    latitude: number;
    longitude: number;
    timezone: string;
    postcodes?: string[];
}

interface ForecastResponse {
    timezone: string;
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        apparent_temperature_max: number[];
        apparent_temperature_min: number[];
        relative_humidity_2m_mean: number[];
        precipitation_probability_max: number[];
        weather_code: number[];
        uv_index_max: number[];
        wind_speed_10m_max: number[];
    };
}

export async function getWeather(zipCode: string): Promise<WeatherForecast> {
    if (!/^\d{5}$/.test(zipCode)) throw new Error('Enter a valid 5-digit US ZIP code.');

    const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geoUrl.search = new URLSearchParams({ name: zipCode, count: '10', language: 'en', format: 'json', countryCode: 'US' }).toString();
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error('Location lookup is temporarily unavailable.');
    const geoData = await geoResponse.json() as { results?: GeocodingResult[] };
    const location = geoData.results?.find((result) => result.postcodes?.includes(zipCode)) ?? geoData.results?.[0];
    if (!location) throw new Error('No US location was found for that ZIP code.');

    const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
    forecastUrl.search = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,relative_humidity_2m_mean,precipitation_probability_max,uv_index_max,wind_speed_10m_max',
        temperature_unit: 'fahrenheit',
        wind_speed_unit: 'mph',
        precipitation_unit: 'inch',
        timezone: 'auto',
        forecast_days: '7',
    }).toString();
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) throw new Error('The seven-day forecast is temporarily unavailable.');
    const forecast = await forecastResponse.json() as ForecastResponse;
    if (!forecast.daily?.time?.length) throw new Error('The forecast returned no daily weather data.');

    return {
        zipCode,
        location: [location.name, location.admin1].filter(Boolean).join(', '),
        timezone: forecast.timezone,
        days: forecast.daily.time.slice(0, 7).map((date, index) => ({
            date,
            high: forecast.daily.temperature_2m_max[index],
            low: forecast.daily.temperature_2m_min[index],
            apparentHigh: forecast.daily.apparent_temperature_max[index],
            apparentLow: forecast.daily.apparent_temperature_min[index],
            humidity: forecast.daily.relative_humidity_2m_mean[index],
            rainChance: forecast.daily.precipitation_probability_max[index],
            weatherCode: forecast.daily.weather_code[index],
            uvIndex: forecast.daily.uv_index_max[index],
            wind: forecast.daily.wind_speed_10m_max[index],
        })),
    };
}
