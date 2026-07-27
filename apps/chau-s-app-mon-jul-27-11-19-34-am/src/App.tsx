import { useEffect, useState, type ReactNode } from 'react';

import './styles.css';

type Theme = 'light' | 'dark';
type IconName =
    | 'arrow' | 'chevron' | 'cloud' | 'drop' | 'jacket' | 'location'
    | 'moon' | 'rain' | 'search' | 'sun' | 'sunCloud' | 'wind';

type ForecastDay = {
    day: string;
    date: string;
    high: number;
    low: number;
    condition: string;
    rain: number;
    icon: IconName;
};

const forecast: ForecastDay[] = [
    { day: 'Today', date: 'May 24', high: 72, low: 58, condition: 'Partly cloudy', rain: 12, icon: 'sunCloud' },
    { day: 'Sunday', date: 'May 25', high: 68, low: 55, condition: 'Light rain', rain: 64, icon: 'rain' },
    { day: 'Monday', date: 'May 26', high: 74, low: 59, condition: 'Mostly sunny', rain: 8, icon: 'sun' },
    { day: 'Tuesday', date: 'May 27', high: 77, low: 62, condition: 'Partly cloudy', rain: 18, icon: 'sunCloud' },
    { day: 'Wednesday', date: 'May 28', high: 70, low: 57, condition: 'Cloudy', rain: 32, icon: 'cloud' },
];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
    const paths: Record<IconName, ReactNode> = {
        arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
        chevron: <path d="m9 18 6-6-6-6" />,
        cloud: <path d="M6.5 18h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.4A3.3 3.3 0 0 0 6.5 18Z" />,
        drop: <path d="M12 3s5 5.4 5 10a5 5 0 0 1-10 0c0-4.6 5-10 5-10Z" />,
        jacket: <><path d="m9 4-4 2-2 6 3 1v7h12v-7l3-1-2-6-4-2" /><path d="M9 4c.4 2 1.4 3 3 3s2.6-1 3-3M12 7v13" /></>,
        location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
        moon: <path d="M20.5 14.2A8 8 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />,
        rain: <><path d="M6.5 15h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.4A3.3 3.3 0 0 0 6.5 15Z" /><path d="m8 18-1 2m6-2-1 2m6-2-1 2" /></>,
        search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
        sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
        sunCloud: <><circle cx="9" cy="8" r="3.5" /><path d="M9 2V1m-5.2 7H2m2.6-4.4-.8-.8m10.6.8.8-.8M14.8 8H16" /><path d="M8 20h9.5a3.5 3.5 0 0 0 .3-7 5.2 5.2 0 0 0-10 1.2A2.9 2.9 0 0 0 8 20Z" /></>,
        wind: <><path d="M3 8h10a2.5 2.5 0 1 0-2.3-3.5M3 12h16M3 16h11a2.5 2.5 0 1 1-2.3 3.5" /></>,
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {paths[name]}
        </svg>
    );
}

