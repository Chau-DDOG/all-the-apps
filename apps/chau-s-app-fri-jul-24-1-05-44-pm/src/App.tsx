import { type CSSProperties, useMemo, useState } from 'react';

type Age = 'both' | '2' | '6';
type Category = 'Play' | 'Nature' | 'Animals' | 'Splash';

type Place = {
    id: number;
    name: string;
    area: string;
    category: Category;
    ages: Exclude<Age, 'both'>[];
    time: string;
    x: number;
    y: number;
    color: string;
    summary: string;
    tip: string;
};

const places: Place[] = [
    { id: 1, name: 'Luitpoldpark', area: 'Schwabing-West', category: 'Play', ages: ['2', '6'], time: '2–3 hrs', x: 28, y: 27, color: '#ed704b', summary: 'Big playgrounds, grassy slopes and shady paths with plenty of room to roam.', tip: 'Start at the playground near Brunnerstraße; the hill is brilliant for scooter laps.' },
    { id: 2, name: 'Petuelpark', area: 'Milbertshofen', category: 'Splash', ages: ['2', '6'], time: '1–2 hrs', x: 52, y: 16, color: '#4f91ad', summary: 'A long green park above the ring with play areas, lawns and water features.', tip: 'Pack a change of clothes on warm days and combine it with a picnic.' },
    { id: 3, name: 'Ungererbad', area: 'Schwabing-Freimann', category: 'Splash', ages: ['2', '6'], time: 'Half day', x: 67, y: 32, color: '#4f91ad', summary: 'Family-friendly outdoor pool with paddling space, lawns and a playground.', tip: 'Best as a warm-weather half day; check seasonal opening before you go.' },
    { id: 4, name: 'Biedersteiner Spielplatz', area: 'Kleinhesselohe', category: 'Play', ages: ['2', '6'], time: '1–2 hrs', x: 72, y: 56, color: '#ed704b', summary: 'A neighborhood playground tucked beside the English Garden’s northern edge.', tip: 'Easy to pair with ducks and a slow walk around Kleinhesseloher See.' },
    { id: 5, name: 'Kleinhesseloher See', area: 'Englischer Garten', category: 'Nature', ages: ['2', '6'], time: '2 hrs', x: 63, y: 68, color: '#5a9b6e', summary: 'Lake loops, bridges, ducks and broad paths for a low-pressure outdoor wander.', tip: 'Bring a balance bike, but keep little ones close around the water.' },
    { id: 6, name: 'Leopoldpark playground', area: 'Münchner Freiheit', category: 'Play', ages: ['2'], time: '45–90 min', x: 45, y: 58, color: '#ed704b', summary: 'A small, central play stop that works well for toddler-sized energy bursts.', tip: 'Use it as a reset between errands or a café stop around Münchner Freiheit.' },
    { id: 7, name: 'SEA LIFE München', area: 'Olympiapark', category: 'Animals', ages: ['2', '6'], time: '2 hrs', x: 14, y: 16, color: '#8b68a7', summary: 'An indoor aquarium with tunnels and close-up marine life for rainy days.', tip: 'Reserve ahead for a quieter entry slot; it is compact enough for a toddler.' },
    { id: 8, name: 'Schenkendorf play meadow', area: 'Alte Heide', category: 'Nature', ages: ['6'], time: '1–2 hrs', x: 82, y: 25, color: '#5a9b6e', summary: 'Open lawns and paths suited to running, ball games and bigger-kid exploring.', tip: 'Bring a ball or frisbee; this one shines when your six-year-old needs space.' },
];

const categoryIcon: Record<Category, string> = { Play: '♜', Nature: '♣', Animals: '◉', Splash: '≈' };

