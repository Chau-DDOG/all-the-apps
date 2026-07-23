import { useState } from 'react';

type Pace = 'Low-key' | 'Balanced' | 'Big day';

type Day = {
    day: number;
    base: 'Munich' | 'Hotel Buchau';
    title: string;
    subtitle: string;
    pace: Pace;
    travel: string;
    playgrounds: number;
    morning: string;
    afternoon: string;
    reset: string;
    snack: string;
    tags: string[];
};

const days: Day[] = [
    { day: 1, base: 'Munich', title: 'Land, wander, exhale', subtitle: 'Old Town in tiny bites', pace: 'Low-key', travel: '20 min', playgrounds: 2, morning: 'Arrive and settle in. Keep the first outing to a gentle loop through Marienplatz and Viktualienmarkt.', afternoon: 'Let the kids lead at the playground in the Alter Botanischer Garten, then stop at the fountain by Karlsplatz.', reset: 'Early dinner and an unhurried bedtime. Skip the tower climb today.', snack: 'Pretzel picnic from Viktualienmarkt', tags: ['stroller easy', 'city', 'jet-lag proof'] },
    { day: 2, base: 'Munich', title: 'Isar wild play', subtitle: 'Deutsches Museum + river parks', pace: 'Balanced', travel: '25 min', playgrounds: 3, morning: 'Choose just one child-friendly section of the Deutsches Museum, with the Kids’ Kingdom as the anchor.', afternoon: 'Cross to the playground at Frühlingsanlagen, then follow the Isar north for pebble throwing and shady stops.', reset: 'The two-year-old can nap in the stroller along the river path.', snack: 'Bakery stop near Gärtnerplatz', tags: ['hands-on', 'water play', 'rain option'] },
    { day: 3, base: 'Munich', title: 'Forest giants & beer-garden slides', subtitle: 'Hellabrunn Zoo + Flaucher', pace: 'Big day', travel: '30 min', playgrounds: 4, morning: 'Arrive at Tierpark Hellabrunn for opening and pick three animal zones rather than chasing the whole map.', afternoon: 'Use the zoo playgrounds, then walk to the Flaucher riverbanks. Finish at a family-friendly beer garden.', reset: 'Bring the carrier: zoo paths add up quickly for little legs.', snack: 'Pack fruit; buy lunch inside the zoo', tags: ['animals', 'shaded', 'full day'] },
    { day: 4, base: 'Munich', title: 'Castles for them, gardens for you', subtitle: 'Nymphenburg + Hirschgarten', pace: 'Balanced', travel: '30 min', playgrounds: 3, morning: 'Tour only the palace’s main rooms, then trade interiors for ducks, bridges, and open garden paths.', afternoon: 'Take the tram to Hirschgarten for deer watching, a large playground, and a relaxed outdoor meal.', reset: 'Palace gardens work well for a stroller nap between stops.', snack: 'Bring coins for an ice cream stop', tags: ['palace', 'deer', 'stroller easy'] },
    { day: 5, base: 'Munich', title: 'Olympic loops & hilltop views', subtitle: 'Olympiapark + Sea Life', pace: 'Balanced', travel: '25 min', playgrounds: 3, morning: 'Explore Olympiapark’s wide paths and climb only as high on Olympiaberg as everyone is enjoying.', afternoon: 'Pick Sea Life for hot or rainy weather; otherwise continue to the playgrounds around the park and BMW Welt.', reset: 'Make the aquarium optional, not the day’s deadline.', snack: 'Picnic on the grassy slopes', tags: ['views', 'rain option', 'scooter friendly'] },
    { day: 6, base: 'Hotel Buchau', title: 'Train to the lake', subtitle: 'Munich → Jenbach → Buchau', pace: 'Low-key', travel: '2 hr 15', playgrounds: 2, morning: 'Take a direct or one-change train to Jenbach. Reserve seats and keep a small surprise bag for the last hour.', afternoon: 'Check in at Hotel Buchau, then walk to the lakefront playground and shallow beach by Buchau.', reset: 'No major attraction today. Groceries, a swim, dinner, bed.', snack: 'Train picnic packed in Munich', tags: ['transfer', 'lake', 'easy win'] },
    { day: 7, base: 'Hotel Buchau', title: 'Barefoot by Achensee', subtitle: 'Buchau beach + Atoll Achensee', pace: 'Low-key', travel: '10 min', playgrounds: 3, morning: 'Start at Buchau’s lakeside play area while the beach is quiet. Alternate sand, swings, and paddling.', afternoon: 'Walk or bus to Atoll Achensee for the family pool and indoor option if mountain weather turns.', reset: 'Return to the hotel for nap time between the lake and pool.', snack: 'Lakeside picnic with backup warm layers', tags: ['swimming', 'walkable', 'rain option'] },
    { day: 8, base: 'Hotel Buchau', title: 'Up the mountain, not the mileage', subtitle: 'Rofan cable car + sky-high play', pace: 'Big day', travel: '15 min', playgrounds: 2, morning: 'Ride the Rofan cable car from Maurach. Stay near the top station for views and short family trails.', afternoon: 'Let the six-year-old explore the mountain play elements while the toddler gets a carrier nap. Descend before late-day weather.', reset: 'Do not bring a stroller on rough paths; use a structured carrier.', snack: 'Lunch at a mountain hut', tags: ['cable car', 'mountain', 'carrier day'] },
    { day: 9, base: 'Hotel Buchau', title: 'Boats, goats & gravel paths', subtitle: 'Pertisau + lakeside promenade', pace: 'Balanced', travel: '25 min', playgrounds: 3, morning: 'Take the Achensee boat to Pertisau. The boat ride is the attraction, so keep the crossing leisurely.', afternoon: 'Play along the promenade, visit the small animal enclosures, and choose a short valley walk toward Falzthurn.', reset: 'Turn around at the first signs of tiredness; there is no prize for reaching the valley end.', snack: 'Kaiserschmarrn to share', tags: ['boat', 'animals', 'stroller easy'] },
    { day: 10, base: 'Hotel Buchau', title: 'A castle with a tractor assist', subtitle: 'Tratzberg Castle + Jenbach play stop', pace: 'Balanced', travel: '25 min', playgrounds: 2, morning: 'Visit Schloss Tratzberg and use the slow tractor shuttle uphill. The audio tour keeps the castle portion contained.', afternoon: 'Stop in Jenbach for lunch and a playground break before returning to the lake.', reset: 'Keep a quiet activity ready for the castle tour.', snack: 'Lunch in Jenbach before the bus back', tags: ['castle', 'train friendly', 'short tour'] },
    { day: 11, base: 'Hotel Buchau', title: 'Crystal clouds & play towers', subtitle: 'Swarovski Kristallwelten', pace: 'Big day', travel: '50 min', playgrounds: 4, morning: 'Head to Wattens early for the Chambers of Wonder before crowds and sensory overload build.', afternoon: 'Spend most of the visit outside at the playtower, carousel, maze, and garden play areas.', reset: 'The toddler may prefer the garden to dark indoor exhibits. Split up if needed.', snack: 'Early lunch before the playtower', tags: ['playground star', 'art', 'rain option'] },
    { day: 12, base: 'Hotel Buchau', title: 'Innsbruck, kid-height', subtitle: 'Alpine Zoo + riverside play', pace: 'Big day', travel: '55 min', playgrounds: 3, morning: 'Train to Innsbruck, then take the Hungerburg funicular toward Alpenzoo. Focus on bears, otters, and farm animals.', afternoon: 'Return to the Inn promenade for playground time, then make a short Old Town loop for the Golden Roof.', reset: 'Use transit uphill; save everyone’s legs for the zoo paths.', snack: 'Choose an Old Town bakery, not a long lunch', tags: ['animals', 'funicular', 'city day'] },
    { day: 13, base: 'Hotel Buchau', title: 'Steam trains & splash landings', subtitle: 'Achensee Railway + lakeside finale', pace: 'Balanced', travel: '20 min', playgrounds: 3, morning: 'Ride the historic steam railway from Jenbach toward the lake if its seasonal timetable aligns with your dates.', afternoon: 'Return to your favorite Buchau playground and beach. Let the children choose the final activity.', reset: 'If the railway is not running, swap in Erlebnistherme Zillertal in Fügen.', snack: 'Celebration ice cream by the lake', tags: ['steam train', 'water play', 'flex day'] },
    { day: 14, base: 'Hotel Buchau', title: 'One last swing', subtitle: 'Slow breakfast + departure', pace: 'Low-key', travel: 'Varies', playgrounds: 1, morning: 'Pack most bags before breakfast, then revisit the closest lakeside playground for a final burst of movement.', afternoon: 'Transfer through Jenbach with generous platform time and snacks where small hands can reach them.', reset: 'Leave one complete outfit and comfort toy outside the packed luggage.', snack: 'Use up picnic supplies on the train', tags: ['departure', 'low stress', 'local'] },
];

