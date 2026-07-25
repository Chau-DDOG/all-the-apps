import { useQuery } from '@tanstack/react-query';
import { FormEvent, ReactNode, useState } from 'react';

import { getWeather, type DailyForecast, type WeatherForecast } from './weather.backend';
import './styles.css';

type WeatherKind = 'clear' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog';

const SAMPLE_ZIP = '10001';

function UiIcon({ name }: { name: 'pin' | 'drop' | 'rain' | 'wind' | 'swing' | 'hanger' }) {
    const paths = {
        pin: <><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" /><circle cx="12" cy="10" r="2.2" /></>,
        drop: <path d="M12 3S6.5 9.5 6.5 14a5.5 5.5 0 0 0 11 0C17.5 9.5 12 3 12 3Z" />,
        rain: <><path d="M5 14a7 7 0 0 1 14 0H5Z" /><path d="M12 5v13c0 2 2.5 2 2.5.2" /></>,
        wind: <><path d="M3 8h11c3.5 0 3.5-4 1-4-1.3 0-2 .7-2.2 1.5" /><path d="M3 12h16c3.2 0 3.2 4 1 4-1.1 0-1.8-.5-2-1.3M3 16h9" /></>,
        swing: <><path d="M8 4 5 7l3 3M5 7h7M16 20l3-3-3-3M19 17h-7" /></>,
        hanger: <><path d="M10 7.5a2 2 0 1 1 2.6 1.9v2" /><path d="m12.6 11.4 8 5.1a1 1 0 0 1-.6 1.8H4a1 1 0 0 1-.6-1.8l7.2-4.7" /></>,
    };
    return <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function weatherKind(code: number): WeatherKind {
    if (code === 0) return 'clear';
    if (code <= 3) return 'cloud';
    if (code === 45 || code === 48) return 'fog';
    if (code >= 71 && code <= 86) return 'snow';
    if (code >= 95) return 'storm';
    return 'rain';
}

function weatherLabel(code: number) {
    const kind = weatherKind(code);
    return {
        clear: 'Mostly sunny',
        cloud: 'Partly cloudy',
        fog: 'Misty',
        rain: 'Showers',
        snow: 'Snowy',
        storm: 'Stormy',
    }[kind];
}

function WeatherIcon({ code, size = 42 }: { code: number; size?: number }) {
    const kind = weatherKind(code);

    if (kind === 'clear') {
        return (
            <svg className="weather-icon" viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
                <circle cx="32" cy="32" r="11" fill="currentColor" />
                <path d="M32 5v9M32 50v9M5 32h9M50 32h9M13 13l7 7M44 44l7 7M51 13l-7 7M20 44l-7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
            </svg>
        );
    }

    return (
        <svg className={`weather-icon weather-icon--${kind}`} viewBox="0 0 72 64" width={size} height={size} aria-hidden="true">
            <path d="M19 43h37a11 11 0 0 0 1-22 18 18 0 0 0-34-2 12 12 0 0 0-4 24Z" fill="currentColor" />
            {kind === 'rain' && <path d="m24 49-4 8m17-8-4 8m17-8-4 8" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />}
            {kind === 'storm' && <path d="m38 45-7 10h7l-4 8 13-13h-7l5-5Z" fill="#f5a623" />}
            {kind === 'snow' && <text x="20" y="61" fontSize="19" fill="currentColor">✦ ✦</text>}
            {kind === 'fog' && <path d="M14 49h44M20 57h34" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />}
        </svg>
    );
}

function clothingAdvice(day: DailyForecast) {
    const pieces: string[] = [];
    const swing = day.high - day.low;

    if (day.high >= 86) pieces.push('breathable tee and shorts');
    else if (day.high >= 74) pieces.push('light, airy layers');
    else if (day.high >= 60) pieces.push('long sleeves or a light sweater');
    else if (day.high >= 45) pieces.push('warm sweater and jacket');
    else pieces.push('insulated coat, hat, and gloves');

    if (swing >= 18) pieces.push('an easy layer for the evening cool-down');
    if (day.humidity >= 70 && day.high >= 70) pieces.push('moisture-wicking fabric');
    if (day.rainChance >= 40) pieces.push('a packable rain shell');
    if (day.wind >= 20) pieces.push('a wind-resistant outer layer');
    if (day.uvIndex >= 6) pieces.push('sunglasses and SPF');

    return pieces;
}

function formatDay(date: string, index: number) {
    if (index === 0) return 'Today';
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(`${date}T12:00:00`));
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
    return (
        <div className="stat">
                <span className="stat__icon" aria-hidden="true">{icon}</span>
            <div><strong>{value}</strong><span>{label}</span></div>
        </div>
    );
}

