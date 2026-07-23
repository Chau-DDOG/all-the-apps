import { useState } from 'react';

type Terrain = 'Sprint' | 'Hills' | 'Mountains';

type Stage = {
    number: number;
    date: string;
    route: string;
    distance: number;
    terrain: Terrain;
    climbing: string;
    profile: number[];
    pick: string;
    team: string;
    country: string;
    probability: number;
    confidence: 'High' | 'Medium';
    reason: string;
    contenders: Array<{ name: string; probability: number }>;
};

const stages: Stage[] = [
    {
        number: 18,
        date: 'THU 23 JUL',
        route: 'Voiron to Orcières-Merlette',
        distance: 185,
        terrain: 'Mountains',
        climbing: '4,100 m ascent',
        profile: [12, 18, 22, 38, 30, 52, 44, 68, 88],
        pick: 'Tadej Pogačar',
        team: 'UAE Team Emirates-XRG',
        country: 'SLO',
        probability: 34,
        confidence: 'Medium',
        reason: 'The sharp final climb rewards repeat accelerations. Current form and team depth give Pogačar the narrowest of edges.',
        contenders: [
            { name: 'Jonas Vingegaard', probability: 30 },
            { name: 'Remco Evenepoel', probability: 17 },
            { name: 'Felix Gall', probability: 8 },
        ],
    },
    {
        number: 19,
        date: 'FRI 24 JUL',
        route: 'Gap to Alpe d’Huez',
        distance: 128,
        terrain: 'Mountains',
        climbing: '3,950 m ascent',
        profile: [15, 42, 68, 34, 49, 31, 62, 90, 100],
        pick: 'Jonas Vingegaard',
        team: 'Team Visma | Lease a Bike',
        country: 'DEN',
        probability: 31,
        confidence: 'Medium',
        reason: 'A short stage with sustained gradients favors measured pacing. Vingegaard projects strongest when the decisive effort lasts over 30 minutes.',
        contenders: [
            { name: 'Tadej Pogačar', probability: 30 },
            { name: 'Carlos Rodríguez', probability: 14 },
            { name: 'Primož Roglič', probability: 9 },
        ],
    },
    {
        number: 20,
        date: 'SAT 25 JUL',
        route: 'Le Bourg-d’Oisans to Alpe d’Huez',
        distance: 171,
        terrain: 'Mountains',
        climbing: '5,600 m ascent',
        profile: [18, 48, 82, 38, 70, 96, 53, 76, 100],
        pick: 'Tadej Pogačar',
        team: 'UAE Team Emirates-XRG',
        country: 'SLO',
        probability: 38,
        confidence: 'High',
        reason: 'The queen stage magnifies recovery, team support, and GC strength. The model expects the race leader to control the final ascent.',
        contenders: [
            { name: 'Jonas Vingegaard', probability: 32 },
            { name: 'Remco Evenepoel', probability: 12 },
            { name: 'Ben Healy', probability: 6 },
        ],
    },
    {
        number: 21,
        date: 'SUN 26 JUL',
        route: 'Thoiry to Paris',
        distance: 130,
        terrain: 'Sprint',
        climbing: '980 m ascent',
        profile: [20, 28, 18, 24, 16, 14, 12, 10, 8],
        pick: 'Jonathan Milan',
        team: 'Lidl-Trek',
        country: 'ITA',
        probability: 33,
        confidence: 'Medium',
        reason: 'The Paris finish should reward raw speed and an organized lead-out. Milan rates best on both, though positioning keeps this open.',
        contenders: [
            { name: 'Tim Merlier', probability: 27 },
            { name: 'Jasper Philipsen', probability: 21 },
            { name: 'Biniam Girmay', probability: 8 },
        ],
    },
];

const terrainFilters: Array<'All' | Terrain> = ['All', 'Sprint', 'Hills', 'Mountains'];

