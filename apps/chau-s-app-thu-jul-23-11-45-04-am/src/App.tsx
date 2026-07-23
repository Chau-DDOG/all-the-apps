import { useEffect, useState } from 'react';

import './styles.css';

type Theme = 'light' | 'dark';

const services = [
    { name: 'checkout-api', team: 'Payments', status: 'Healthy', latency: '142 ms', change: '-8%' },
    { name: 'catalog-search', team: 'Discovery', status: 'Healthy', latency: '89 ms', change: '-2%' },
    { name: 'identity-gateway', team: 'Platform', status: 'Watch', latency: '318 ms', change: '+16%' },
];

const activity = [
    { time: '11:42', title: 'Deployment completed', detail: 'checkout-api · v2.14.8', tone: 'violet' },
    { time: '11:36', title: 'Latency monitor recovered', detail: 'catalog-search · p95 below 120 ms', tone: 'green' },
    { time: '11:21', title: 'Watchdog anomaly detected', detail: 'identity-gateway · elevated retries', tone: 'orange' },
];

function Icon({ name }: { name: 'sun' | 'moon' | 'spark' | 'arrow' | 'pulse' }) {
    const paths = {
        sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
        moon: <path d="M20.4 15.2A8.5 8.5 0 0 1 8.8 3.6 8.7 8.7 0 1 0 20.4 15.2Z" />,
        spark: <><path d="m12 2 1.5 5.3L19 9l-5.5 1.7L12 16l-1.5-5.3L5 9l5.5-1.7L12 2Z" /><path d="m5 15 .7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15Z" /></>,
        arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
        pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
    };

    return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function getInitialTheme(): Theme {
    const savedTheme = window.localStorage.getItem('app-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function App() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        window.localStorage.setItem('app-theme', theme);
    }, [theme]);

    return (
        <main className="app-shell">
            <nav className="topbar" aria-label="Main navigation">
                <a className="brand" href="#overview" aria-label="Signal home">
                    <span className="brand-mark"><Icon name="pulse" /></span>
                    <span>signal<span className="brand-dot">.</span></span>
                </a>
                <div className="nav-links">
                    <a className="active" href="#overview">Overview</a>
                    <a href="#services">Services</a>
                    <a href="#activity">Activity</a>
                </div>
                <div className="nav-actions">
                    <div className="theme-switch" aria-label="Color theme">
                        <button
                            type="button"
                            className={theme === 'light' ? 'selected' : ''}
                            aria-label="Use light theme"
                            aria-pressed={theme === 'light'}
                            onClick={() => setTheme('light')}
                        >
                            <Icon name="sun" /><span>Light</span>
                        </button>
                        <button
                            type="button"
                            className={theme === 'dark' ? 'selected' : ''}
                            aria-label="Use dark theme"
                            aria-pressed={theme === 'dark'}
                            onClick={() => setTheme('dark')}
                        >
                            <Icon name="moon" /><span>Dark</span>
                        </button>
                    </div>
                    <button className="profile" type="button" aria-label="Open user menu">CN</button>
                </div>
            </nav>

            <div className="page" id="overview">
                <header className="hero">
                    <div>
                        <div className="eyebrow"><span /> LIVE OPERATIONS · JUL 23</div>
                        <h1>Your systems,<br /><em>in focus.</em></h1>
                        <p>A calm, real-time view of the services your teams rely on.</p>
                    </div>
                    <div className="hero-status">
                        <Icon name="spark" />
                        <span><small>CURRENT POSTURE</small><strong>All systems operational</strong></span>
                    </div>
                </header>

                <section className="metric-grid" aria-label="Key metrics">
                    <article className="metric-card featured">
                        <div className="metric-heading"><span>Request volume</span><span className="trend positive">↑ 12.4%</span></div>
                        <strong>2.8M</strong>
                        <small>requests in the last 24 hours</small>
                        <div className="bars" aria-hidden="true">
                            {[42, 55, 48, 66, 62, 78, 70, 86, 76, 92, 88, 100].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
                        </div>
                    </article>
                    <article className="metric-card">
                        <div className="metric-heading"><span>Service health</span><span className="status-dot" /></div>
                        <strong>99.98%</strong>
                        <small>average availability</small>
                        <div className="meter"><i style={{ width: '92%' }} /></div>
                        <p><b>24</b> healthy <span>·</span> <b>1</b> needs attention</p>
                    </article>
                    <article className="metric-card">
                        <div className="metric-heading"><span>Active incidents</span><span className="quiet-label">LOW</span></div>
                        <strong>1</strong>
                        <small>no customer impact</small>
                        <button className="text-link" type="button">Review incident <Icon name="arrow" /></button>
                    </article>
                </section>

                <div className="content-grid">
                    <section className="panel services-panel" id="services">
                        <div className="panel-heading">
                            <div><span className="section-label">SERVICE PULSE</span><h2>What needs your attention</h2></div>
                            <button className="view-button" type="button">View all <Icon name="arrow" /></button>
                        </div>
                        <div className="service-table">
                            <div className="table-row table-header"><span>Service</span><span>Status</span><span>p95 latency</span><span>24h change</span></div>
                            {services.map((service) => (
                                <div className="table-row" key={service.name}>
                                    <span className="service-name"><i>{service.name.slice(0, 2).toUpperCase()}</i><span><strong>{service.name}</strong><small>{service.team}</small></span></span>
                                    <span className={`service-status ${service.status.toLowerCase()}`}><i />{service.status}</span>
                                    <strong>{service.latency}</strong>
                                    <span className={service.change.startsWith('+') ? 'change-up' : 'change-down'}>{service.change}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <aside className="panel activity-panel" id="activity">
                        <div className="panel-heading"><div><span className="section-label">LIVE FEED</span><h2>Recent activity</h2></div></div>
                        <div className="activity-list">
                            {activity.map((item) => (
                                <article key={item.time}>
                                    <span className={`activity-mark ${item.tone}`}><i /></span>
                                    <div><strong>{item.title}</strong><p>{item.detail}</p></div>
                                    <time>{item.time}</time>
                                </article>
                            ))}
                        </div>
                        <button className="activity-link" type="button">Open activity stream <Icon name="arrow" /></button>
                    </aside>
                </div>
            </div>
        </main>
    );
}

export default App;
