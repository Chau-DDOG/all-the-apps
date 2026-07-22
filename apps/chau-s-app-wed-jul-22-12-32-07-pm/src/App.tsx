import { useMemo, useState } from 'react';

type StageType = 'Flat' | 'Hilly' | 'Mountain';

type Stage = {
    number: number;
    date: string;
    route: string;
    distance: number;
    type: StageType;
    ascent: string;
    finish: string;
    winner: string;
    team: string;
    country: string;
    initials: string;
    probability: number;
    contenders: { name: string; probability: number; color: string }[];
    rationale: string;
};

const stages: Stage[] = [
    {
        number: 17,
        date: 'WED · JUL 22',
        route: 'Chambéry → Voiron',
        distance: 161,
        type: 'Hilly',
        ascent: '2,650 m',
        finish: 'Fast, technical run-in',
        winner: 'Mathieu van der Poel',
        team: 'Alpecin–Deceuninck',
        country: 'NED',
        initials: 'MVDP',
        probability: 29,
        contenders: [
            { name: 'Wout van Aert', probability: 23, color: '#6e59df' },
            { name: 'Tadej Pogačar', probability: 18, color: '#ef476f' },
        ],
        rationale: 'A reduced bunch suits an explosive classics rider who can survive the late climbs.',
    },
    {
        number: 18,
        date: 'THU · JUL 23',
        route: 'Voiron → Orcières-Merlette',
        distance: 185,
        type: 'Mountain',
        ascent: '4,100 m',
        finish: 'Summit · 8.2 km at 6.7%',
        winner: 'Tadej Pogačar',
        team: 'UAE Team Emirates–XRG',
        country: 'SLO',
        initials: 'TP',
        probability: 34,
        contenders: [
            { name: 'Jonas Vingegaard', probability: 30, color: '#6e59df' },
            { name: 'Remco Evenepoel', probability: 17, color: '#ef476f' },
        ],
        rationale: 'The sharp summit finish rewards acceleration more than a long, steady threshold effort.',
    },
    {
        number: 19,
        date: 'FRI · JUL 24',
        route: 'Gap → Alpe d’Huez',
        distance: 128,
        type: 'Mountain',
        ascent: '3,950 m',
        finish: 'Summit · 13.8 km at 8.1%',
        winner: 'Jonas Vingegaard',
        team: 'Team Visma | Lease a Bike',
        country: 'DEN',
        initials: 'JV',
        probability: 31,
        contenders: [
            { name: 'Tadej Pogačar', probability: 30, color: '#6e59df' },
            { name: 'Carlos Rodríguez', probability: 14, color: '#ef476f' },
        ],
        rationale: 'A compact, high-intensity mountain stage favors sustained climbing and careful pacing.',
    },
    {
        number: 20,
        date: 'SAT · JUL 25',
        route: 'Le Bourg-d’Oisans → Alpe d’Huez',
        distance: 171,
        type: 'Mountain',
        ascent: '5,600 m',
        finish: 'Queen stage · High altitude',
        winner: 'Tadej Pogačar',
        team: 'UAE Team Emirates–XRG',
        country: 'SLO',
        initials: 'TP',
        probability: 38,
        contenders: [
            { name: 'Jonas Vingegaard', probability: 32, color: '#6e59df' },
            { name: 'Remco Evenepoel', probability: 12, color: '#ef476f' },
        ],
        rationale: 'The hardest day of the race amplifies GC strength, team depth, and recovery.',
    },
    {
        number: 21,
        date: 'SUN · JUL 26',
        route: 'Thoiry → Paris',
        distance: 130,
        type: 'Flat',
        ascent: '980 m',
        finish: 'Champs-Élysées sprint',
        winner: 'Jonathan Milan',
        team: 'Lidl–Trek',
        country: 'ITA',
        initials: 'JM',
        probability: 33,
        contenders: [
            { name: 'Tim Merlier', probability: 27, color: '#6e59df' },
            { name: 'Jasper Philipsen', probability: 21, color: '#ef476f' },
        ],
        rationale: 'A powerful lead-out and top-end speed make Milan the narrow favorite in Paris.',
    },
];

const typeIcons: Record<StageType, string> = { Flat: '▰', Hilly: '⌁', Mountain: '▲' };