function App() {
    const [age, setAge] = useState<Age>('both');
    const [category, setCategory] = useState<Category | 'All'>('All');
    const [selectedId, setSelectedId] = useState(1);
    const [saved, setSaved] = useState<number[]>([1, 5]);

    const visible = useMemo(
        () => places.filter((place) => (age === 'both' || place.ages.includes(age)) && (category === 'All' || place.category === category)),
        [age, category],
    );
    const selected = places.find((place) => place.id === selectedId) ?? places[0];

    const selectPlace = (id: number) => {
        setSelectedId(id);
        document.querySelector('.place-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    return (
        <main>
            <header className="topbar">
                <a className="brand" href="#top" aria-label="Little Munich Explorers home">
                    <span className="brand-badge">M</span>
                    <span><strong>Little Munich</strong><small>family field notes</small></span>
                </a>
                <div className="weather"><span>☀</span><strong>Schwabing</strong><small>built for little legs</small></div>
                <button className="saved-button" aria-label={`${saved.length} saved places`}>♥ <span>{saved.length} saved</span></button>
            </header>

            <section className="intro" id="top">
                <div>
                    <span className="eyebrow">MUNICH · FAMILY MAP</span>
                    <h1>Small adventures,<br /><em>right around the corner.</em></h1>
                    <p>Eight playful stops around Schwabing, hand-picked for a curious six-year-old and their two-year-old sidekick.</p>
                </div>
                <div className="age-switcher" aria-label="Filter places by age">
                    <span>SHOW ME SPOTS FOR</span>
                    <div>
                        <button className={age === 'both' ? 'active' : ''} onClick={() => setAge('both')}>Both kids</button>
                        <button className={age === '2' ? 'active' : ''} onClick={() => setAge('2')}>Age 2</button>
                        <button className={age === '6' ? 'active' : ''} onClick={() => setAge('6')}>Age 6</button>
                    </div>
                </div>
            </section>

            <section className="explorer">
                <div className="map-column">
                    <div className="map-toolbar">
                        <div><span className="section-kicker">EXPLORE THE NEIGHBORHOOD</span><h2>Schwabing at kid height</h2></div>
                        <div className="category-filters" aria-label="Filter by activity">
                            {(['All', 'Play', 'Nature', 'Animals', 'Splash'] as const).map((item) => (
                                <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>
                            ))}
                        </div>
                    </div>

                    <div className="map" aria-label="Illustrated map of family places around Schwabing">
                        <svg className="map-base" viewBox="0 0 900 590" role="img" aria-label="Stylized street map centered on Schwabing">
                            <path className="park park-one" d="M574 10C710 5 770 70 755 151c-13 67-80 79-75 153 5 81 108 102 89 191-16 75-122 83-196 43-89-49-96-160-71-250 24-88-34-120 8-210 12-26 32-49 64-68Z" />
                            <path className="park park-two" d="M85 54c93-41 193-14 211 53 19 72-65 125-145 111-75-14-135-66-109-119 10-20 24-34 43-45Z" />
                            <path className="isar" d="M847-30c-55 126-21 206-48 300-26 91-84 155-72 352" />
                            <g className="minor-roads">
                                <path d="M25 122 865 472M72 540 818 65M12 355 820 222M306 20 302 570M470 0 442 590M115 10 665 580" />
                                <path d="M0 250 885 340M188 0 730 570M0 470 760 100" />
                            </g>
                            <g className="major-roads">
                                <path d="M340-20c-8 104 16 171 4 265-14 113-57 219-67 366" />
                                <path d="M-20 300c197-6 364-1 536 34 125 25 239 44 405 35" />
                                <path d="M55 190c207-35 388-35 548-8 111 19 183 15 294-10" />
                            </g>
                            <g className="metro-line"><path d="M333 34 345 528" /><circle cx="339" cy="173" r="6" /><circle cx="342" cy="315" r="6" /><circle cx="343" cy="438" r="6" /></g>
                            <text x="360" y="297" className="road-name">LEOPOLDSTRASSE</text>
                            <text x="580" y="515" className="park-name">ENGLISCHER GARTEN</text>
                            <text x="112" y="101" className="park-name">LUITPOLDPARK</text>
                            <text x="858" y="500" className="water-name">ISAR</text>
                            <g className="compass" transform="translate(40 500)"><circle r="23" /><path d="m0-16 5 16-5 16-5-16Z" /><text y="-29">N</text></g>
                        </svg>

                        {visible.map((place) => (
                            <button
                                className={`map-pin ${selected.id === place.id ? 'selected' : ''}`}
                                style={{ left: `${place.x}%`, top: `${place.y}%`, '--pin': place.color } as CSSProperties}
                                onClick={() => selectPlace(place.id)}
                                aria-label={`Open ${place.name}`}
                                key={place.id}
                            >
                                <span>{place.id}</span><b>{place.name}</b>
                            </button>
                        ))}
                        <div className="map-key"><span><i className="u-badge">U</i> U-Bahn</span><span><i className="park-dot" /> parkland</span></div>
                    </div>
                </div>

                <aside className="place-detail" aria-live="polite">
                    <div className="detail-top" style={{ '--accent': selected.color } as CSSProperties}>
                        <span className="detail-number">{selected.id}</span>
                        <span className="detail-icon">{categoryIcon[selected.category]}</span>
                        <button
                            className={saved.includes(selected.id) ? 'saved' : ''}
                            onClick={() => setSaved((items) => items.includes(selected.id) ? items.filter((id) => id !== selected.id) : [...items, selected.id])}
                            aria-label={`${saved.includes(selected.id) ? 'Remove' : 'Add'} ${selected.name} ${saved.includes(selected.id) ? 'from' : 'to'} saved places`}
                        >♥</button>
                    </div>
                    <div className="detail-body">
                        <span className="detail-area">{selected.area} · {selected.category}</span>
                        <h2>{selected.name}</h2>
                        <p>{selected.summary}</p>
                        <div className="facts">
                            <span><small>GOOD FOR</small><strong>{selected.ages.map((item) => `Age ${item}`).join(' + ')}</strong></span>
                            <span><small>ALLOW</small><strong>{selected.time}</strong></span>
                        </div>
                        <div className="parent-tip"><span>✦</span><div><strong>PARENT SHORTCUT</strong><p>{selected.tip}</p></div></div>
                        <button className="next-button" onClick={() => selectPlace(places[(places.findIndex((place) => place.id === selected.id) + 1) % places.length].id)}>Next little adventure <span>→</span></button>
                    </div>
                </aside>
            </section>

            <section className="place-strip">
                <div><span className="section-kicker">QUICK PICKS</span><h2>{visible.length} places for your crew</h2></div>
                <div className="place-list">
                    {visible.map((place) => (
                        <button className={selected.id === place.id ? 'active' : ''} onClick={() => selectPlace(place.id)} key={place.id}>
                            <span style={{ background: place.color }}>{place.id}</span><div><strong>{place.name}</strong><small>{place.category} · {place.time}</small></div>
                        </button>
                    ))}
                </div>
            </section>

            <footer><strong>Little Munich Explorers</strong><span>Made for two small adventurers · Ages 2 + 6</span><span>Always check opening hours before setting off.</span></footer>
        </main>
    );
}

export default App;
