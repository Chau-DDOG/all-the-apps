import { useQuery } from '@tanstack/react-query';
import { FormEvent, type ReactNode, useState } from 'react';

import { getWeatherByZip, type WeatherResult } from './weather.backend';
import './styles.css';

const sampleWeather: WeatherResult = {
    location: { city: 'Brooklyn', state: 'NY', zipCode: '11201' },
    observedAt: '2026-07-25T10:00',
    timezone: 'America/New_York',
    current: { temperature: 72, feelsLike: 70, humidity: 64, windSpeed: 8, precipitation: 0, code: 2, isDay: true },
    hourly: [
        { time: '2026-07-25T10:00', temperature: 72, code: 2 },
        { time: '2026-07-25T11:00', temperature: 73, code: 2 },
        { time: '2026-07-25T12:00', temperature: 75, code: 1 },
        { time: '2026-07-25T13:00', temperature: 76, code: 1 },
        { time: '2026-07-25T14:00', temperature: 77, code: 0 },
        { time: '2026-07-25T15:00', temperature: 76, code: 1 },
    ],
    daily: [
        { date: '2026-07-25', code: 2, high: 78, low: 65, precipitationChance: 10 },
        { date: '2026-07-26', code: 1, high: 81, low: 67, precipitationChance: 10 },
        { date: '2026-07-27', code: 61, high: 74, low: 64, precipitationChance: 60 },
        { date: '2026-07-28', code: 2, high: 77, low: 63, precipitationChance: 20 },
        { date: '2026-07-29', code: 0, high: 82, low: 67, precipitationChance: 5 },
        { date: '2026-07-30', code: 3, high: 75, low: 62, precipitationChance: 20 },
    ],
};

type IconName = 'search' | 'pin' | 'wind' | 'drop' | 'sun' | 'shirt' | 'shoe' | 'umbrella' | 'layer' | 'arrow';