function ForecastCard({ day, index }: { day: DailyForecast; index: number }) {
    const advice = clothingAdvice(day);
    return (
        <article className={`forecast-card ${index === 0 ? 'forecast-card--today' : ''}`}>
            <div className="forecast-card__heading">
                <div><span className="forecast-card__day">{formatDay(day.date, index)}</span><span className="forecast-card__date">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${day.date}T12:00:00`))}</span></div>
                <WeatherIcon code={day.weatherCode} />
            </div>
            <div className="forecast-card__temps"><strong>{Math.round(day.high)}°</strong><span>{Math.round(day.low)}°</span></div>
            <p className="forecast-card__condition">{weatherLabel(day.weatherCode)}</p>
            <div className="forecast-card__details">
                <span><UiIcon name="drop" /> {Math.round(day.humidity)}%</span>
                <span><UiIcon name="rain" /> {Math.round(day.rainChance)}%</span>
            </div>
            <div className="forecast-card__wear">
                <span className="eyebrow">Wear this</span>
                <p>{advice[0]}</p>
                {advice.slice(1, 3).map((item) => <span className="wear-note" key={item}>+ {item}</span>)}
            </div>
        </article>
    );
}

function WeatherDashboard({ forecast }: { forecast: WeatherForecast }) {
    const today = forecast.days[0];
    const swing = today.high - today.low;
    const advice = clothingAdvice(today);

    return (
        <>
            <section className="hero-card">
                <div className="hero-card__weather">
                    <div className="hero-card__location-row"><span className="location-pin"><UiIcon name="pin" /></span><span>{forecast.location}</span><span className="zipcode">{forecast.zipCode}</span></div>
                    <div className="hero-card__main">
                        <div><span className="hero-card__temp">{Math.round(today.high)}°</span><span className="hero-card__condition">{weatherLabel(today.weatherCode)}</span></div>
                        <WeatherIcon code={today.weatherCode} size={112} />
                    </div>
                    <div className="hero-card__stats">
                        <Stat icon={<UiIcon name="drop" />} value={`${Math.round(today.humidity)}%`} label="Humidity" />
                        <Stat icon={<UiIcon name="swing" />} value={`${Math.round(swing)}°`} label="Day–night swing" />
                        <Stat icon={<UiIcon name="rain" />} value={`${Math.round(today.rainChance)}%`} label="Chance of rain" />
                        <Stat icon={<UiIcon name="wind" />} value={`${Math.round(today.wind)} mph`} label="Peak wind" />
                    </div>
                </div>
                <aside className="outfit-card">
                    <div className="outfit-card__top"><span className="hanger"><UiIcon name="hanger" /></span><span className="eyebrow">Today’s outfit</span></div>
                    <h2>{advice[0][0].toUpperCase() + advice[0].slice(1)}</h2>
                    <p>{swing >= 18 ? `A ${Math.round(swing)}° drop is expected after the daytime high, so plan for both.` : 'Temperatures stay fairly steady from day to night.'}</p>
                    <div className="outfit-tags">
                        {advice.slice(1).map((item) => <span key={item}>{item}</span>)}
                    </div>
                </aside>
            </section>

            <div className="section-heading"><div><span className="eyebrow">The week ahead</span><h2>7-day outlook</h2></div><span className="units">High / low · °F</span></div>
            <section className="forecast-grid" aria-label="Seven day forecast">
                {forecast.days.map((day, index) => <ForecastCard day={day} index={index} key={day.date} />)}
            </section>
        </>
    );
}

function App() {
    const [zipInput, setZipInput] = useState(SAMPLE_ZIP);
    const [zipCode, setZipCode] = useState(SAMPLE_ZIP);
    const [validationError, setValidationError] = useState('');
    const weatherQuery = useQuery({
        queryKey: ['weather', zipCode],
        queryFn: () => getWeather(zipCode),
        staleTime: 10 * 60 * 1000,
        retry: 1,
    });

    function submitZip(event: FormEvent) {
        event.preventDefault();
        const normalized = zipInput.trim();
        if (!/^\d{5}$/.test(normalized)) {
            setValidationError('Enter a valid 5-digit US ZIP code.');
            return;
        }
        setValidationError('');
        setZipCode(normalized);
    }

    return (
        <main className="app-shell">
            <header className="app-header">
                <a className="brand" href="#top" aria-label="WearCast home"><span className="brand__mark"><span>◒</span></span><span>WearCast</span></a>
                <form className="zip-search" onSubmit={submitZip}>
                    <label htmlFor="zip">Weather for</label>
                    <div className="zip-search__control"><span aria-hidden="true"><UiIcon name="pin" /></span><input id="zip" inputMode="numeric" maxLength={5} value={zipInput} onChange={(event) => setZipInput(event.target.value.replace(/\D/g, ''))} aria-describedby={validationError ? 'zip-error' : undefined} /><button type="submit">Update forecast <span aria-hidden="true">→</span></button></div>
                    {validationError && <span className="form-error" id="zip-error">{validationError}</span>}
                </form>
            </header>

            {weatherQuery.isPending && <div className="status-card"><span className="loader" /><div><strong>Reading the skies…</strong><span>Building your seven-day wardrobe forecast.</span></div></div>}
            {weatherQuery.isError && <div className="status-card status-card--error"><span>!</span><div><strong>We couldn’t find that forecast.</strong><span>{weatherQuery.error instanceof Error ? weatherQuery.error.message : 'Try another ZIP code.'}</span></div></div>}
            {weatherQuery.data && <WeatherDashboard forecast={weatherQuery.data} />}

            <footer><span>Forecast data refreshes every 10 minutes.</span><span>Plan light. Dress right.</span></footer>
        </main>
    );
}

export default App;