function Icon({ name }: { name: 'calendar' | 'clock' | 'route' | 'sparkle' | 'trophy' }) {
    const paths = {
        calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
        clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
        route: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h2c5 0 0-12 5-12h1" /></>,
        sparkle: <><path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8L12 3Z" /><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" /></>,
        trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 20h8M9 17h6" /></>,
    };
    return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function App() {
    const [filter, setFilter] = useState<'All' | StageType>('All');
    const [selected, setSelected] = useState(17);
    const [watchlist, setWatchlist] = useState<number[]>([18, 20]);
    const [updated, setUpdated] = useState('Updated 8 min ago');

    const visibleStages = useMemo(
        () => stages.filter((stage) => filter === 'All' || stage.type === filter),
        [filter],
    );
    const activeStage = stages.find((stage) => stage.number === selected) ?? stages[0];

    const toggleWatch = (number: number) => {
        setWatchlist((current) =>
            current.includes(number) ? current.filter((item) => item !== number) : [...current, number],
        );
    };

    return (
        <main>
            <header className="topbar">
                <div className="brand">
                    <div className="brand-mark"><span>TF</span></div>
                    <div><strong>Tour Forecaster</strong><small>2026 race intelligence</small></div>
                </div>
                <div className="live-pill"><i /> LIVE · STAGE 17</div>
                <button className="avatar" aria-label="Open profile">CN</button>
            </header>

            <section className="hero">
                <div className="hero-copy">
                    <div className="eyebrow">TOUR DE FRANCE · FINAL WEEK</div>
                    <h1>The road to Paris</h1>
                    <p>Five stages remain. Track the route, the terrain, and our data-led pick for every finish.</p>
                </div>
                <div className="countdown">
                    <span><Icon name="clock" /> NEXT STAGE</span>
                    <strong>02:14:38</strong>
                    <small>Neutral start · 13:20 CEST</small>
                </div>
            </section>

            <section className="stats" aria-label="Tour status">
                <div><Icon name="calendar" /><span><strong>5</strong><small>Stages remaining</small></span></div>
                <div><Icon name="route" /><span><strong>775 km</strong><small>Distance to Paris</small></span></div>
                <div><span className="mountain-symbol">▲</span><span><strong>3</strong><small>Mountain stages</small></span></div>
                <div><Icon name="trophy" /><span><strong>Jul 26</strong><small>Paris finale</small></span></div>
            </section>

            <div className="content-grid">
                <section className="stages-panel">
                    <div className="section-heading">
                        <div><span className="section-kicker">THE RUN-IN</span><h2>Remaining stages</h2></div>
                        <div className="filters">
                            {(['All', 'Flat', 'Hilly', 'Mountain'] as const).map((item) => (
                                <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>
                            ))}
                        </div>
                    </div>

                    <div className="stage-list">
                        {visibleStages.map((stage) => (
                            <article
                                className={`stage-card ${selected === stage.number ? 'selected' : ''}`}
                                key={stage.number}
                                onClick={() => setSelected(stage.number)}
                            >
                                <div className="stage-number"><small>STAGE</small><strong>{stage.number}</strong></div>
                                <div className={`terrain terrain-${stage.type.toLowerCase()}`}>
                                    <span>{typeIcons[stage.type]}</span><small>{stage.type}</small>
                                </div>
                                <div className="stage-route">
                                    <span>{stage.date}</span>
                                    <h3>{stage.route}</h3>
                                    <p>{stage.distance} km <b>·</b> {stage.ascent} climbing <b>·</b> {stage.finish}</p>
                                </div>
                                <div className="mini-pick">
                                    <div className="mini-avatar">{stage.initials}</div>
                                    <span><small>MODEL PICK</small><strong>{stage.winner}</strong></span>
                                    <em>{stage.probability}%</em>
                                </div>
                                <button
                                    className={`bookmark ${watchlist.includes(stage.number) ? 'saved' : ''}`}
                                    onClick={(event) => { event.stopPropagation(); toggleWatch(stage.number); }}
                                    aria-label={`${watchlist.includes(stage.number) ? 'Remove stage' : 'Save stage'} ${stage.number}`}
                                >
                                    <svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4V3Z" /></svg>
                                </button>
                            </article>
                        ))}
                    </div>
                </section>

                <aside className="prediction-panel">
                    <div className="prediction-heading">
                        <span><Icon name="sparkle" /> STAGE {activeStage.number} PROJECTION</span>
                        <span className="confidence">MEDIUM CONFIDENCE</span>
                    </div>
                    <div className="winner">
                        <div className="portrait">{activeStage.initials}<span>{activeStage.country}</span></div>
                        <div>
                            <small>PROJECTED WINNER</small>
                            <h2>{activeStage.winner}</h2>
                            <p>{activeStage.team}</p>
                        </div>
                    </div>
                    <div className="win-probability">
                        <div><span>Win probability</span><strong>{activeStage.probability}%</strong></div>
                        <div className="probability-track"><i style={{ width: `${activeStage.probability}%` }} /></div>
                    </div>
                    <div className="factors">
                        <span>WHY THIS PICK</span>
                        <p>{activeStage.rationale}</p>
                        <div className="factor-tags"><i>Form ↑</i><i>Terrain fit</i><i>Team support</i></div>
                    </div>
                    <div className="contenders">
                        <span>OTHER CONTENDERS</span>
                        {activeStage.contenders.map((rider, index) => (
                            <div className="contender" key={rider.name}>
                                <b>{index + 2}</b>
                                <div className="contender-avatar" style={{ background: rider.color }}>{rider.name.split(' ').map((part) => part[0]).join('')}</div>
                                <strong>{rider.name}</strong>
                                <span>{rider.probability}%</span>
                            </div>
                        ))}
                    </div>
                    <button className="refresh-button" onClick={() => setUpdated('Model refreshed just now')}>
                        <Icon name="sparkle" /> Refresh projection
                    </button>
                    <small className="updated">{updated} · Based on route, form & rider profile</small>
                </aside>
            </div>

            <footer>
                <span><b>TF</b> Predictions are directional and update as race conditions change.</span>
                <span>Route data · Tour de France 2026</span>
            </footer>
        </main>
    );
}

export default App;