function Icon({ name }: { name: IconName }) {
    const paths: Record<IconName, ReactNode> = {
        search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
        pin: <><path d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
        wind: <><path d="M4 8h10c3 0 3-4 0-4-1.2 0-2 .7-2 1.6M4 12h15c3 0 3 4 0 4-1.2 0-2-.7-2-1.6M4 16h7" /></>,
        drop: <path d="M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11Z" />,
        sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19" /></>,
        shirt: <path d="m8 4-5 3 3 5 2-1v9h8v-9l2 1 3-5-5-3c-1.5 2-6.5 2-8 0Z" />,
        shoe: <path d="M4 14c3 0 5-2 5-7h3c1 5 3 7 7 7 1.3 0 2 1 2 2.2V19H4c-1.3 0-2-.7-2-2s.7-3 2-3Z" />,
        umbrella: <><path d="M3 12a9 9 0 0 1 18 0H3Zm9-9v17c0 2 3 2 3 0" /><path d="M3 12c1.5-2 3-2 4.5 0 1.5-2 3-2 4.5 0 1.5-2 3-2 4.5 0 1.5-2 3-2 4.5 0" /></>,
        layer: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m4 12 8 4 8-4m-16 5 8 4 8-4" /></>,
        arrow: <><path d="M5 12h14m-5-5 5 5-5 5" /></>,
    };
    return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function WeatherIcon({ code, isDay = true }: { code: number; isDay?: boolean }) {
    const rainy = code >= 51 && code <= 82;
    const stormy = code >= 95;
    const snowy = code >= 71 && code <= 77;
    if (stormy) return <span className="weather-symbol storm">ϟ</span>;
    if (snowy) return <span className="weather-symbol snow">✦</span>;
    if (rainy) return <span className="weather-symbol rain"><i>☁</i><b>•••</b></span>;
    if (code === 0) return <span className={`weather-symbol ${isDay ? 'clear' : 'night'}`}>{isDay ? '☀' : '☾'}</span>;
    return <span className="weather-symbol partly"><i>{isDay ? '☀' : '☾'}</i><b>☁</b></span>;
}

function conditionLabel(code: number) {
    if (code === 0) return 'Clear skies';
    if (code <= 2) return 'Partly cloudy';
    if (code <= 48) return 'Cloudy';
    if (code <= 67) return 'Light rain';
    if (code <= 77) return 'Snowy';
    if (code <= 82) return 'Rain showers';
    return 'Thunderstorms';
}

function getOutfit(weather: WeatherResult) {
    const feels = weather.current.feelsLike;
    const rainChance = weather.daily[0]?.precipitationChance ?? 0;
    const wet = rainChance >= 35 || weather.current.precipitation > 0 || weather.current.code >= 51;
    const windy = weather.current.windSpeed >= 15;
    const top = feels >= 78 ? 'Breathable tee' : feels >= 62 ? 'Light layers' : feels >= 45 ? 'Warm sweater' : 'Insulated coat';
    const bottom = feels >= 72 ? 'Shorts or linen pants' : feels >= 48 ? 'Comfortable pants' : 'Warm trousers';
    const shoes = wet ? 'Water-resistant shoes' : feels >= 70 ? 'Comfy sneakers' : 'Closed-toe shoes';
    const extra = wet ? 'Pack an umbrella' : feels >= 75 ? 'Bring sunscreen' : windy ? 'Add a windbreaker' : 'Keep a layer handy';
    const note = wet
        ? `There’s a ${rainChance}% chance of rain. Choose quick-dry layers and keep your feet covered.`
        : feels >= 78
            ? 'It will feel warm. Keep fabrics light, breathable, and sun-ready.'
            : feels < 50
                ? 'It will feel chilly. Build warmth with two layers you can adjust.'
                : 'Mild and comfortable—one light layer should handle the day nicely.';
    return { top, bottom, shoes, extra, note };
}

const shortDay = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const longDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const hourFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric' });

function App() {
    const [zipInput, setZipInput] = useState('11201');
    const [activeZip, setActiveZip] = useState('');
    const [validationError, setValidationError] = useState('');
    const weatherQuery = useQuery({
        queryKey: ['weather', activeZip],
        queryFn: () => getWeatherByZip(activeZip),
        enabled: activeZip !== '',
        retry: false,
        initialData: sampleWeather,
    });
    const weather = weatherQuery.data ?? sampleWeather;
    const outfit = getOutfit(weather);

    const submitZip = (event: FormEvent) => {
        event.preventDefault();
        const normalized = zipInput.trim();
        if (!/^\d{5}$/.test(normalized)) {
            setValidationError('Enter a 5-digit US ZIP code.');
            return;
        }
        setValidationError('');
        if (normalized === activeZip) {
            void weatherQuery.refetch();
        } else {
            setActiveZip(normalized);
        }
    };

    return (
        <main>
            <header className="topbar">
                <a className="brand" href="#top" aria-label="Weatherwise home">
                    <span className="brand-icon"><i /><b>☁</b></span>
                    <span><strong>weatherwise</strong><small>forecast your fit</small></span>
                </a>
                <div className="live-status"><i /> Live weather · US ZIP codes</div>
            </header>

            <section className="hero" id="top">
                <div className="hero-intro">
                    <span className="eyebrow">YOUR DAILY WEATHER EDIT</span>
                    <h1>Know the weather.<br /><em>Wear the right thing.</em></h1>
                    <p>One ZIP code. A clear forecast. An outfit that actually makes sense.</p>
                    <form className="search-form" onSubmit={submitZip}>
                        <Icon name="search" />
                        <label className="sr-only" htmlFor="zip">US ZIP code</label>
                        <input id="zip" inputMode="numeric" maxLength={5} value={zipInput} onChange={(event) => setZipInput(event.target.value.replace(/\D/g, ''))} placeholder="Enter ZIP code" />
                        <button type="submit" disabled={weatherQuery.isFetching}>{weatherQuery.isFetching ? 'Checking…' : 'See my forecast'} <Icon name="arrow" /></button>
                    </form>
                    {(validationError || weatherQuery.error) && <p className="error-message" role="alert">{validationError || (weatherQuery.error as Error).message}</p>}
                    <p className="helper-text"><Icon name="pin" /> Try 94107, 10001, or 78701</p>
                </div>

                <div className="current-card">
                    <div className="current-card-head">
                        <div><span className="location"><Icon name="pin" /> {weather.location.city}, {weather.location.state}</span><span className="date">{longDate.format(new Date(`${weather.observedAt}:00`))}</span></div>
                        <span className="zip-pill">{weather.location.zipCode}</span>
                    </div>
                    <div className="current-main">
                        <div className="condition-art"><span className="sun-orbit" /><WeatherIcon code={weather.current.code} isDay={weather.current.isDay} /></div>
                        <div className="temperature"><strong>{Math.round(weather.current.temperature)}°</strong><span>{conditionLabel(weather.current.code)}</span></div>
                    </div>
                    <div className="current-details">
                        <span><Icon name="sun" /><small>Feels like</small><b>{Math.round(weather.current.feelsLike)}°</b></span>
                        <span><Icon name="drop" /><small>Humidity</small><b>{Math.round(weather.current.humidity)}%</b></span>
                        <span><Icon name="wind" /><small>Wind</small><b>{Math.round(weather.current.windSpeed)} mph</b></span>
                    </div>
                </div>
            </section>

            <section className="dashboard">
                <div className="section-heading">
                    <div><span className="section-kicker">TODAY, HOUR BY HOUR</span><h2>Plan the day, not around it.</h2></div>
                    <p>Updated in {weather.timezone.replace('_', ' ')}</p>
                </div>

                <div className="content-grid">
                    <div className="forecast-column">
                        <div className="hourly-card">
                            {weather.hourly.map((hour, index) => (
                                <div className={index === 0 ? 'now' : ''} key={hour.time}>
                                    <span>{index === 0 ? 'Now' : hourFormat.format(new Date(`${hour.time}:00`))}</span>
                                    <WeatherIcon code={hour.code} />
                                    <strong>{Math.round(hour.temperature)}°</strong>
                                </div>
                            ))}
                        </div>

                        <div className="weekly-card">
                            <div className="card-title"><div><span>THE WEEK AHEAD</span><h3>Your 6-day outlook</h3></div><span className="units">°F</span></div>
                            <div className="week-list">
                                {weather.daily.map((day, index) => (
                                    <div className="week-row" key={day.date}>
                                        <div><strong>{index === 0 ? 'Today' : shortDay.format(new Date(`${day.date}T12:00:00`))}</strong><small>{conditionLabel(day.code)}</small></div>
                                        <WeatherIcon code={day.code} />
                                        <span className="rain-chance"><Icon name="drop" />{Math.round(day.precipitationChance)}%</span>
                                        <span className="temp-range"><b>{Math.round(day.high)}°</b><i /><small>{Math.round(day.low)}°</small></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className="outfit-card">
                        <div className="outfit-header">
                            <span className="closet-mark"><Icon name="shirt" /></span>
                            <div><span>YOUR OUTFIT FORECAST</span><h2>Here’s what to wear</h2></div>
                        </div>
                        <p className="outfit-note">{outfit.note}</p>
                        <div className="outfit-list">
                            <div><span><Icon name="shirt" /></span><p><small>ON TOP</small><strong>{outfit.top}</strong></p><b>01</b></div>
                            <div><span><Icon name="layer" /></span><p><small>ON BOTTOM</small><strong>{outfit.bottom}</strong></p><b>02</b></div>
                            <div><span><Icon name="shoe" /></span><p><small>ON YOUR FEET</small><strong>{outfit.shoes}</strong></p><b>03</b></div>
                            <div><span><Icon name={outfit.extra.includes('umbrella') ? 'umbrella' : 'sun'} /></span><p><small>DON’T FORGET</small><strong>{outfit.extra}</strong></p><b>04</b></div>
                        </div>
                        <div className="comfort-meter">
                            <div><span>COMFORT METER</span><strong>{weather.current.feelsLike >= 55 && weather.current.feelsLike <= 78 ? 'Just right' : weather.current.feelsLike > 78 ? 'Warm' : 'Bundle up'}</strong></div>
                            <div className="meter"><i style={{ width: `${Math.max(12, Math.min(95, weather.current.feelsLike))}%` }} /></div>
                            <div className="meter-labels"><span>Chilly</span><span>Perfect</span><span>Toasty</span></div>
                        </div>
                    </aside>
                </div>
            </section>

            <footer><div><span className="brand-icon small"><i /><b>☁</b></span><strong>weatherwise</strong></div><p>Forecast data from Open-Meteo · Dress advice is a friendly suggestion.</p></footer>
        </main>
    );
}

export default App;