function RiderMark({ name }: { name: string }) {
    return <span className="rider-mark">{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>;
}

function App() {
    const [selectedStage, setSelectedStage] = useState(stages[0].number);
    const [terrain, setTerrain] = useState<'All' | Terrain>('All');
    const [savedStages, setSavedStages] = useState<number[]>([20]);
    const [updatedAt, setUpdatedAt] = useState('8 min ago');

    const activeStage = stages.find((stage) => stage.number === selectedStage) ?? stages[0];
    const visibleStages = stages.filter((stage) => terrain === 'All' || stage.terrain === terrain);

    const toggleSaved = (stageNumber: number) => {
        setSavedStages((current) =>
            current.includes(stageNumber)
                ? current.filter((number) => number !== stageNumber)
                : [...current, stageNumber],
        );
    };

    return (
        <main>
            <header className="site-header">
                <a className="brand" href="#top" aria-label="Predict the Tour home">
                    <span className="brand-wheel"><i /></span>
                    <span><b>PREDICT</b> THE TOUR</span>
                </a>
                <div className="race-status"><i /> FINAL WEEK <span>4 stages remain</span></div>
                <button className="profile-button" aria-label="Open profile">CN</button>
            </header>

            <section className="hero" id="top">
                <div className="hero-copy">
                    <p className="eyebrow">TOUR DE FRANCE 2026 / MODEL FORECAST</p>
                    <h1>Who wins<br />the road ahead?</h1>
                    <p className="intro">Explore every remaining stage and see who our race model backs when the road tilts up, breaks apart, or barrels into Paris.</p>
                </div>
                <div className="hero-stage">
                    <span>NEXT UP / STAGE {stages[0].number}</span>
                    <strong>{stages[0].route.replace(' to ', ' → ')}</strong>
                    <div><b>185 KM</b><b>SUMMIT FINISH</b><b>13:20 CEST</b></div>
                </div>
                <div className="route-line" aria-hidden="true"><i /><i /><i /><i /></div>
            </section>

            <section className="dashboard">
                <div className="stage-column">
                    <div className="section-header">
                        <div>
                            <p className="eyebrow dark">THE RUN-IN</p>
                            <h2>Remaining stages</h2>
                        </div>
                        <div className="filters" aria-label="Filter stages by terrain">
                            {terrainFilters.map((filter) => (
                                <button
                                    className={terrain === filter ? 'active' : ''}
                                    key={filter}
                                    onClick={() => setTerrain(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="stage-list">
                        {visibleStages.map((stage) => (
                            <article
                                className={`stage-card ${selectedStage === stage.number ? 'selected' : ''}`}
                                key={stage.number}
                                onClick={() => setSelectedStage(stage.number)}
                            >
                                <div className="stage-index"><span>STAGE</span><b>{stage.number}</b></div>
                                <div className="stage-main">
                                    <p>{stage.date} <i /> {stage.terrain.toUpperCase()}</p>
                                    <h3>{stage.route.replace(' to ', ' → ')}</h3>
                                    <span>{stage.distance} km&nbsp;&nbsp;·&nbsp;&nbsp;{stage.climbing}</span>
                                </div>
                                <div className="profile-chart" aria-label={`${stage.terrain} stage profile`}>
                                    <svg viewBox="0 0 180 55" preserveAspectRatio="none">
                                        <polygon points={`0,55 ${stage.profile.map((height, index) => `${index * 22.5},${55 - height * 0.5}`).join(' ')} 180,55`} />
                                        <polyline points={stage.profile.map((height, index) => `${index * 22.5},${55 - height * 0.5}`).join(' ')} />
                                    </svg>
                                </div>
                                <div className="card-pick">
                                    <RiderMark name={stage.pick} />
                                    <span><small>MODEL PICK</small><b>{stage.pick}</b></span>
                                    <em>{stage.probability}%</em>
                                </div>
                                <button
                                    className={`save-button ${savedStages.includes(stage.number) ? 'saved' : ''}`}
                                    aria-label={`${savedStages.includes(stage.number) ? 'Unsave' : 'Save'} stage ${stage.number}`}
                                    onClick={(event) => { event.stopPropagation(); toggleSaved(stage.number); }}
                                >
                                    <svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4V3Z" /></svg>
                                </button>
                            </article>
                        ))}
                        {visibleStages.length === 0 && <p className="empty-state">No hilly stages remain in this edition.</p>}
                    </div>
                </div>

                <aside className="forecast-card">
                    <div className="forecast-topline">
                        <span>STAGE {activeStage.number} FORECAST</span>
                        <b className={activeStage.confidence.toLowerCase()}>{activeStage.confidence} confidence</b>
                    </div>
                    <div className="winner-block">
                        <RiderMark name={activeStage.pick} />
                        <div><small>PROJECTED WINNER</small><h2>{activeStage.pick}</h2><p>{activeStage.team} · {activeStage.country}</p></div>
                    </div>
                    <div className="probability">
                        <div><span>Win probability</span><strong>{activeStage.probability}%</strong></div>
                        <div className="probability-bar"><i style={{ width: `${activeStage.probability}%` }} /></div>
                    </div>
                    <div className="why">
                        <small>WHY THIS PICK</small>
                        <p>{activeStage.reason}</p>
                        <div><span>FORM ↑</span><span>TERRAIN FIT</span><span>TEAM DEPTH</span></div>
                    </div>
                    <div className="contenders">
                        <small>CHASING THE WIN</small>
                        {activeStage.contenders.map((rider, index) => (
                            <div className="contender" key={rider.name}>
                                <b>0{index + 2}</b><RiderMark name={rider.name} /><span>{rider.name}</span><strong>{rider.probability}%</strong>
                            </div>
                        ))}
                    </div>
                    <button className="refresh" onClick={() => setUpdatedAt('just now')}>
                        <span>↻</span> Refresh forecast
                    </button>
                    <p className="updated">Model updated {updatedAt}</p>
                </aside>
            </section>

            <footer><b>PT / 26</b><span>Predictions are directional and update as race conditions change.</span><span>Route, form, terrain, team strength</span></footer>
        </main>
    );
}

export default App;