function getInitialTheme(): Theme {
    const saved = window.localStorage.getItem('weather-wear-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function App() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
    const [selectedDay, setSelectedDay] = useState(0);
    const selected = forecast[selectedDay];

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        window.localStorage.setItem('weather-wear-theme', theme);
    }, [theme]);

    return (
        <div className="app-shell">
            <header className="topbar">
                <a className="brand" href="#top" aria-label="Weather and Wear home">
                    <span className="brand-mark"><Icon name="sunCloud" size={25} /></span>
                    <span>Weather <i>&</i> Wear</span>
                </a>
                <div className="header-actions">
                    <button className="location-button" type="button"><Icon name="location" size={17} /> Boston, MA <span>⌄</span></button>
                    <button className="icon-button search-button" type="button" aria-label="Search locations"><Icon name="search" /></button>
                    <div className="theme-switch" role="group" aria-label="Color theme">
                        <button className={theme === 'light' ? 'active' : ''} type="button" onClick={() => setTheme('light')} aria-label="Use light mode" aria-pressed={theme === 'light'}><Icon name="sun" size={17} /></button>
                        <button className={theme === 'dark' ? 'active' : ''} type="button" onClick={() => setTheme('dark')} aria-label="Use dark mode" aria-pressed={theme === 'dark'}><Icon name="moon" size={17} /></button>
                    </div>
                    <button className="avatar" type="button" aria-label="Open profile">CN</button>
                </div>
            </header>

            <main id="top">
                <section className="greeting">
                    <div>
                        <p className="eyebrow">SATURDAY, MAY 24</p>
                        <h1>Good morning, Chau.</h1>
                        <p>Here’s what the day feels like—and what to wear for it.</p>
                    </div>
                    <div className="updated"><span /> Updated 2 minutes ago</div>
                </section>

                <div className="dashboard-grid">
                    <section className="weather-card" aria-labelledby="today-weather">
                        <div className="card-label"><span><Icon name={selected.icon} size={17} /> {selected.day === 'Today' ? 'TODAY’S WEATHER' : selected.day.toUpperCase()}</span><small>Feels like {selected.high - 2}°</small></div>
                        <div className="weather-main">
                            <div className="temperature"><strong>{selected.high}°</strong><span><b>F</b><i>/</i>C</span></div>
                            <div className="condition"><h2 id="today-weather">{selected.condition}</h2><p>{selected.high}° high&nbsp;&nbsp;·&nbsp;&nbsp;{selected.low}° low</p></div>
                            <div className="weather-art" aria-hidden="true"><span className="art-sun" /><span className="art-cloud one" /><span className="art-cloud two" /></div>
                        </div>
                        <div className="weather-details">
                            <div><span className="detail-icon"><Icon name="drop" /></span><p>Humidity<strong>62%</strong></p></div>
                            <div><span className="detail-icon"><Icon name="wind" /></span><p>Wind<strong>WSW 8 mph</strong></p></div>
                            <div><span className="detail-icon"><Icon name="sun" /></span><p>UV index<strong>4 · Moderate</strong></p></div>
                            <div><span className="detail-icon"><Icon name="rain" /></span><p>Rain chance<strong>{selected.rain}%</strong></p></div>
                        </div>
                    </section>

                    <aside className="wear-card" aria-labelledby="wear-heading">
                        <div className="card-label accent-label"><span><Icon name="jacket" size={18} /> WHAT TO WEAR</span><small>Smart casual</small></div>
                        <div className="outfit-visual" aria-hidden="true">
                            <div className="outfit-glow" /><div className="shirt"><i /><span /><b /></div><div className="pants"><span /></div><div className="shoe left" /><div className="shoe right" />
                        </div>
                        <div className="outfit-copy">
                            <h2 id="wear-heading">Light layers win today.</h2>
                            <p>A breathable tee and overshirt will keep you comfortable from the cool morning through a mild afternoon.</p>
                            <div className="tags"><span>Overshirt</span><span>Cotton tee</span><span>Chinos</span><span>Sneakers</span></div>
                        </div>
                        <button className="closet-button" type="button">View picks from your closet <Icon name="arrow" size={17} /></button>
                    </aside>
                </div>

                <section className="forecast-section" aria-labelledby="forecast-heading">
                    <div className="section-heading"><div><p className="eyebrow">PLAN AHEAD</p><h2 id="forecast-heading">5-day forecast</h2></div><button type="button">Hourly forecast <Icon name="arrow" size={16} /></button></div>
                    <div className="forecast-row">
                        {forecast.map((day, index) => (
                            <button className={`forecast-day ${selectedDay === index ? 'selected' : ''}`} type="button" key={day.day} onClick={() => setSelectedDay(index)} aria-pressed={selectedDay === index}>
                                <span><strong>{day.day}</strong><small>{day.date}</small></span><i className="forecast-icon"><Icon name={day.icon} size={30} /></i><span className="high-low"><strong>{day.high}°</strong><small>{day.low}°</small></span><span className="rain-chance"><Icon name="drop" size={13} /> {day.rain}%</span><Icon name="chevron" size={16} />
                            </button>
                        ))}
                    </div>
                </section>

                <section className="tip-card">
                    <span className="tip-icon"><Icon name="sun" size={23} /></span><div><p className="eyebrow">STYLE NOTE</p><h3>Keep sunglasses within reach.</h3><p>Cloud cover breaks around noon, with the brightest stretch between 1–4 PM.</p></div><button type="button" aria-label="Open style note"><Icon name="arrow" /></button>
                </section>
            </main>
            <footer><span>Weather & Wear</span><p>Forecast data refreshed locally · <button type="button">How recommendations work</button></p></footer>
        </div>
    );
}

export default App;
