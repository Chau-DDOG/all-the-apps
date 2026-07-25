export type WeatherDay = {
    date: string;
    code: number;
    high: number;
    low: number;
    precipitationChance: number;
};

export type HourWeather = {
    time: string;
    temperature: number;
    code: number;
};

export type WeatherResult = {
    location: {
        city: string;
        state: string;
        zipCode: string;
    };
    observedAt: string;
    timezone: string;
    current: {
        temperature: number;
        feelsLike: number;
        humidity: number;
        windSpeed: number;
        precipitation: number;
        code: number;
        isDay: boolean;
    };
    daily: WeatherDay[];
    hourly: HourWeather[];
};

type ZipResponse = {
    places?: Array<{
        'place name'?: string;
        'state abbreviation'?: string;
        latitude?: string;
        longitude?: string;
    }>;
};

type ForecastResponse = {
    timezone?: string;
    current?: {
        time?: string;
        temperature_2m?: number;
        apparent_temperature?: number;
        relative_humidity_2m?: number;
        precipitation?: number;
        weather_code?: number;
        wind_speed_10m?: number;
        is_day?: number;
    };
    hourly?: {
        time?: string[];
        temperature_2m?: number[];
        weather_code?: number[];
    };
    daily?: {
        time?: string[];
        weather_code?: number[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        precipitation_probability_max?: number[];
    };
};

function requiredNumber(value: number | undefined, field: string) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`Weather provider did not return ${field}.`);
    }
    return value;
}

export async function getWeatherByZip(zipCode: string): Promise<WeatherResult> {
    const normalizedZip = zipCode.trim();
    if (!/^\d{5}$/.test(normalizedZip)) {
        throw new Error('Enter a valid 5-digit US ZIP code.');
    }

    const zipResponse = await fetch(`https://api.zippopotam.us/us/${normalizedZip}`);
    if (zipResponse.status === 404) {
        throw new Error('We could not find that ZIP code.');
    }
    if (!zipResponse.ok) {
        throw new Error('Location lookup is temporarily unavailable.');
    }

    const zipData = (await zipResponse.json()) as ZipResponse;
    const place = zipData.places?.[0];
    const latitude = Number(place?.latitude);
    const longitude = Number(place?.longitude);
    if (!place || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('The location provider returned an incomplete result.');
    }

    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        temperature_unit: 'fahrenheit',
        wind_speed_unit: 'mph',
        precipitation_unit: 'inch',
        timezone: 'auto',
        forecast_days: '6',
        current: [
            'temperature_2m',
            'apparent_temperature',
            'relative_humidity_2m',
            'precipitation',
            'weather_code',
            'wind_speed_10m',
            'is_day',
        ].join(','),
        hourly: ['temperature_2m', 'weather_code'].join(','),
        daily: [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_probability_max',
        ].join(','),
    });
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!weatherResponse.ok) {
        throw new Error('Weather data is temporarily unavailable.');
    }

    const weather = (await weatherResponse.json()) as ForecastResponse;
    const current = weather.current;
    const daily = weather.daily;
    const hourly = weather.hourly;
    if (!current || !daily || !hourly || !current.time) {
        throw new Error('The weather provider returned an incomplete forecast.');
    }

    const currentTime = current.time;
    const currentHour = hourly.time?.findIndex((time) => time >= currentTime) ?? -1;
    const startHour = currentHour >= 0 ? currentHour : 0;
    return {
        location: {
            city: place['place name'] ?? normalizedZip,
            state: place['state abbreviation'] ?? '',
            zipCode: normalizedZip,
        },
        observedAt: currentTime,
        timezone: weather.timezone ?? 'local time',
        current: {
            temperature: requiredNumber(current.temperature_2m, 'temperature'),
            feelsLike: requiredNumber(current.apparent_temperature, 'feels-like temperature'),
            humidity: requiredNumber(current.relative_humidity_2m, 'humidity'),
            windSpeed: requiredNumber(current.wind_speed_10m, 'wind speed'),
            precipitation: requiredNumber(current.precipitation, 'precipitation'),
            code: requiredNumber(current.weather_code, 'conditions'),
            isDay: current.is_day === 1,
        },
        daily: (daily.time ?? []).map((date, index) => ({
            date,
            code: daily.weather_code?.[index] ?? 0,
            high: daily.temperature_2m_max?.[index] ?? 0,
            low: daily.temperature_2m_min?.[index] ?? 0,
            precipitationChance: daily.precipitation_probability_max?.[index] ?? 0,
        })),
        hourly: (hourly.time ?? []).slice(startHour, startHour + 6).map((time, offset) => ({
            time,
            temperature: hourly.temperature_2m?.[startHour + offset] ?? 0,
            code: hourly.weather_code?.[startHour + offset] ?? 0,
        })),
    };
}