function Icon({ name }: { name: 'pin' | 'train' | 'play' | 'clock' | 'check' | 'arrow' }) {
    const paths = {
        pin: <><path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
        train: <><rect x="5" y="3" width="14" height="15" rx="3" /><path d="M8 21l2-3m6 3-2-3M8 8h8m-8 4h.01M16 12h.01" /></>,
        play: <><path d="M5 20v-8m14 8v-8M3 20h18M8 12l4-8 4 8M6 15h12" /></>,
        clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
        check: <path d="m5 12 4 4L19 6" />,
        arrow: <><path d="M5 12h14m-5-5 5 5-5 5" /></>,
    };
    return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function App() {
    const [filter, setFilter] = useState<'All' | Pace>('All');
    const [selectedDay, setSelectedDay] = useState(1);
    const [saved, setSaved] = useState<number[]>([3, 7, 11]);
    const selected = days.find((day) => day.day === selectedDay) ?? days[0];
    const visibleDays = days.filter((day) => filter === 'All' || day.pace === filter);

    const toggleSaved = (day: number) => {
        setSaved((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
    };

    return (
        <main>
            <header className="topbar">
                <a className="brand" href="#top" aria-label="Little Legs, Big Alps home">
                    <span className="brand-mark"><i /><i /><i /></span>
                    <span><strong>Little Legs, Big Alps</strong><small>Munich → Achensee</small></span>
                </a>
                <nav aria-label="Trip sections"><a href="#plan">The plan</a><a href="#rhythm">Trip rhythm</a></nav>
                <button className="saved-pill" onClick={() => setFilter('All')}><span>♥</span> {saved.length} saved</button>
            </header>

            <section className="hero" id="top">
                <div className="hero-copy">
                    <div className="eyebrow"><span>14 DAYS</span><i />2 BASES<i />2 LITTLE EXPLORERS</div>
                    <h1>More swings.<br />Fewer <em>“are we there yet?”</em></h1>
                    <p>A playground-first family route from Munich to Hotel Buchau, paced for a curious 6-year-old and a napping 2-year-old.</p>
                    <a className="primary-button" href="#plan">Start the adventure <Icon name="arrow" /></a>
                </div>
                <div className="route-card" aria-label="Trip route from Munich to Hotel Buchau">
                    <div className="route-art">
                        <span className="sun" />
                        <span className="mountain mountain-one" />
                        <span className="mountain mountain-two" />
                        <span className="lake" />
                        <span className="route-line" />
                        <span className="route-dot munich-dot" /><span className="route-dot buchau-dot" />
                    </div>
                    <div className="route-stops">
                        <div><span className="stop-number">01</span><p><strong>Munich</strong><small>5 nights · city parks</small></p></div>
                        <Icon name="train" />
                        <div><span className="stop-number accent">02</span><p><strong>Hotel Buchau</strong><small>8 nights · lake & Alps</small></p></div>
                    </div>
                </div>
            </section>

            <section className="rhythm" id="rhythm">
                <div className="rhythm-intro"><span className="section-label">BUILT FOR REAL FAMILY DAYS</span><h2>The 3–2–1 rhythm</h2></div>
                <div className="rhythm-item"><strong>3</strong><span><b>Play breaks</b><small>morning, lunch, late afternoon</small></span></div>
                <div className="rhythm-item"><strong>2</strong><span><b>Anchor activities</b><small>never an endless checklist</small></span></div>
                <div className="rhythm-item"><strong>1</strong><span><b>Protected reset</b><small>nap, pool, or quiet hotel hour</small></span></div>
            </section>

            <section className="planner" id="plan">
                <div className="planner-heading">
                    <div><span className="section-label">YOUR DAY-BY-DAY GUIDE</span><h2>Fourteen days, ready to roam</h2><p>Select a day for the gentle version of exactly what to do.</p></div>
                    <div className="filters" aria-label="Filter itinerary by pace">
                        {(['All', 'Low-key', 'Balanced', 'Big day'] as const).map((pace) => <button className={filter === pace ? 'active' : ''} onClick={() => setFilter(pace)} key={pace}>{pace}</button>)}
                    </div>
                </div>

                <div className="planner-grid">
                    <div className="day-list">
                        {visibleDays.map((day) => (
                            <article className={`day-card ${selected.day === day.day ? 'selected' : ''}`} key={day.day} onClick={() => setSelectedDay(day.day)}>
                                <div className="day-number"><small>DAY</small><strong>{String(day.day).padStart(2, '0')}</strong></div>
                                <div className="day-main"><span className={`base-tag ${day.base === 'Hotel Buchau' ? 'alps' : ''}`}><Icon name="pin" />{day.base}</span><h3>{day.title}</h3><p>{day.subtitle}</p></div>
                                <div className="day-meta"><span><Icon name="play" />{day.playgrounds} play stops</span><span><Icon name="clock" />{day.pace}</span></div>
                                <button className={`save-button ${saved.includes(day.day) ? 'saved' : ''}`} aria-label={`${saved.includes(day.day) ? 'Unsave' : 'Save'} day ${day.day}`} onClick={(event) => { event.stopPropagation(); toggleSaved(day.day); }}>♥</button>
                            </article>
                        ))}
                    </div>

                    <aside className="day-detail">
                        <div className="detail-photo">
                            <span className="detail-cloud cloud-one" /><span className="detail-cloud cloud-two" />
                            <span className="detail-mountain back" /><span className="detail-mountain front" />
                            <span className="detail-grass" /><span className="detail-tree tree-one" /><span className="detail-tree tree-two" />
                            <span className="detail-swing"><i /><i /></span>
                            <span className="detail-badge">DAY {selected.day} · {selected.base.toUpperCase()}</span>
                        </div>
                        <div className="detail-content">
                            <div className="detail-title"><div><span>{selected.pace} pace</span><h2>{selected.title}</h2></div><button className={saved.includes(selected.day) ? 'saved' : ''} onClick={() => toggleSaved(selected.day)}>♥</button></div>
                            <div className="detail-stat-row"><span><Icon name="clock" /><b>{selected.travel}</b> transit</span><span><Icon name="play" /><b>{selected.playgrounds}</b> play stops</span></div>
                            <ol className="timeline">
                                <li><span>AM</span><div><strong>Start curious</strong><p>{selected.morning}</p></div></li>
                                <li><span>PM</span><div><strong>Follow the fun</strong><p>{selected.afternoon}</p></div></li>
                                <li className="reset"><span><Icon name="check" /></span><div><strong>Protect the reset</strong><p>{selected.reset}</p></div></li>
                            </ol>
                            <div className="snack-note"><span>PACK THIS</span><p>{selected.snack}</p></div>
                            <div className="tag-row">{selected.tags.map((tag) => <span key={tag}>#{tag.replace(' ', '-')}</span>)}</div>
                        </div>
                    </aside>
                </div>
            </section>

            <section className="parent-note">
                <div className="note-mark">“</div><div><span className="section-label">THE GOLDEN RULE</span><blockquote>The best day is the one where everyone still has enough energy for one last swing.</blockquote><p>Check seasonal timetables, attraction opening days, and mountain weather before setting out. Every day here has permission to become a playground-and-ice-cream day.</p></div>
            </section>

            <footer><span><b>Little Legs, Big Alps</b> · A family-first travel plan</span><span>14 days · Munich · Jenbach & Achensee</span></footer>
        </main>
    );
}

export default App;
